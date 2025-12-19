import bcrypt from 'bcrypt';
import { sendVerifyEmailOtp } from '../Otp/otp.service.js';
import { DoctorModel, PatientModel } from '../../../DB/models/auth.model.js';
import { ConflictException } from '../../../utils/response/error.response.js';
import { successResponse } from '../../../utils/response/success.response.js';
import { verifyGmailAccount } from '../googleAuthentication/googleAuthentication.service.js';
import { ProviderType } from '../../../utils/types/user/user.types.js';
import { loginWithGmail } from '../auth.controller.js';

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
    throw new ConflictException('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newDoctor = await DoctorModel.create({
    fullName,
    email,
    password: hashedPassword,
    phoneNumber,
    birthday,
  });

  await sendVerifyEmailOtp({ email });

  return successResponse({
    res,
    statusCode: 201,
    message: 'registered successfully',
    info: 'Almost there! Please verify your email to complete your registration.',
  });
};

export const doctorRegisterWithGmail = async (req, res) => {
  const { id_token } = req.body;

  const { email, name, picture } = await verifyGmailAccount(id_token);
  const [patientCheck, doctorCheck] = await Promise.all([
    PatientModel.findOne({ email }),
    DoctorModel.findOne({ email }),
  ]);
  const user = patientCheck || doctorCheck;

  if (user) {
    if (user.provider === ProviderType.GOOGLE) return await loginWithGmail(req, res);

    throw new ConflictException('Invalid Provider', {
      userProvider: user.provider,
    });
  }
  const newUser = await DoctorModel.create({
    fullName: name,
    email,
    isVerified: true,
    provider: 'Google',
    image: {
      url: picture,
      public_id: 'GOOGLE_PROFILE_PICTURE',
    },
  });

  if (!newUser) throw new BadRequestException('Fail To Signup');

  return successResponse({
    res,
    info: 'Signup Success',
    data: { newUser },
  });
};
