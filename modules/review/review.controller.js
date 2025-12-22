import { ReviewModel } from "../../DB/models/review.model.js";
import { DoctorModel } from "../../DB/models/doctor.model.js";
import { successResponse } from "../../utils/response/success.response.js";
import {
  NotFoundException,
  BadRequestException,
} from "../../utils/response/error.response.js";

export const addReview = async (req, res) => {
  const { comment, rating, doctorId } = req.body;
  const patientId = req.user._id;

  // 1. التأكد من وجود الدكتور
  const doctor = await DoctorModel.findById(doctorId);
  if (!doctor) throw new NotFoundException("Doctor not found");

  // 2. إنشاء التقييم
  const review = await ReviewModel.create({
    comment,
    rating,
    patientId,
    doctorId,
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "Review added successfully",
    data: { review },
  });
};

export const getDoctorReviews = async (req, res) => {
  const { doctorId } = req.params;

  const reviews = await ReviewModel.find({ doctorId })
    .populate("patientId", "fullName image") // جلب بيانات المريض مع التقييم
    .sort("-createdAt");

  return successResponse({
    res,
    data: { reviews },
  });
};
