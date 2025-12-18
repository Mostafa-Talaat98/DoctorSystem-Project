import patientModel from "../../DB/models/auth.model.js";
import bcrypt from "bcryptjs";
import { sendVerifyEmailOtp } from "./Otp/otp.service.js";


export const register = async (req, res, next) => {
  try {
    const { userName, email, password, phoneNumber, role } = req.body;

    const patientCheck = await patientModel.findOne({ email });
    if (patientCheck) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await patientModel.create({
      userName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
    });

    sendVerifyEmailOtp({ email });

    return res
      .status(201)
      .json({ message: "User registered successfully", userId: patient._id });
  } catch (error) {
    next(error);
  }
};
