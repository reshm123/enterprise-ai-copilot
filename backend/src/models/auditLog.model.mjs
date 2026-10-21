import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    entityType: {
      type: String,
      required: true,
      enum: [
        "User",
        "Document",
        "DocumentChunk",
        "Conversation",
        "Message",
      ],
      index: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({
  entityType: 1,
  entityId: 1,
  createdAt: -1,
});

auditLogSchema.index({
  userId: 1,
  createdAt: -1,
});

export default mongoose.model(
  "AuditLog",
  auditLogSchema
);