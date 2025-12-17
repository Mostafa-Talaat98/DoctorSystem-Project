import { generate } from "randomstring";
import { compareHash, hashString } from "../../../utils/security/hash.js";
import otpModel from "../../../DB/models/otp.model.js";
import { OtpType } from "./otp.types.js";

import dotenv from "dotenv";
dotenv.config();

import pkg from "twilio";
import { normalizePhone } from "../../../utils/common/phone.common.js";

const { Twilio } = pkg;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = new Twilio(accountSid, authToken);

export async function sendVerifyPhoneOtp({ phoneNumber }) {

  const normalizedPhone = normalizePhone(phoneNumber);

  if (!normalizedPhone || !/^\+20\d{10}$/.test(normalizedPhone)) {
    throw new Error("Phone number must be in +20XXXXXXXXX format");
  }

  const otp = generate({
    length: 4,
    charset: "numeric",
  });

  const newOTP = await otpModel.create({
    phoneNumber: normalizedPhone,
    code: await hashString(otp.toString()),
    type: OtpType.VERIFY_PHONE_NUMBER,
  });

  if(!newOTP){
    throw new Error("Fail To Create New OTP");
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
    throw new Error("Phone number must be in +20XXXXXXXXX format");
  }

  const otpEntry = await otpModel
    .findOne({
      phoneNumber: normalizedPhone,
      type: OtpType.VERIFY_PHONE_NUMBER,
    })
    .sort({ createdAt: -1 });

  if (!otpEntry) {
    throw new Error("No OTP found for this phone number.");
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
    throw new Error("Invalid OTP code.");
  }

  otpEntry.used = true;
  otpEntry.save();


  console.log("Done")

  return true;
}