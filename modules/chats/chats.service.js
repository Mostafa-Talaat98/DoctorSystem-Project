import { Types } from "mongoose";
import ChatModel from "../../DB/models/chat.model.js";
import DoctorModel from "../../DB/models/DoctorSchema.js";
import PatientModel from "../../DB/models/patientSchema.js";
import { connectedSockets } from "./connected.sockets.js";
import { successResponse } from "../../utils/response/success.response.js";


export const sendMessage = async (socket ,io, data, callback) => {


    try {
      const { receiverId, content, type } = data;
      const senderId = socket.user.userId;

      if (!receiverId || !content || !type) {
        callback("Message Must Be Provided [receiverId, content, type]");
      }

      if (receiverId.toString() === senderId.toString()) {
        callback("Cannot message yourself");
      }

      if (!Types.ObjectId.isValid(receiverId)) {
        callback("ReceiverId Is Not ObjectId ");
      }

      const [isDoctorSender, isPatientSender] = await Promise.all([
        DoctorModel.findById(senderId),
        PatientModel.findById(senderId),
      ]);

      const [isDoctorReceiver, isPatientReceiver] = await Promise.all([
        DoctorModel.findById(receiverId),
        PatientModel.findById(receiverId),
      ]);

      if (!isDoctorReceiver && !isPatientReceiver) {
        callback("ReceiverId Not Found");
      }

      if (isDoctorSender && isDoctorReceiver) {
        callback("Doctors Cannot Talk to each others");
      }

      if (isPatientSender && isPatientReceiver) {
        callback("Patients Talk to each others");
      }

      // Find or create chat
      let chat = await ChatModel.findOne({
        participants: {
          $all: [
            new Types.ObjectId(senderId.toString()),
            new Types.ObjectId(receiverId.toString()),
          ],
        },
      });

      if (!chat) {
        chat = await ChatModel.create({
          participants: [
            new Types.ObjectId(senderId.toString()),
            new Types.ObjectId(receiverId.toString()),
          ],
        });
      }

      const message = {
        content,
        createdBy: senderId,
      };

      chat.messages.push(message);

      await chat.save();

      const senderSockets = connectedSockets.get(senderId.toString());
      const receiverSockets = connectedSockets.get(receiverId.toString());

      if (senderSockets && senderSockets.size > 0) {
        io.to([...senderSockets]).emit("success-message", {
          content: message.content,
        });
      }

      if (receiverSockets && receiverSockets.size > 0) {
        io.to([...receiverSockets]).emit("new-message", {
          content: message.content,
          from: senderId,
        });
      }

      callback("Message sent Success");
    } catch (error) {
      callback(error);
    }


};

//Get all chats for logged-in user
 const getChats = async (req, res, next) => {
  const userId = req.user._id;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const messagesPage = Number(req.query.messagesPage) || 1;
  const messagesLimit = Number(req.query.messagesLimit) || 10;
  const messagesSkip = (messagesPage - 1) * messagesLimit;

  const chats = await ChatModel.aggregate([
    {
      $match: {
        participants: { $in: [userId] },
      },
    },

    { $sort: { updatedAt: -1 } },

    { $skip: skip },
    { $limit: limit },

    {
      $project: {
        participants: 1,
        lastMessage: 1,
        messages: {
          $slice: ["$messages", messagesSkip, messagesLimit],
        },
        totalMessages: { $size: "$messages" },
      },
    },
  ]);

  return successResponse({
    res,
    data: {
      chats
    },
  });
};

// Get messages of a chat
 const getMessages = async (req, res, next) => {
  const { userId } = req.params;
  
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  console.log(req.params)

  if (!Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User id" });
  }

  const messages = await ChatModel.aggregate([
    {
      $match: {
        participants: { $in: [req.user._id, userId] },
      },
    },

    { $sort: { updatedAt: -1 } },

    {
      $project: {
        participants: 1,
        lastMessage: 1,
        messages: {
          $slice: ["$messages", skip, limit],
        },
        totalMessages: { $size: "$messages" },
      },
    },
  ]);

  return successResponse({
    res,
    data: {
      messages,
    },
  });
};


export const chatRestService = {getChats , getMessages} 


//Mark messages as read
// export const markAsRead = async (req, res, next) => {
//   const { chatId } = req.params;
//   const userId = req.user._id;

//   const chat = await Chat.findById(chatId);
//   if (!chat) {
//     return res.status(404).json({ message: "Chat not found" });
//   }

//   await Message.updateMany(
//     { chat: chatId, receiver: userId, isRead: false },
//     { isRead: true }
//   );

//   chat.unreadCount.set(userId.toString(), 0);
//   await chat.save();

//   res.json({ message: "Messages marked as read" });
// };

// Favorite / Unfavorite chat
// export const toggleFavorite = async (req, res, next) => {
//   const { chatId } = req.params;
//   const userId = req.user._id.toString();

//   const chat = await Chat.findById(chatId);
//   if (!chat) {
//     return res.status(404).json({ message: "Chat not found" });
//   }

//   const index = chat.favorites.findIndex(
//     (id) => id.toString() === userId
//   );

//   if (index > -1) {
//     chat.favorites.splice(index, 1);
//   } else {
//     chat.favorites.push(userId);
//   }

//   await chat.save();

//   res.json({ favorites: chat.favorites });
// };
