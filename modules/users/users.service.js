import DoctorModel from "../../DB/models/DoctorSchema.js";
import PatientModel from "../../DB/models/patientSchema.js";
import { deleteImageFromCloudinary } from "../../utils/cloudinary/cloudinary.delete.js";
import { uploadToCloudinary } from "../../utils/cloudinary/cloudinary.upload.js";
import {
  ApplicationException,
  BadRequestException,
} from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";


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
    deleteImageFromCloudinary(user.image.public_id);
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
    },
  });
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

    const isLiked = doctor.likes
      ? doctor.likes.some(
          (id) => (id._id || id).toString() === patientId.toString()
        )
      : false;

    if (isLiked) {
      await DoctorModel.findByIdAndUpdate(doctorId, {
        $pull: { likes: patientId },
      });
      await PatientModel.findByIdAndUpdate(patientId, {
        $pull: { favorites: doctorId },
      });
      res
        .status(200)
        .json({ message: "Doctor unlike successfully", isLiked: false });
    } else {
      await DoctorModel.findByIdAndUpdate(doctorId, {
        $addToSet: { likes: patientId },
      });
      await PatientModel.findByIdAndUpdate(patientId, {
        $addToSet: { favorites: doctorId },
      });
      res
        .status(200)
        .json({ message: "Doctor liked successfully", isLiked: true });
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
      filter.specialty = new RegExp(`^${specialty}$`, "i");
    }

    const doctors = await DoctorModel.find(filter);

    if (doctors.length === 0) {
      return res
        .status(404)
        .json({ message: "No specialty found with this name" });
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
      filter.fullName = new RegExp(name, "i");
    }

    const doctors = await DoctorModel.find({ ...filter, isActive: true });

    if (doctors.length === 0) {
      return res
        .status(404)
        .json({ message: "No doctor found with this name" });
    }
    res.status(200).json({ count: doctors.length, data: doctors });
  } catch (error) {
    console.error("Error fetching doctors by name:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

