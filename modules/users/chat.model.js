import mongoose from "mongoose";

const { Schema, model, models } = mongoose;


const messageSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seen: {
      type: Boolean,
      default: false,
    },

    seenAt: {
      type: Date,
    },
  },
  { timestamps: true }
);


const chatSchema = new Schema(
  {
    // لازم يكونوا 2 بس
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    messages: [messageSchema],
  },
  { timestamps: true }
);


// يمنع تكرار شات بين نفس الشخصين
chatSchema.index(
  { participants: 1 },
  { unique: true }
);

// ترتيب الشاتات
chatSchema.index({ updatedAt: -1 });


const ChatModel = models.Chat || model("Chat", chatSchema);
export default ChatModel;
