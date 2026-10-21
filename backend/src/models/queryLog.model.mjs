import mongoose from "mongoose";

const queryLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
      index: true,
    },

    query: {
      type: String,
      required: true,
      trim: true,
    },

    rewrittenQuery: {
      type: String,
      default: null,
    },

    retrievedChunkIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DocumentChunk",
      },
    ],

    retrievalCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    latencyMs: {
      type: Number,
      default: 0,
      min: 0,
    },

    model: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Success",
        "Failed",
      ],
      default: "Success",
      index: true,
    },

    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

queryLogSchema.index({
  userId: 1,
  createdAt: -1,
});

export default mongoose.model(
  "QueryLog",
  queryLogSchema
);