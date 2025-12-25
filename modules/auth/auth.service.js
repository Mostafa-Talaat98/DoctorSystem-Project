import { NotFoundException, UnAuthorizedException } from '../../utils/response/error.response.js';
import { successResponse } from '../../utils/response/success.response.js';
import { compareHash } from '../../utils/security/hash.security.js';
import { verifyEmailOtp } from './Otp/otp.service.js';
import { verifyGmailAccount } from './googleAuthentication/googleAuthentication.service.js';
import { createToken, getAuthConfig, validateToken } from '../../utils/security/jwtToken.security.js';
import { setResponseCookie } from '../../utils/security/cookie.security.js';
import DoctorModel from '../../DB/models/DoctorSchema.js';
import PatientModel from '../../DB/models/patientSchema.js';
import { Token } from '../../utils/types/token/token.types.js';

export const verifyAccount = async (req, res) => {
  const { email, otpCode } = req.body;

  const [patient, doctor] = await Promise.all([PatientModel.findOne({ email }), DoctorModel.findOne({ email })]);

  const userDoc = doctor || patient;

  if (!userDoc) throw new NotFoundException('Verification Error', 'Account not found');

  if (userDoc.isVerified) throw new BadRequestException('Verification Error', 'Account already verified');

  await verifyEmailOtp({ email, code: otpCode });

  const updatedUser = await userDoc.constructor
    .findOneAndUpdate({ email }, { isVerified: true }, { new: true })
    .select('-password -__v -createdAt -updatedAt');

  return successResponse({
    res,
    statusCode: 200,
    message: 'Email verified successfully',
    data: { user: updatedUser },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new UnAuthorizedException('Email and password are required');

  const user =
    (await DoctorModel.findOne({ email }).select('+password')) ||
    (await PatientModel.findOne({ email }).select('+password'));

  if (!user) throw new UnAuthorizedException('Invalid credentials');
  if (user.provider === 'Google')
    throw new UnAuthorizedException('Not Registered Account Or Registered With Another Provider');

  const isMatch = await compareHash(password, user.password);
  if (!isMatch) throw new UnAuthorizedException('Invalid credentials');

  const payload = { userId: user._id, email: user.email };

  const accessToken = await createToken(payload, Token.ACCESS_TOKEN);

  const refreshToken = await createToken(payload, Token.REFRESH_TOKEN, user._id);

  const { key: accessTokenKey, duration: accessTokenDuration } = getAuthConfig(Token.ACCESS_TOKEN);

  const { key: refreshTokenKey, duration: refreshTokenDuration } = getAuthConfig(Token.REFRESH_TOKEN);

  if (!user.isVerified) throw new UnAuthorizedException('Account not verified. Please verify your email to proceed.');

  setResponseCookie(res, accessTokenKey, accessToken, true, accessTokenDuration);
  setResponseCookie(res, refreshTokenKey, refreshToken, true, refreshTokenDuration);

  return successResponse({
    res,
    statusCode: 200,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
      },
    },
  });
};

export const loginWithGmail = async (req, res) => {
  const { id_token } = req.body;

  const { email } = await verifyGmailAccount(id_token);

  const [patient, doctor] = await Promise.all([PatientModel.findOne({ email }), DoctorModel.findOne({ email })]);

  const user = doctor || patient;

  if (!user) throw new NotFoundException('Account not found. Please register first.');

  const payload = { userId: user._id, email: user.email };

  const [accessToken, refreshToken] = await Promise.all([
    createToken(payload, Token.ACCESS_TOKEN),
    createToken(payload, Token.REFRESH_TOKEN, user._id),
  ]);

  const { key: AT_Key, duration: AT_Duration } = getAuthConfig(Token.ACCESS_TOKEN);
  const { key: RT_Key, duration: RT_Duration } = getAuthConfig(Token.REFRESH_TOKEN);

  setResponseCookie(res, AT_Key, accessToken, true, AT_Duration);
  setResponseCookie(res, RT_Key, refreshToken, true, RT_Duration);

  return successResponse({
    res,
    statusCode: 200,
    message: 'Google Login successful',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
      },
    },
  });
};

export const refreshSession = async (req, res) => {
  const user = await validateToken(req, [DoctorModel, PatientModel], Token.REFRESH_TOKEN);

  const payload = { userId: user._id, email: user.email };
  const accessToken = await createToken(payload, Token.ACCESS_TOKEN);
  console.log('access token', accessToken);
  const { key, duration } = getAuthConfig(Token.ACCESS_TOKEN);

  setResponseCookie(res, key, accessToken, true, duration);

  return successResponse({ res, message: 'Access token refreshed successfully' });
};
