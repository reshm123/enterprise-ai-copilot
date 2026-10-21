import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({
  userId: 1,
  createdAt: -1,
});

export default mongoose.model(
  "Feedback",
  feedbackSchema
);