import path from "path";
import fs from "fs/promises";

import Document from "../models/document.model.mjs";
import DocumentChunk from "../models/documentChunk.model.mjs";

import { AppError } from "../utils/appError.mjs";
import { getPagination } from "../utils/pagination.mjs";
import { createAuditLog } from "./audit.service.mjs";

export const createDocument = async ({
  file,
  title,
  description,
  userId,
  req,
}) => {
  if (!file) {
    throw new AppError(
      "Document file is required.",
      400,
      "FILE_REQUIRED"
    );
  }

  const extension = path
    .extname(file.originalname)
    .replace(".", "")
    .toLowerCase();

  const document = await Document.create({
    title,
    description: description || "",

    originalFileName: file.originalname,

    storedFileName: file.filename,

    filePath: file.path,

    mimeType: file.mimetype,

    fileExtension: extension,

    fileSize: file.size,

    uploadedBy: userId,

    status: "Uploaded",
  });

  await createAuditLog({
    userId,
    action: "DOCUMENT_UPLOADED",
    entityType: "Document",
    entityId: document._id,
    description: `Document uploaded: ${file.originalname}`,
    req,
  });

  return document;
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

  document.status = "Uploaded";
  document.processingError = null;

  await document.save();

  await createAuditLog({
    userId,
    action: "DOCUMENT_PROCESSING_RETRY",
    entityType: "Document",
    entityId: document._id,
    description: `Document processing retry requested.`,
    req,
  });

  return document;
};