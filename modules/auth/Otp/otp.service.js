import { generate } from "randomstring";
import { compareHash, hashString } from "../../../utils/security/hash.js";
import OtpModel from "../../../DB/models/otp.model.js";
import { OtpType } from "./otp.types.js";
import { normalizePhone } from "../../../utils/common/phone.common.js";
import { emailEvent } from "../../../utils/email/email.event.js";
import { EmailEventType } from "../../../utils/email/email.events.types.js";
import pkg from "twilio";

import dotenv from "dotenv";
import { ApplicationException, BadRequestException, ConflictException, NotFoundException, TooManyRequestsException } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";

dotenv.config();

// Email Verification

export async function sendVerifyEmailOtp({ email }) {
  if (!email) {
    throw new ConflictException("Email Is Must Be Provided");
  }

  const otp = generate({
    length: 4,
    charset: "numeric",
  });

  const newOTP = await OtpModel.create({
    email,
    code: await hashString(otp.toString()),
    type: OtpType.VERIFY_EMAIL,
  });

  if (!newOTP) {
    throw new ApplicationException("Fail To Create New OTP");
  }

  emailEvent.emit(EmailEventType.VERIFY_EMAIL, {
    to: email,
    otp,
  });

  return true;
}

export async function verifyEmailOtp({ email, code }) {
  if (!email) {
    throw new BadRequestException("Email must be provided");
  }

  if (!code) {
    throw new BadRequestException("OTP code must be provided");
  }

  const otpEntry = await OtpModel.findOne({
    email,
    type: OtpType.VERIFY_EMAIL,
  }).sort({ createdAt: -1 });

  if (!otpEntry) {
    throw new BadRequestException("No OTP found for this email.");
  }

  const OTP_EXPIRATION_MS = 5 * 60 * 1000;
  const isExpired =
    Date.now() - new Date(otpEntry.createdAt).getTime() > OTP_EXPIRATION_MS;

  if (isExpired) {
    await otpEntry.deleteOne();
    throw new BadRequestException("OTP expired. Please request a new one");
  }

  const isValid = await compareHash(code, otpEntry.code);
  if (!isValid) {
    throw new BadRequestException("Invalid OTP code.");
  }

  otpEntry.used = true;
  await otpEntry.save();

  return true;
}

export async function reSendEmailOtp(req, res) {
  const { email, type } = req.body;

  const otpRecord = await OtpModel.findOne({
    email,
    type: OtpType[type],
    used: false,
  });

  if (!otpRecord) {
    throw new NotFoundException("The request is no longer valid.");
  }

  // 1 : Check Block
  if (otpRecord.blockExpiresAt > Date.now()) {
    throw new TooManyRequestsException("Too many requests. Try again after 15 minutes.");
  }

  // 2 : Check Resend Interval
  if (Date.now() - otpRecord.sendTime < 1 * 60 * 1000) {
    throw new BadRequestException(
      "OTP was recently sent. Please wait before requesting a new one."
    );
  }

  // 3 : Check Resend Count
  if (otpRecord.resendCount >= 5) {
    otpRecord.blockExpiresAt = Date.now() + 15 * 60 * 1000;
    otpRecord.resendCount = 0;
    await otpRecord.save();
    throw new BadRequestException("You are temporarily blocked from resending OTP.");
  }

  otpRecord.resendCount += 1;

  const plainOtp = generate({
    length: 4,
    charset: "numeric",
  });
  otpRecord.code = await hashString(plainOtp);
  otpRecord.expiresAt = Date.now() + 5 * 60 * 1000;
  otpRecord.sendTime = Date.now();

  otpRecord.save();

  emailEvent.emit(EmailEventType[type], {
    to: email,
    otp:plainOtp,
  });

  
  return successResponse({
    res,
    message:"OTP sent to your email successfully"
  })
  
}

// Phone Number Verification

const { Twilio } = pkg;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = new Twilio(accountSid, authToken);

export async function sendVerifyPhoneOtp({ phoneNumber }) {
  const normalizedPhone = normalizePhone(phoneNumber);

  if (!normalizedPhone || !/^\+20\d{10}$/.test(normalizedPhone)) {
    throw new BadRequestException("Phone number must be in +20XXXXXXXXX format");
  }

  const otp = generate({
    length: 4,
    charset: "numeric",
  });

  const newOTP = await OtpModel.create({
    phoneNumber: normalizedPhone,
    code: await hashString(otp.toString()),
    type: OtpType.VERIFY_PHONE_NUMBER,
  });

  if (!newOTP) {
    throw new BadRequestException("Fail To Create New OTP");
  }

  try {
    const newMessage = await client.messages.create({
      body: `Your OTP Code To Active Doctor Appointment Account Is: ${otp} , OTP Expires in 5 min. If you didn't request this, ignore it.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone,
    });

    console.log("OTP sent successfully:", newMessage.sid);
  } catch (error) {
    console.error("Failed to send OTP via Twilio:", error.message);

    throw new Error("Failed to send OTP. Please try again later.");
  }
}

export async function verifyPhoneOtp({ phoneNumber, code }) {
  const normalizedPhone = normalizePhone(phoneNumber);

  if (!normalizedPhone || !/^\+20\d{10}$/.test(normalizedPhone)) {
    throw new BadRequestException("Phone number must be in +20XXXXXXXXX format");
  }

  const otpEntry = await OtpModel.findOne({
    phoneNumber: normalizedPhone,
    type: OtpType.VERIFY_PHONE_NUMBER,
  }).sort({ createdAt: -1 });

  if (!otpEntry) {
    throw new BadRequestException("No OTP found for this phone number.");
  }

  const OTP_EXPIRATION_MS = 5 * 60 * 1000;
  const isExpired =
    Date.now() - new Date(otpEntry.createdAt).getTime() > OTP_EXPIRATION_MS;

  if (isExpired) {
    await otpEntry.deleteOne();
    throw new Error("OTP expired. Please request a new one");
  }

  const isValid = await compareHash(code, otpEntry.code);
  if (!isValid) {
    throw new BadRequestException("Invalid OTP code.");
  }

  otpEntry.used = true;
  otpEntry.save();


  return true;
}