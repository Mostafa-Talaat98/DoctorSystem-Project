import mongoose, { Schema, model } from "mongoose";

const PatientSchema = new Schema(
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
    birthday: {
      type: Date,
      required: true,
      min: 18,
    },
  },
  {
    timestamps: true,
  }
);

const DoctorSchema = new Schema(
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

    isVerified: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    specialty: {
      type: String,
      trim: true,
    },
    birthday: {
      type: Date,
      required: true,
      min: 18,
    },
    licenseNumber: {
      type: String,
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
      min: 0,
    },

    availabilitySlots: {
      type: [Date],
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

export const PatientModel =
  mongoose.models.Patient || model("Patient", PatientSchema);
export const DoctorModel =
  mongoose.models.Doctor || model("Doctor", DoctorSchema);
