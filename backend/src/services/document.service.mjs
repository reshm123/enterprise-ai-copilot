import path from "path";
import { readFile } from "node:fs/promises";
import { randomUUID } from "crypto";

import Document from "../models/document.model.mjs";

import { AppError } from "../utils/appError.mjs";
import { getPagination } from "../utils/pagination.mjs";
import { generateFileHash } from "../utils/fileHash.mjs";
import { createAuditLog } from "./audit.service.mjs";
import { processDocumentBuffer } from "./documentIngestion.service.mjs";
import {
  downloadDocumentObject,
  deleteDocumentObject,
  uploadDocumentObject,
} from "./s3.service.mjs";

export const createDocument = async ({
  file,
  title,
  description,
  userId,
  req,
}) => {
  console.log("========== CREATE DOCUMENT START ==========");

  console.log("1. Input received:", {
    hasFile: !!file,
    title,
    description,
    userId,
  });

  if (!file) {
    console.error("❌ FILE_REQUIRED: No file received");

    throw new AppError(
      "Document file is required.",
      400,
      "FILE_REQUIRED"
    );
  }

  console.log("2. File received:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  const extension = path
    .extname(file.originalname)
    .replace(".", "")
    .toLowerCase();

  console.log("3. File extension:", extension);

  const contentHash = generateFileHash(file.buffer);

  console.log("4. Content hash generated:", contentHash);

  console.log("5. Checking for duplicate document...");

  const existingDocument = await Document.findOne({
    contentHash,
    isDeleted: false,
  });

  console.log(
    "6. Duplicate check result:",
    existingDocument ? "DUPLICATE FOUND" : "NO DUPLICATE"
  );

  if (existingDocument) {
    console.log("⚠️ Returning existing document:", existingDocument._id);

    return {
      document: existingDocument,
      duplicate: true,
    };
  }

  const storedFileName = `${randomUUID()}.${extension}`;
  const storageKey = `documents/${storedFileName}`;

  console.log("7. Storage details:", {
    storedFileName,
    storageKey,
  });

  const document = new Document({
    title,
    description: description || "",
    originalFileName: file.originalname,
    storedFileName,
    filePath: storageKey,
    storageProvider: "s3",
    contentHash,
    mimeType: file.mimetype,
    fileExtension: extension,
    fileSize: file.size,
    uploadedBy: userId,
    status: "Processing",
  });

  console.log("8. Document model created:", {
    documentId: document._id,
    status: document.status,
  });

  try {
    console.log("9. Saving document to MongoDB...");

    await document.save();

    console.log("✅ 10. Document saved successfully:", document._id);
  } catch (error) {
    console.error("❌ Document.save() failed:", error);

    console.error("MongoDB error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
    });

    if (error.code === 11000) {
      console.log("⚠️ Duplicate key detected. Searching existing document...");

      const duplicateDocument = await Document.findOne({
        contentHash,
        isDeleted: false,
      });

      console.log(
        "Duplicate document found:",
        duplicateDocument?._id || "NOT FOUND"
      );

      if (duplicateDocument) {
        return {
          document: duplicateDocument,
          duplicate: true,
        };
      }
    }

    throw error;
  }

  try {
    console.log("11. Uploading file to S3...", {
      key: storageKey,
      contentType: file.mimetype,
      size: file.buffer?.length,
    });

    await uploadDocumentObject({
      key: storageKey,
      body: file.buffer,
      contentType: file.mimetype,
    });

    console.log("✅ 12. File uploaded to S3 successfully");
  } catch (error) {
    console.error("❌ S3 upload failed:", error);

    console.error("S3 error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
    });

    console.log("13. Removing MongoDB document because S3 upload failed...");

    await Document.deleteOne({
      _id: document._id,
    });

    console.log("14. MongoDB document removed");

    throw error;
  }

  try {
    console.log("15. Starting document processing...");

    await processDocumentBuffer({
      document,
      buffer: file.buffer,
    });

    console.log("✅ 16. Document processing completed");
  } catch (error) {
    console.error("❌ Document processing failed:", error);

    console.error("Processing error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    throw error;
  }

  try {
    console.log("17. Creating audit log...");

    await createAuditLog({
      userId,
      action: "DOCUMENT_UPLOADED",
      entityType: "Document",
      entityId: document._id,
      description: `Document uploaded: ${file.originalname}`,
      req,
    });

    console.log("✅ 18. Audit log created successfully");
  } catch (error) {
    console.error("❌ Audit log creation failed:", error);

    console.error("Audit error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    throw error;
  }

  console.log("========== CREATE DOCUMENT SUCCESS ==========");

  return {
    document,
    duplicate: false,
  };
};

export const getDocuments = async ({
  page,
  limit,
  search,
  status,
}) => {
  const pagination = getPagination(page, limit);

  const filter = {
    isDeleted: false,
  };

  if (search) {
    filter.$text = {
      $search: search,
    };
  }

  if (status) {
    filter.status = status;
  }

  const [documents, total] = await Promise.all([
    Document.find(filter)
      .populate(
        "uploadedBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),

    Document.countDocuments(filter),
  ]);

  return {
    documents,

    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(
        total / pagination.limit
      ),
    },
  };
};

export const getDocumentById = async (id) => {
  const document = await Document.findOne({
    _id: id,
    isDeleted: false,
  }).populate(
    "uploadedBy",
    "name email role"
  );

  if (!document) {
    throw new AppError(
      "Document not found.",
      404,
      "DOCUMENT_NOT_FOUND"
    );
  }

  return document;
};

export const deleteDocument = async ({
  id,
  userId,
  req,
}) => {
  const document = await Document.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!document) {
    throw new AppError(
      "Document not found.",
      404,
      "DOCUMENT_NOT_FOUND"
    );
  }

  if (document.storageProvider === "s3") {
    await deleteDocumentObject(document.filePath);
  }

  document.isDeleted = true;
  document.deletedAt = new Date();

  await document.save();

  await createAuditLog({
    userId,
    action: "DOCUMENT_DELETED",
    entityType: "Document",
    entityId: document._id,
    description: `Document deleted: ${document.originalFileName}`,
    req,
  });

  return document;
};

export const retryDocument = async ({
  id,
  userId,
  req,
}) => {
  const document = await Document.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!document) {
    throw new AppError(
      "Document not found.",
      404,
      "DOCUMENT_NOT_FOUND"
    );
  }

  if (document.status !== "Failed") {
    throw new AppError(
      "Only failed documents can be retried.",
      400,
      "INVALID_DOCUMENT_STATUS"
    );
  }

  let buffer;
  try {
    buffer =
      document.storageProvider === "s3"
        ? await downloadDocumentObject(document.filePath)
        : await readFile(document.filePath);
  } catch (error) {
    document.status = "Failed";
    document.processingAttempts += 1;
    document.processingError = error.message.slice(0, 1000);
    await document.save();
    throw error;
  }

  const { error } = await processDocumentBuffer({ document, buffer });

  await createAuditLog({
    userId,
    action: "DOCUMENT_PROCESSING_RETRY",
    entityType: "Document",
    entityId: document._id,
    description: `Document processing retry requested.`,
    req,
  });

  if (error) {
    throw error;
  }

  return document;
};