import bcrypt from "bcryptjs";
import { DoctorModel, PatientModel } from "../../../DB/models/auth.model.js";
import AppError from "../../../utils/AppError.js";
import { sendVerifyEmailOtp, verifyEmailOtp } from "../Otp/otp.service.js";
import {
  decodeString,
  encodeString,
} from "../../../utils/security/encryption.js";

export const registerPatient = async (req, res, next) => {
  const { fullName, email, password, phoneNumber, birthday } = req.body;

  const [patientCheck, doctorCheck] = await Promise.all([
    PatientModel.findOne({ email }),
    DoctorModel.findOne({ email }),
  ]);

  if (patientCheck || doctorCheck) {
    throw new AppError("Fail To signup", "Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newPatient = await PatientModel.create({
    fullName,
    email,
    password: hashedPassword,
    phoneNumber: await encodeString(phoneNumber),
    birthday,
  });
  const data = (({ password, createdAt, updatedAt, __v, ...rest }) => rest)(
    newPatient.toObject()
  );

  data.phoneNumber = decodeString(data.phoneNumber);

  await sendVerifyEmailOtp({ email });

  return res.status(201).json({
    message: "User registered successfully",
    info: "Almost there! Please verify your email to complete your registration.",
    data,
  });
};