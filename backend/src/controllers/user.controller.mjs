import { updateUserRole as saveUserRole } from "../services/user.service.mjs";
import { successResponse } from "../utils/apiResponse.mjs";

export async function updateUserRole(req, res, next) {
  try {
    const user = await saveUserRole({
      userId: req.params.id,
      actorId: req.user.id,
      input: req.body,
    });

    return successResponse(res, "User role updated successfully.", { user });
  } catch (error) {
    next(error);
  }
}