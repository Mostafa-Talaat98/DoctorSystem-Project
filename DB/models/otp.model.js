import mongoose, { Schema, model } from "mongoose";
import { OtpType } from "../../modules/auth/Otp/otp.types.js";

const otpSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: function () {
        return !this.email;
      },
    },
    email: {
      type: String,
      required: function () {
        return !this.phoneNumber;
      },
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(OtpType),
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000),
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const otpModel = mongoose.models.Otp || model("Otp", otpSchema);
export default otpModel;