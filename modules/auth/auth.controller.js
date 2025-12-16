import userModel from "../../DB/models/auth.model";

export const register = async (req, res, next) => {
  try {
    const { userName, email, password, phoneNumber } = req.body;

    const userCheck = await userModel.findOne({ email });
    if (userCheck) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await userModel.create({
      userName,
      email,
      password,
      phoneNumber,
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    next(new Error(error.message));
  }
};