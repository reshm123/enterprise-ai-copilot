import AuditLog from "../models/auditLog.model.mjs";

export const createAuditLog = async ({
  userId,
  action,
  entityType,
  entityId,
  description,
  req,
  metadata = {},
}) => {
  await AuditLog.create({
    userId,
    action,
    entityType,
    entityId,
    description,
    ipAddress:
      req?.ip ||
      req?.headers?.["x-forwarded-for"] ||
      null,
    userAgent:
      req?.headers?.["user-agent"] || null,
    metadata,
  });
};