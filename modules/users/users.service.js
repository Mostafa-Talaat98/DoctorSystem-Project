import DoctorModel from "../../DB/models/DoctorSchema.js";
import PatientModel from "../../DB/models/patientSchema.js";
import { deleteImageFromCloudinary } from "../../utils/cloudinary/cloudinary.delete.js";
import { uploadToCloudinary } from "../../utils/cloudinary/cloudinary.upload.js";
import {
  ApplicationException,
  BadRequestException,
} from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import Chat from "./chat.model.js";
import Message from "./message.model.js";
import mongoose from "mongoose";


export const uploadProfilePicture = async (req, res) => {
  const { user } = req;
  const image = req.file;

  if (!image) {
    throw new BadRequestException("No image uploaded");
  }

  const { secure_url, public_id } = await uploadToCloudinary(
    image,
    `Doctor_Appointment/users/${user._id}`
  );

  if (!secure_url || !public_id) {
    throw new ApplicationException("Fail to upload image");
  }

  let model;
  switch (user.role) {
    case "doctor":
      model = DoctorModel;
      break;

    case "patient":
      model = PatientModel;
      break;

    default:
      break;
  }


  if (user.image.public_id) {
    deleteImageFromCloudinary(user.image.public_id)
  }

  const updated = await model.updateOne(
    {
      _id: user._id,
    },
    {
      image: {
        url: secure_url,
        public_id,
      },
    }
  );


  if (!updated.modifiedCount) {
    throw new ApplicationException("Fail to upload image");
  }



  return successResponse({
    res,
    message: "Profile picture updated success",
    data: {
      url: secure_url,
      public_id,
    }
  })
};


// ============================================== 
//Doctor Routes
// ============================================== 

export const toggleLike = async (req, res) => {
  try {
    const { id: doctorId } = req.params;

    const patientId = req.user._id;

    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const isLiked = doctor.likes ? doctor.likes.some(id => (id._id || id).toString() === patientId.toString()) : false;

    if (isLiked) {
      await DoctorModel.findByIdAndUpdate(doctorId, { $pull: { likes: patientId } });
      await PatientModel.findByIdAndUpdate(patientId, { $pull: { favorites: doctorId } });
      res.status(200).json({ message: "Doctor unlike successfully", isLiked: false });
    } else {
      await DoctorModel.findByIdAndUpdate(doctorId, { $addToSet: { likes: patientId } });
      await PatientModel.findByIdAndUpdate(patientId, { $addToSet: { favorites: doctorId } });
      res.status(200).json({ message: "Doctor liked successfully", isLiked: true });
    }

  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorModel.find({ isActive: true });
    res.status(200).json({ count: doctors.length, data: doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getDoctorBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;
    let filter = {};

    if (specialty) {
      filter.specialty = new RegExp(`^${specialty}$`, 'i');
    }

    const doctors = await DoctorModel.find(filter);

    if (doctors.length === 0) {
      return res.status(404).json({ message: "No specialty found with this name" });
    }

    res.status(200).json({ count: doctors.length, data: doctors });
  } catch (error) {
    console.error("Error fetching doctors by specialty:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getDoctorById = async (req, res) => {
  try {

    const doctor = await DoctorModel.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ data: doctor });
  } catch (error) {
    console.error("Error fetching doctor:", error);
  }
};

export const getDoctorByName = async (req, res) => {
  try {
    const { name } = req.query;
    let filter = {};

    if (name) {
      filter.fullName = new RegExp(name, 'i');
    }

    const doctors = await DoctorModel.find({ ...filter, isActive: true });

    if (doctors.length === 0) {
      return res.status(404).json({ message: "No doctor found with this name" });
    }
    res.status(200).json({ count: doctors.length, data: doctors });
  } catch (error) {
    console.error("Error fetching doctors by name:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//======================================================
//Chat Routes
//======================================================

//Get all chats for logged-in user
export const getChats = async (req, res, next) => {
  const userId = req.user._id;

  const chats = await Chat.find({
    $or: [{ doctor: userId }, { patient: userId }],
    status: "active",
  })
    .populate("doctor", "name specialty")
    .populate("patient", "name")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.json(chats);
};

// Get messages of a chat 
export const getMessages = async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chat id" });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // Authorization: user must be part of the chat
  if (
    chat.doctor.toString() !== userId.toString() &&
    chat.patient.toString() !== userId.toString()
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const messages = await Message.find({ chat: chatId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ page, messages });
};

//Send message (create chat if not exists)
export const sendMessage = async (req, res, next) => {
  const senderId = req.user._id;
  const { receiverId, content, type = "text" } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Determine roles (Doctor ↔ Patient)
  const isDoctorSender = req.user.role === "DOCTOR";

  const chatQuery = isDoctorSender
    ? { doctor: senderId, patient: receiverId }
    : { doctor: receiverId, patient: senderId };

  let chat = await Chat.findOne(chatQuery);

  // Create chat if first message
  if (!chat) {
    chat = await Chat.create(chatQuery);
  }

  const message = await Message.create({
    chat: chat._id,
    sender: senderId,
    receiver: receiverId,
    content,
    type,
  });

  // Update chat metadata
  chat.lastMessage = message._id;

  const receiverUnread =
    chat.unreadCount.get(receiverId.toString()) || 0;
  chat.unreadCount.set(receiverId.toString(), receiverUnread + 1);

  await chat.save();

  res.status(201).json(message);
};

//Mark messages as read
export const markAsRead = async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  await Message.updateMany(
    { chat: chatId, receiver: userId, isRead: false },
    { isRead: true }
  );

  chat.unreadCount.set(userId.toString(), 0);
  await chat.save();

  res.json({ message: "Messages marked as read" });
};


// Favorite / Unfavorite chat
export const toggleFavorite = async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user._id.toString();

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const index = chat.favorites.findIndex(
    (id) => id.toString() === userId
  );

  if (index > -1) {
    chat.favorites.splice(index, 1);
  } else {
    chat.favorites.push(userId);
  }

  await chat.save();

  res.json({ favorites: chat.favorites });
};
