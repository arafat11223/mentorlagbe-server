import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  createApplication,
  getMyApplications,
  cancelApplication,
  getApplicationsForTutor,
  updateApplicationStatus,
} from "./application.controller.js";

import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  applicationIdSchema,
  applicationsListQuerySchema,
} from "./application.validation.js";

const router = Router();

// Student routes
router.get(
  "/mine",
  requireAuth,
  requireRole("student"),
  validateRequest(applicationsListQuerySchema),
  getMyApplications
);

router.post(
  "/:tuitionId",
  requireAuth,
  requireRole("student"),
  validateRequest(createApplicationSchema),
  createApplication
);

router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole("student"),
  validateRequest(applicationIdSchema),
  cancelApplication
);

// Tutor routes
router.get(
  "/tutor",
  requireAuth,
  requireRole("tutor"),
  validateRequest(applicationsListQuerySchema),
  getApplicationsForTutor
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("tutor"),
  validateRequest(updateApplicationStatusSchema),
  updateApplicationStatus
);

export default router;
