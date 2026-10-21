import express from "express";

import {
  uploadDocument,
  listDocuments,
  getDocument,
  removeDocument,
  retryDocumentProcessing,
} from "../controllers/document.controller.mjs";

import { uploadDocument as upload } from "../middleware/upload.middleware.mjs";

import {
  authenticate,
} from "../middleware/authenticate.mjs";
import { authorize } from "../middleware/authorize.mjs";

const router = express.Router();

/*
 * Upload Document
 * POST /api/documents
 */
router.post(
  "/",
  authenticate,
  authorize("Admin"),
  upload.single("file"),
  uploadDocument
);

/*
 * List Documents
 * GET /api/documents?page=1&limit=10
 */
router.get(
  "/",
  authenticate,
  authorize("Admin"),
  listDocuments
);

/*
 * Get Document
 * GET /api/documents/:id
 */
router.get(
  "/:id",
  authenticate,
  authorize("Admin"),
  getDocument
);

/*
 * Delete Document
 * DELETE /api/documents/:id
 */
router.delete(
  "/:id",
  authenticate,
  authorize("Admin"),
  removeDocument
);

/*
 * Retry Processing
 * POST /api/documents/:id/retry
 */
router.post(
  "/:id/retry",
  authenticate,
  authorize("Admin"),
  retryDocumentProcessing
);

export default router;