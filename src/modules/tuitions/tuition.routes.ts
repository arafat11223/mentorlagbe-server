import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  createTuitionSchema,
  mongoIdSchema,
  tuitionListQuerySchema,
  updateTuitionSchema,
  updateTuitionStatusSchema,
} from "./tuition.validation.js";

import {
  createTuitionPost,
  deleteTuitionPost,
  getFeatured,
  getTuitionById,
  getTuitions,
  updateTuitionPost,
  updateTuitionPostStatus,
} from "./tuition.controller.js";

const router = Router();

// Public routes
router.get(
  "/featured",
  getFeatured
);

router.get(
  "/",
  validateRequest(tuitionListQuerySchema),
  getTuitions
);

router.get(
  "/:id",
  validateRequest(mongoIdSchema),
  getTuitionById
);

// Tutor-only routes
router.post(
  "/",
  requireAuth,
  requireRole("tutor"),
  validateRequest(createTuitionSchema),
  createTuitionPost
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("tutor"),
  validateRequest(updateTuitionSchema),
  updateTuitionPost
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("tutor"),
  validateRequest(mongoIdSchema),
  deleteTuitionPost
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("tutor"),
  validateRequest(updateTuitionStatusSchema),
  updateTuitionPostStatus
);

export default router;