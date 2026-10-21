export const DOCUMENT_TYPES = {
  PDF: "pdf",
  DOCX: "docx",
  TXT: "txt",
};

export const DOCUMENT_STATUS = {
  UPLOADED: "Uploaded",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export const DOCUMENT_MAX_SIZE = 10 * 1024 * 1024;

export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".txt",
];

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];