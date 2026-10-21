import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    tokenCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    embedding: {
      type: [Number],
      default: [],
    },

    metadata: {
      pageNumber: {
        type: Number,
        default: null,
      },

      section: {
        type: String,
        default: null,
      },

      heading: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

documentChunkSchema.index({
  documentId: 1,
  chunkIndex: 1,
});

export default mongoose.model(
  "DocumentChunk",
  documentChunkSchema
);