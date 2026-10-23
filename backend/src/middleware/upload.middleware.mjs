import multer from "multer";

import {
  DOCUMENT_MAX_SIZE,
  ALLOWED_DOCUMENT_MIME_TYPES,
} from "../constants/document.constants.mjs";

const fileFilter = (req, file, cb) => {
  if (
    ALLOWED_DOCUMENT_MIME_TYPES.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, DOCX and TXT files are allowed."
      ),
      false
    );
  }
};

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: DOCUMENT_MAX_SIZE,
  },
});