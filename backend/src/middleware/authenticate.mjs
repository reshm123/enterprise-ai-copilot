import jwt from "jsonwebtoken";
import User from "../models/user.model.mjs";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error("Invalid server JWT configuration");
    }

    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !Number.isInteger(payload.ver)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const user = await User.findById(payload.sub);

    if (!user || user.status !== "Active") {
      return res.status(401).json({
        success: false,
        message: "User account is unavailable",
      });
    }

    if (user.tokenVersion !== payload.ver) {
      return res.status(401).json({
        success: false,
        message: "Token has been invalidated",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      department: user.department,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
    }

    next(error);
  }
}