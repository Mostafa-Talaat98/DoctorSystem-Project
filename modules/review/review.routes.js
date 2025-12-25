import { Router } from "express";
import * as reviewController from "./review.controller.js";
import { authenticateUser } from "../middleware/authenticateUser.middleware.js";
import { validateRequest } from "../middleware/validateRequest.middleware.js";
import { createReviewSchema } from "./review.schema.js";
import PatientModel from "../../DB/models/patientSchema.js";

const router = Router();

// إضافة تقييم (للمرضى فقط)
router.post(
  "/",
  authenticateUser([PatientModel]), // السماح للمرضى فقط
  validateRequest(createReviewSchema),
  reviewController.addReview
);

// جلب تقييمات دكتور معين (عام)
router.get("/:doctorId", reviewController.getDoctorReviews);

export default router;
