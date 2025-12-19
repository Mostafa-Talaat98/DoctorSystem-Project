import mongoose, { Schema, model } from "mongoose";
import { OtpType } from "../../modules/auth/Otp/otp.types.js";

const OtpSchema = new Schema(
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
    sendTime:{
      type:Date,
      default: () =>  Date.now() ,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    blockExpiresAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const OtpModel = mongoose.models.Otp || model("Otp", OtpSchema);
export default OtpModel;