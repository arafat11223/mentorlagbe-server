import { Router } from "express";

import { getStatistics } from "./statistics.controller.js";

const router = Router();

// Public platform statistics
router.get("/", getStatistics);

export default router;