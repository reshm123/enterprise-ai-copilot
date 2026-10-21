import express from "express";

import { updateUserRole } from "../controllers/user.controller.mjs";
import { authenticate } from "../middleware/authenticate.mjs";
import { authorize } from "../middleware/authorize.mjs";

const router = express.Router();

router.patch(
  "/users/:id/role",
  authenticate,
  authorize("Admin"),
  updateUserRole
);

export default router;