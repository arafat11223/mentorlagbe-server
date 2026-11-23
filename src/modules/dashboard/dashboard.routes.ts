import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/authorize.js";

import {
  getStudentDashboardStats,
  getTutorDashboardStats,
  getAdminDashboardStats,
} from "./dashboard.controller.js";

const router = Router();

// Student-only dashboard
router.get(
  "/student",
  requireAuth,
  requireRole("student"),
  getStudentDashboardStats
);

// Tutor-only dashboard
router.get(
  "/tutor",
  requireAuth,
  requireRole("tutor"),
  getTutorDashboardStats
);

// Admin-only dashboard
router.get(
  "/admin",
  requireAuth,
  requireRole("admin"),
  getAdminDashboardStats
);

export default router;
