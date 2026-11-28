import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  createCheckoutSession,
  getMyPayments,
  verifyCheckoutSession,
} from "./payment.controller.js";

import {
  verifyCheckoutSessionSchema,
} from "./payment.validation.js";

const router = Router();

router.post(
  "/checkout-session",
  requireAuth,
  requireRole("student", "tutor"),
  createCheckoutSession
);

router.post(
  "/verify-session",
  requireAuth,
  requireRole("student", "tutor"),
  validateRequest(verifyCheckoutSessionSchema),
  verifyCheckoutSession
);

router.get(
  "/mine",
  requireAuth,
  getMyPayments
);

export default router;
