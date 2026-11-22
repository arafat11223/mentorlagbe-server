
import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { getMyProfile } from "./user.controller.js";

const router = Router();

// GET /api/users/me
router.get("/me", requireAuth, getMyProfile);

export default router;
