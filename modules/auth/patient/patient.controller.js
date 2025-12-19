import bcrypt from "bcryptjs";
import { DoctorModel, PatientModel } from "../../../DB/models/auth.model.js";
import { sendVerifyEmailOtp } from "../Otp/otp.service.js";
import {
  decodeString,
  encodeString,
} from "../../../utils/security/encryption.js";
import { ApplicationException } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";

export const registerPatient = async (req, res, next) => {
  const { fullName, email, password, phoneNumber, birthday } = req.body;

  const [patientCheck, doctorCheck] = await Promise.all([
    PatientModel.findOne({ email }),
    DoctorModel.findOne({ email }),
  ]);

  if (patientCheck || doctorCheck) {
    throw new ApplicationException("Email already exists");
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

  return successResponse({
    res,
    statusCode: 201,
    message: "registered successfully",
    info: "Almost there! Please verify your email to complete your registration.",
  });
};