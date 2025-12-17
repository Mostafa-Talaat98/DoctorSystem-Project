import mongoose, { Schema, model } from "mongoose";

const patientSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["PATIENT", "DOCTOR"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const patientModel = mongoose.models.patient || model("patient", patientSchema);
export default userModel;
