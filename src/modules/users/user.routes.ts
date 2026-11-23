import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  getMyProfile,
  updateMyProfile,
  updateMyProfileImage,
} from "./user.controller.js";

import {
  updateProfileImageSchema,
  updateProfileSchema,
} from "./user.validation.js";

const router = Router();

// GET /api/users/me
router.get("/me", requireAuth, getMyProfile);

// PATCH /api/users/me
router.patch(
  "/me",
  requireAuth,
  validateRequest(updateProfileSchema),
  updateMyProfile
);

// PATCH /api/users/me/image
router.patch(
  "/me/image",
  requireAuth,
  validateRequest(updateProfileImageSchema),
  updateMyProfileImage
);

export default router;