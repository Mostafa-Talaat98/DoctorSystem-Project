import { DoctorModel, PatientModel } from '../../DB/models/auth.model.js';
import { NotFoundException, UnAuthorizedException } from '../../utils/response/error.response.js';
import { successResponse } from '../../utils/response/success.response.js';
import { compareHash } from '../../utils/security/hash.js';
import { verifyEmailOtp } from './Otp/otp.service.js';
import { verifyGmailAccount } from './googleAuthentication/googleAuthentication.service.js';
import { createToken } from '../../utils/security/jwtToken.js';

/**
 * @description Middleware/controller to verify a user's account using an OTP code.
 * Sets `isVerified` to true on the user document after successful OTP verification.
 *
 * @param {Mongoose.Model} Model - The Mongoose model to search for the user (e.g. Doctor, Patient)
 * @returns {Function} Express middleware/controller
 *
 * @body {string} email - The email of the user to verify
 * @body {string} otpCode - The OTP code sent to the user's email
 *
 * @throws {NotFoundException} If the user with the given email is not found
 * @throws {Error} If OTP verification fails inside verifyEmailOtp
 *
 * @example
 * router.post("/verify-email", verifyAccount(Patient));
 */
export const verifyAccount = (Model) => async (req, res, next) => {
  const { email, otpCode } = req.body;

  await verifyEmailOtp({ email, code: otpCode });

  const user = await Model.findOneAndUpdate({ email }, { isVerified: true }, { new: true }).select(
    '-password -__v -createdAt -updatedAt'
  );

  if (!user) throw new NotFoundException('Verification Error', 'User not found');

  return successResponse({
    res,
    statusCode: 200,
    message: 'Email verified successfully',
    data: user,
  });
};

/**
 * @description Login controller for doctor and patient users.
 * Accepts email + password, validates user, and returns JWT token.
 * @route POST /auth/login
 * @body {string} email - User email
 * @body {string} password - User password
 * @returns {object} JWT token and user info
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new UnAuthorizedException('Email and password are required');

  const user = (await DoctorModel.findOne({ email })) || (await PatientModel.findOne({ email }));

  if (!user) throw new UnAuthorizedException('Invalid credentials');
  if (user.provider === 'Google')
    throw new UnAuthorizedException('Not Registered Account Or Registered With Another Provider');
  const isMatch = await compareHash(password, user.password);
  if (!isMatch) throw new UnAuthorizedException('Invalid credentials');

  const payload = { userId: user._id, email: user.email };
  const token = createToken(payload);

  if (!user.isVerified) throw new UnAuthorizedException('Account not verified. Please verify your email to proceed.');

  return successResponse({
    res,
    statusCode: 200,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
      },
      token,
    },
  });
};

export const loginWithGmail = async (req, res) => {
  const { id_token } = req.body;

  const { email } = await verifyGmailAccount(id_token);

  const [patient, doctor] = await Promise.all([
    PatientModel.findOne({
      email,
    }),

    DoctorModel.findOne({
      email,
    }),
  ]);

  const user = doctor || patient || null;

  if (!user) throw new NotFoundException('Not Registered Account Or Registered With Another Provider');
  const payload = { userId: user._id, email: user.email };
  const token = createToken(payload);

  return successResponse({
    res,
    statusCode: 200,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
      },
      token,
    },
  });
};
