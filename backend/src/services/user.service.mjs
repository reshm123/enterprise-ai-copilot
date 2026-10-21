import mongoose from "mongoose";
import { z } from "zod";

import User from "../models/user.model.mjs";
import { AppError } from "../utils/appError.mjs";

const roleUpdateSchema = z.object({
  role: z.enum(["Admin", "Employee", "SupportAgent"]),
}).strict();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    status: user.status,
  };
}

export async function updateUserRole({ userId, actorId, input }) {
  const { role } = roleUpdateSchema.parse(input);

  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user ID.", 400, "INVALID_USER_ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  if (user._id.toString() === actorId && role !== "Admin") {
    throw new AppError(
      "You cannot remove your own Admin role.",
      403,
      "SELF_ROLE_CHANGE_FORBIDDEN"
    );
  }

  if (user.role === "Admin" && role !== "Admin" && user.status === "Active") {
    const activeAdminCount = await User.countDocuments({
      role: "Admin",
      status: "Active",
    });

    if (activeAdminCount <= 1) {
      throw new AppError(
        "The last active Admin cannot be demoted.",
        409,
        "LAST_ADMIN_REQUIRED"
      );
    }
  }

  if (user.role !== role) {
    user.role = role;
    user.tokenVersion += 1;
    await user.save();
  }

  return publicUser(user);
}