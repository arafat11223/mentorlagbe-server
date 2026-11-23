import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  adminTuitionListQuerySchema,
  updateTuitionApprovalSchema,
} from "../tuitions/tuition.validation.js";

import {
  getAdminTuitionList,
  updateTuitionApproval,
} from "./admin-tuition.controller.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get(
  "/tuitions",
  validateRequest(adminTuitionListQuerySchema),
  getAdminTuitionList
);

router.patch(
  "/tuitions/:id/approval",
  validateRequest(updateTuitionApprovalSchema),
  updateTuitionApproval
);

export default router;
