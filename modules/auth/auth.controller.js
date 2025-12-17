import userModel from "../../DB/models/auth.model.js";
import bcrypt from "bcryptjs";
export const register = async (req, res, next) => {
  try {
    const { userName, email, password, phoneNumber, role } = req.body;

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

    sendVerifyPhoneOtp({ phoneNumber });

    return res
      .status(201)
      .json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    next(new Error(error.message));
  }
};
