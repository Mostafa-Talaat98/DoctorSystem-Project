import bcrypt from 'bcryptjs';
import { patientSchema } from '../../../DB/models/auth.model.js';
import AppError from '../../../utils/AppError.js';
import { verifyEmailOtp } from '../Otp/otp.service.js';

export const registerPatient = async (req, res, next) => {
    const { fullName, email, password, phoneNumber, birthday } = req.body;

    const patientCheck = await patientSchema.findOne({ email });
    if (patientCheck) {
      throw new AppError('Sign up Error', 'Email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await patientSchema.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      birthday,
    });

    await verifyEmailOtp({ email });

    return res.status(201).json({
      message: 'User registered successfully',
      userId: patient._id,
    });
};
