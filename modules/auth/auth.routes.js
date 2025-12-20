import { Router } from 'express';
import {
  otpValidationSchema,
  reSendOTPSchema,
  signInWithEmailSchema,
  registerWithGoogleSchema,
  refreshTokenSchema,
} from './auth.schema.js';
import { validateCookies, validateRequest } from '../middleware/validateRequest.middleware.js';
import { reSendEmailOtp } from './Otp/otp.service.js';
import { login, loginWithGmail, refreshSession, verifyAccount } from './auth.controller.js';
import { BadRequestException, NotFoundException } from '../../utils/response/error.response.js';
import doctorRouter from './doctor/doctor.routes.js';
import patientRouter from './patient/patient.routes.js';
import { PatientModel } from '../../DB/models/patient.model.js';
import { DoctorModel } from '../../DB/models/doctor.model.js';
import { authenticateUser } from '../middleware/authenticateUser.middleware.js';
import { successResponse } from '../../utils/response/success.response.js';

const authRouter = Router();

authRouter.use(doctorRouter);

authRouter.use(patientRouter);

// ===========================  Shared ===========================

authRouter.get('/refresh', validateCookies(refreshTokenSchema), refreshSession);

authRouter.post('/re-send-otp', validateRequest(reSendOTPSchema), reSendEmailOtp);

authRouter.post('/login', validateRequest(signInWithEmailSchema), login);

authRouter.post('/verify-account', validateRequest(otpValidationSchema));

authRouter.post('/google/login', validateRequest(registerWithGoogleSchema), loginWithGmail);

authRouter.post('/verify-account', validateRequest(otpValidationSchema), verifyAccount);


export default authRouter;
