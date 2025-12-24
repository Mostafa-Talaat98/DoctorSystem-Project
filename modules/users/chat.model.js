import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },

    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["active", "archived", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

// يمنع وجود أكتر من شات لنفس الدكتور والمريض
chatSchema.index({ doctor: 1, patient: 1 }, { unique: true });

// ترتيب الشاتات حسب آخر تحديث
chatSchema.index({ updatedAt: -1 });

export default model("Chat", chatSchema);
