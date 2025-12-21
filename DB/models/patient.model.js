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


export const PatientModel = mongoose.models.Patient || model('Patient', PatientSchema);
