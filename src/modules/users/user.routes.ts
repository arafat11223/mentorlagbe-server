import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  getMyProfile,
  updateMyProfileImage,
} from "./user.controller.js";

import {
  updateProfileImageSchema,
} from "./user.validation.js";

const router = Router();

// GET /api/users/me
router.get("/me", requireAuth, getMyProfile);

// PATCH /api/users/me/image
router.patch(
  "/me/image",
  requireAuth,
  validateRequest(updateProfileImageSchema),
  updateMyProfileImage
);

export default router;
