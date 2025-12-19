import { Router } from "express";
import {
  patientSignUpSchema,
  doctorSignUpSchema,
  otpValidationSchema,
  reSendOTPSchema,
} from "./auth.schema.js";
import { asyncHandler } from "../../utils/catchAsync.js";
import {
  registerPatient,
  verifyPatientAccount,
} from "./patient/auth.controller.js";
import {
  registerDoctor,
  verifyDoctorAccount,
} from "./doctor/auth.controller.js";
import validateRequest from "../middleware/validateRequest.middleware.js";
import { DoctorModel, PatientModel } from "../../DB/models/auth.model.js";
import AppError from "../../utils/AppError.js";
import { reSendEmailOtp } from "./Otp/otp.service.js";

const authRouter = Router();

/*                      Doctor                       */

authRouter.post(
  "/doctor/register",
  validateRequest(doctorSignUpSchema),
  asyncHandler(registerDoctor)
);

/*                      Patient                       */

authRouter.post(
  "/patient/register",
  validateRequest(patientSignUpSchema),
  asyncHandler(registerPatient)
);

/*                      Shared                       */

authRouter.post(
  "/re-send-otp",
  validateRequest(reSendOTPSchema),
  reSendEmailOtp
);

authRouter.post(
  "/verify-account",
  validateRequest(otpValidationSchema),

  asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const [patient, doctor] = await Promise.all([
      PatientModel.findOne({ email }),
      DoctorModel.findOne({ email }),
    ]);

    if (!patient && !doctor) {
      throw new AppError("Verification Error", "Account not found", 404);
    }

    if ((patient && patient.isVerified) || (doctor && doctor.isVerified)) {
      throw new AppError("Verification Error", "Account already verified", 400);
    }

    if (doctor) {
      return verifyDoctorAccount(req, res, next);
    }

    if (patient) {
      return verifyPatientAccount(req, res, next);
    }
  })
);

export default authRouter;
