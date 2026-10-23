import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with this unique value already exists",
    });
  }

  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    if (req.originalUrl.startsWith("/api/documents")) {
      console.error("[document-api-error]", {
        method: req.method,
        path: req.originalUrl,
        statusCode,
        errorName: err.name,
        errorCode: err.code,
        message: err.message,
        awsHttpStatus: err.$metadata?.httpStatusCode,
        awsRequestId: err.$metadata?.requestId,
      });
    } else {
      console.error(err);
    }
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message,
  });
}