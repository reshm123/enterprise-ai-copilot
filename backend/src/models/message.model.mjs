import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: [
        "user",
        "assistant",
        "system",
      ],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    sources: [
      {
        documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Document",
        },

        chunkId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DocumentChunk",
        },

        documentTitle: {
          type: String,
        },

        pageNumber: {
          type: Number,
          default: null,
        },
      },
    ],

    tokenUsage: {
      promptTokens: {
        type: Number,
        default: 0,
      },

      completionTokens: {
        type: Number,
        default: 0,
      },

      totalTokens: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({
  conversationId: 1,
  createdAt: 1,
});

export default mongoose.model(
  "Message",
  messageSchema
);