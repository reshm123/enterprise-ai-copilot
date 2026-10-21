import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 255,
    },

    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },

    storedFileName: {
      type: String,
      required: true,
      unique: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileExtension: {
      type: String,
      required: true,
      lowercase: true,
      enum: [
        "pdf",
        "docx",
        "txt",
      ],
    },

    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "Uploaded",
        "Processing",
        "Completed",
        "Failed",
      ],
      default: "Uploaded",
      index: true,
    },

    processingError: {
      type: String,
      default: null,
    },

    processingAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    chunkCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    metadata: {
      pageCount: {
        type: Number,
        default: null,
      },

      wordCount: {
        type: Number,
        default: null,
      },

      characterCount: {
        type: Number,
        default: null,
      },

      language: {
        type: String,
        default: null,
      },
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({
  title: "text",
  originalFileName: "text",
});

documentSchema.index({
  status: 1,
  createdAt: -1,
});

documentSchema.index({
  uploadedBy: 1,
  createdAt: -1,
});

export default mongoose.model("Document", documentSchema);