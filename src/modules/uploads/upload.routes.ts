import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/authorize.js";

import { uploadImage } from "./upload.controller.js";
import { uploadImageFile } from "./upload.middleware.js";

const router = Router();

router.post(
  "/image",
  requireAuth,
  requireRole("student", "tutor", "admin"),
  uploadImageFile,
  uploadImage
);

export default router;
