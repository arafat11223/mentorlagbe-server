import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  createTuitionSchema,
  mongoIdSchema,
  tutorTuitionListQuerySchema,
  tuitionListQuerySchema,
  updateTuitionSchema,
  updateTuitionStatusSchema,
} from "./tuition.validation.js";

import {
  createTuitionPost,
  deleteTuitionPost,
  getFeatured,
  getMyTuitions,
  getTuitionById,
  getTuitions,
  updateTuitionPost,
  updateTuitionPostStatus,
} from "./tuition.controller.js";

const router = Router();

// Tutor-only routes.
// Keep /mine before /:id to prevent route conflicts.
router.get(
  "/mine",
  requireAuth,
  requireRole("tutor"),
  validateRequest(tutorTuitionListQuerySchema),
  getMyTuitions
);

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

// Tutor-only write routes
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
