import bcrypt from 'bcrypt';
import { verifyEmailOtp } from '../Otp/otp.service.js';
import { doctorSchema } from '../../../DB/models/auth.model.js';
import AppError from '../../../utils/AppError.js';

export const registerDoctor = async (req, res, next) => {
    const { fullName, email, password, phoneNumber, birthday } = req.body;

    const doctorCheck = await doctorSchema.findOne({ email });

    if (doctorCheck) {
      throw new AppError('Sign up Error', 'Email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await doctorSchema.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      birthday,
    });

    await verifyEmailOtp({ email });

    return res.status(201).json({
      message: 'User registered successfully',
      userId: doctor._id,
    });
};
