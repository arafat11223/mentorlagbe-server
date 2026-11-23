import type { RequestHandler } from "express";

import { AppError } from "../../utils/AppError.js";
import { sendSuccess } from "../../utils/apiResponse.js";

import {
  getStudentDashboard,
  getTutorDashboard,
  getAdminDashboard,
} from "./dashboard.service.js";

// GET /api/dashboard/student
export const getStudentDashboardStats: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.currentUser;

  if (!user) {
    return next(new AppError("User profile not found.", 404));
  }

  const statistics = await getStudentDashboard(user._id);

  return sendSuccess(res, {
    message: "Student dashboard statistics retrieved successfully.",
    data: statistics,
  });
};

// GET /api/dashboard/tutor
export const getTutorDashboardStats: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.currentUser;

  if (!user) {
    return next(new AppError("User profile not found.", 404));
  }

  const statistics = await getTutorDashboard(user._id);

  return sendSuccess(res, {
    message: "Tutor dashboard statistics retrieved successfully.",
    data: statistics,
  });
};

// GET /api/dashboard/admin
export const getAdminDashboardStats: RequestHandler = async (
  _req,
  res
) => {
  const statistics = await getAdminDashboard();

  return sendSuccess(res, {
    message: "Admin dashboard statistics retrieved successfully.",
    data: statistics,
  });
};
