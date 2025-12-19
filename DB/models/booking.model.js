import mongoose, { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Doctor",
    },
    dateTime: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["PayPal", "Stripe", "Cash"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Rescheduled"],
      default: "Pending",
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Booking", bookingSchema);
