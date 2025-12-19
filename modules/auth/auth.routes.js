import { Router } from 'express';
import {
  patientSignUpSchema,
  doctorSignUpSchema,
  otpValidationSchema,
  reSendOTPSchema,
  signInWithEmailSchema,
} from './auth.schema.js';
import { patientRegisterWithGmail, registerPatient } from './patient/patient.controller.js';
import { doctorRegisterWithGmail, registerDoctor } from './doctor/doctor.controller.js';
import validateRequest from '../middleware/validateRequest.middleware.js';
import { DoctorModel, PatientModel } from '../../DB/models/auth.model.js';
import { reSendEmailOtp } from './Otp/otp.service.js';
import { login, loginWithGmail, verifyAccount } from './auth.controller.js';
import { BadRequestException, NotFoundException } from '../../utils/response/error.response.js';

const authRouter = Router();

// ===========================  Doctor ===========================

authRouter.post('/doctor/register', validateRequest(doctorSignUpSchema), registerDoctor);

authRouter.post('/doctor/google/register', doctorRegisterWithGmail);


// ===========================  Patient ===========================

authRouter.post('/patient/register', validateRequest(patientSignUpSchema), registerPatient);

authRouter.post('/patient/google/register', patientRegisterWithGmail);


// ===========================  Shared ===========================

authRouter.post('/re-send-otp', validateRequest(reSendOTPSchema), reSendEmailOtp);

authRouter.post('/login', validateRequest(signInWithEmailSchema), login);

authRouter.post('/verify-account', validateRequest(otpValidationSchema));

authRouter.post('/google/login', loginWithGmail);

authRouter.post(
  '/verify-account',
  validateRequest(otpValidationSchema),

  async (req, res, next) => {
    const { email } = req.body;

    const [patient, doctor] = await Promise.all([PatientModel.findOne({ email }), DoctorModel.findOne({ email })]);

    if (!patient && !doctor) throw new NotFoundException('Verification Error', 'Account not found');

    if ((patient && patient.isVerified) || (doctor && doctor.isVerified))
      throw new BadRequestException('Verification Error', 'Account already verified');

    if (doctor) return verifyAccount(DoctorModel)(req, res, next);

    if (patient) return verifyAccount(PatientModel)(req, res, next);
  }
);

export default authRouter;