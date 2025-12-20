import mongoose, { Schema, model } from 'mongoose';

const PatientSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    image: {
      type: {
        url: String,
        public_id: String,
      },
      _id: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ['System', 'Google'],
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    phoneNumber: {
      type: String,
      sparse: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    birthday: {
      type: Date,
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
    image: {
      type: {
        url: String,
        public_id: String,
      },
      _id: false,
    },
    phoneNumber: {
      type: String,
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
    provider: {
      type: String,
      enum: ['System', 'Google'],
      required: true,
    },

    password: {
      type: String,
      select: false,
    },

    specialty: {
      type: String,
      trim: true,
    },
    birthday: {
      type: Date,
      min: 18,
    },
    licenseNumber: {
      type: String,
      unique: true,
      trim: true,
    },

    clinicLocation: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },

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

export const PatientModel = mongoose.models.Patient || model('Patient', PatientSchema);
export const DoctorModel = mongoose.models.Doctor || model('Doctor', DoctorSchema);
