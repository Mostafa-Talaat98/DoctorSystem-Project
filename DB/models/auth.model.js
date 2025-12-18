import mongoose, { Schema, model } from "mongoose";

export const patientSchema = new Schema(
  {
    fullName: {
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    birthday:{
      type: Date,
      required: true,
      min: 18
    }
  },
  {
    timestamps: true,
  }
);


export const doctorSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    birthday:{
      type: Date,
      required: true,
      min: 18
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // clinicLocation: {
    //   latitude: {
    //     type: Number,
    //     required: true,
    //     min: -90,
    //     max: 90,
    //   },
    //   longitude: {
    //     type: Number,
    //     required: true,
    //     min: -180,
    //     max: 180,
    //   },
    // },

    sessionPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    availabilitySlots: {
      type: [Date],
      required: true,
    },

    temporaryPassword: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);


const patientModel = mongoose.models.Patient || model("Patient", patientSchema);
export default patientModel;
