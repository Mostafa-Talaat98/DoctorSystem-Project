import { Router } from 'express';
import {
  patientSignUpSchema,
  doctorSignUpSchema,
  otpValidationSchema,
  reSendOTPSchema,
  signInWithEmailSchema,
} from './auth.schema.js';
import { asyncHandler } from '../../utils/catchAsync.js';
import { registerPatient } from './patient/patient.controller.js';
import { registerDoctor } from './doctor/doctor.controller.js';
import validateRequest from '../middleware/validateRequest.middleware.js';
import { DoctorModel, PatientModel } from '../../DB/models/auth.model.js';
import { reSendEmailOtp } from './Otp/otp.service.js';
import { loginWithEmail } from './auth.controller.js';
import { BadRequestException, NotFoundException } from '../../utils/response/error.response.js';

const authRouter = Router();

/*                      Doctor                       */

authRouter.post('/doctor/register', validateRequest(doctorSignUpSchema), asyncHandler(registerDoctor));

/*                      Patient                       */

authRouter.post('/patient/register', validateRequest(patientSignUpSchema), asyncHandler(registerPatient));

/*                      Shared                       */

authRouter.post('/re-send-otp', validateRequest(reSendOTPSchema), reSendEmailOtp);

authRouter.post('/login', validateRequest(signInWithEmailSchema), loginWithEmail);

authRouter.post(
  '/verify-account',
  validateRequest(otpValidationSchema),

  asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const [patient, doctor] = await Promise.all([PatientModel.findOne({ email }), DoctorModel.findOne({ email })]);

    if (!patient && !doctor) throw new NotFoundException('Verification Error', 'Account not found');

    if ((patient && patient.isVerified) || (doctor && doctor.isVerified))
      throw new BadRequestException('Verification Error', 'Account already verified');

    if (doctor) return verifyAccount(DoctorModel)(req, res, next);

    if (patient) return verifyAccount(PatientModel)(req, res, next);
  })
);

export default authRouter;
