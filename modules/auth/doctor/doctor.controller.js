import bcrypt from "bcrypt";
import { sendVerifyEmailOtp } from "../Otp/otp.service.js";
import { DoctorModel, PatientModel } from "../../../DB/models/auth.model.js";
import { ConflictException } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";

export const registerDoctor = async (req, res) => {
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
    throw new ConflictException("Email already exists");
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

  return successResponse({
    res,
    statusCode:201,
    message: "registered successfully",
    info: "Almost there! Please verify your email to complete your registration.",
  });
};