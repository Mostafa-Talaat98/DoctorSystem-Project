import mongoose, { Schema, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// منع المريض من تقييم نفس الدكتور أكثر من مرة (اختياري)
ReviewSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

export const ReviewModel =
  mongoose.models.Review || model("Review", ReviewSchema);
/////
