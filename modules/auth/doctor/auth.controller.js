import bcrypt from "bcrypt";
import { sendVerifyEmailOtp, verifyEmailOtp } from "../Otp/otp.service.js";
import { DoctorModel, PatientModel } from "../../../DB/models/auth.model.js";
import AppError from "../../../utils/AppError.js";

export const registerDoctor = async (req, res, next) => {
  const { fullName, email, password, phoneNumber, birthday } = req.body;

  const [patient, doctor] = await Promise.all([
    PatientModel.findOne({
      email,
    }),

    DoctorModel.findOne({
      email,
    }),
  ]);

  if (patient || doctor) {
    throw new AppError("Fail To signup", "Email exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newDoctor = await DoctorModel.create({
    fullName,
    email,
    password: hashedPassword,
    phoneNumber,
    birthday,
  });

  const data = (({ password, createdAt, updatedAt, ...rest }) => rest)(
    newDoctor.toObject()
  );

  await sendVerifyEmailOtp({ email });

  return res.status(201).json({
    message: "User registered successfully",
    info: "Almost there! Please verify your email to complete your registration.",
    data,
  });
};

export const verifyDoctorAccount = async (req, res, next) => {
  const { email, otpCode } = req.body;

  await verifyEmailOtp({ email, code: otpCode });

  const doctor = await DoctorModel.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true }
  ).select("-password -__v -createdAt -updatedAt");

  if (!doctor) {
    throw new AppError("Verification Error", "Doctor not found", 404);
  }

  return res.status(200).json({
    message: "Email verified successfully",
    data: doctor,
  });
};