import { Router } from "express";
import {
  otpValidationSchema,
  reSendOTPSchema,
  signInWithEmailSchema,
  registerWithGoogleSchema,
  refreshTokenSchema,
} from "./auth.schema.js";
import {
  validateCookies,
  validateRequest,
} from "../../middleware/validateRequest.middleware.js";
import { reSendEmailOtp } from "./Otp/otp.service.js";
import {
  login,
  loginWithGmail,
  refreshSession,
  verifyAccount,
} from "./auth.service.js";
import patientRouter from "./patient/patient.controller.js";
import doctorAuthRouter from "./doctor/doctor.controller.js";

const authRouter = Router();

authRouter.use(doctorAuthRouter);

authRouter.use(patientRouter);

// ===========================  Shared ===========================

authRouter.get("/refresh", validateCookies(refreshTokenSchema), refreshSession);

authRouter.post(
  "/re-send-otp",
  validateRequest(reSendOTPSchema),
  reSendEmailOtp
);

authRouter.post("/login", validateRequest(signInWithEmailSchema), login);

authRouter.post("/verify-account", validateRequest(otpValidationSchema));

authRouter.post(
  "/google/login",
  validateRequest(registerWithGoogleSchema),
  loginWithGmail
);

authRouter.post(
  "/verify-account",
  validateRequest(otpValidationSchema),
  verifyAccount
);

export default authRouter;