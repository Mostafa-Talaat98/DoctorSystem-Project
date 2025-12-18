import userModel from "../../DB/models/auth.model.js";
import { sendVerifyPhoneOtp } from "./Otp/otp.service.js";
import bcrypt from "bcryptjs";

export const register = async (req, res, next) => {
  try {
    const {
      userName,
      email,
      password,
      phoneNumber,
      role = "PATIENT",
    } = req.body;

    const userCheck = await userModel.findOne({ email });
    if (userCheck) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      userName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
    });

    try {
      await sendVerifyPhoneOtp({ phoneNumber });
    } catch (otpError) {
      console.error("Failed sending OTP:", otpError);
    }

    return res
      .status(201)
      .json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    next(error);
  }
};
