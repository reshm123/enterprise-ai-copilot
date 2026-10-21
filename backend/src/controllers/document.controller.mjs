import {
  createDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  retryDocument,
} from "../services/document.service.mjs";

import { successResponse } from "../utils/apiResponse.mjs";

export const uploadDocument = async (
  req,
  res,
  next
) => {
  try {
    const document = await createDocument({
      file: req.file,
      title:
        req.body.title ||
        req.file?.originalname ||
        "Untitled Document",

      description:
        req.body.description || "",

      userId: req.user.id,

      req,
    });

    return successResponse(
      res,
      "Document uploaded successfully.",
      document,
      201
    );
  } catch (error) {
    next(error);
  }
};

export const listDocuments = async (
  req,
  res,
  next
) => {
  try {
    const result = await getDocuments({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      status: req.query.status,
    });

    return successResponse(
      res,
      "Documents fetched successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (
  req,
  res,
  next
) => {
  try {
    const document = await getDocumentById(
      req.params.id
    );

    return successResponse(
      res,
      "Document fetched successfully.",
      document
    );
  } catch (error) {
    next(error);
  }
};

export const removeDocument = async (
  req,
  res,
  next
) => {
  try {
    const document = await deleteDocument({
      id: req.params.id,
      userId: req.user.id,
      req,
    });

    return successResponse(
      res,
      "Document deleted successfully.",
      document
    );
  } catch (error) {
    next(error);
  }
};

export const retryDocumentProcessing = async (
  req,
  res,
  next
) => {
  try {
    const document =
      await retryDocument({
        id: req.params.id,
        userId: req.user.id,
        req,
      });

    return successResponse(
      res,
      "Document processing retry requested.",
      document
    );
  } catch (error) {
    next(error);
  }
};