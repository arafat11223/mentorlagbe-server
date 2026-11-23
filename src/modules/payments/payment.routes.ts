import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/authorize.js";

import {
  createCheckoutSession,
  getMyPayments,
} from "./payment.controller.js";

const router = Router();

router.post(
  "/checkout-session",
  requireAuth,
  requireRole("student", "tutor"),
  createCheckoutSession
);

router.get(
  "/mine",
  requireAuth,
  getMyPayments
);

export default router;