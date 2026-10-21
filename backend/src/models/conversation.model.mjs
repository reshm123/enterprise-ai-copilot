import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 255,
      default: "New Conversation",
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Archived",
      ],
      default: "Active",
      index: true,
    },

    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({
  userId: 1,
  updatedAt: -1,
});

export default mongoose.model(
  "Conversation",
  conversationSchema
);