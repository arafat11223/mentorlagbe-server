import type { RequestHandler } from "express";

import { sendSuccess } from "../../utils/apiResponse.js";
import { getPlatformStatistics } from "./statistics.service.js";

// GET /api/statistics
export const getStatistics: RequestHandler = async (
  _req,
  res
) => {
  const statistics = await getPlatformStatistics();

  return sendSuccess(res, {
    message: "Platform statistics retrieved successfully.",
    data: statistics,
  });
};