import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

import {
  DOCUMENT_MAX_SIZE,
  ALLOWED_DOCUMENT_MIME_TYPES,
} from "../constants/document.constants.mjs";

const uploadDirectory = path.resolve(
  "src/uploads/documents"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const uniqueName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  },
});

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
  storage,
  fileFilter,
  limits: {
    fileSize: DOCUMENT_MAX_SIZE,
  },
});