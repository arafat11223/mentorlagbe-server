import type { Request, RequestHandler } from "express";

import type { UserDocument } from "../../types/database.js";

import { AppError } from "../../utils/AppError.js";
import { sendSuccess } from "../../utils/apiResponse.js";

import {
  createTuition,
  deleteTuition,
  getFeaturedTuitions,
  getTutorTuitions,
  getTutorTuitionById,
  getPublicTuitionById,
  getPublicTuitions,
  updateTuition,
  updateTuitionStatus,
  type CreateTuitionInput,
  type TuitionListQuery,
} from "./tuition.service.js";

function getCurrentUser(req: Request): UserDocument {
  if (!req.currentUser) {
    throw new AppError("Authentication required.", 401);
  }

  return req.currentUser;
}

// GET /api/tuitions
export const getTuitions: RequestHandler = async (
  _req,
  res
) => {
  const query = res.locals.validatedRequest.query as TuitionListQuery;

  const result = await getPublicTuitions(query);

  res.status(200).json({
    success: true,
    status: "success",
    message: "Tuition listings retrieved successfully.",
    data: result.tuitions,
    pagination: result.pagination,
  });
};

// GET /api/tuitions/featured
export const getFeatured: RequestHandler = async (
  _req,
  res
) => {
  const tuitions = await getFeaturedTuitions();

  sendSuccess(res, {
    message: "Featured tuition listings retrieved successfully.",
    data: tuitions,
  });
};

// GET /api/tuitions/:id
export const getTuitionById: RequestHandler = async (
  req,
  res
) => {
  const { id } = res.locals.validatedRequest.params as {
    id: string;
  };

  const tuition = await getPublicTuitionById(id);

  sendSuccess(res, {
    message: "Tuition details retrieved successfully.",
    data: tuition,
  });
};

// POST /api/tuitions
export const createTuitionPost: RequestHandler = async (
  req,
  res
) => {
  const currentUser = getCurrentUser(req);

  const input = res.locals.validatedRequest.body as CreateTuitionInput;

  const tuition = await createTuition(currentUser, input);

  sendSuccess(res, {
    message: "Tuition post created successfully. Awaiting admin approval.",
    data: tuition,
    statusCode: 201,
  });
};

// PATCH /api/tuitions/:id
export const updateTuitionPost: RequestHandler = async (
  req,
  res
) => {
  const currentUser = getCurrentUser(req);

  const { id } = res.locals.validatedRequest.params as {
    id: string;
  };

  const input = res.locals.validatedRequest.body as Partial<CreateTuitionInput>;

  const tuition = await updateTuition(id, currentUser, input);

  sendSuccess(res, {
    message: "Tuition post updated successfully. Awaiting admin approval.",
    data: tuition,
  });
};

// DELETE /api/tuitions/:id
export const deleteTuitionPost: RequestHandler = async (
  req,
  res
) => {
  const currentUser = getCurrentUser(req);

  const { id } = res.locals.validatedRequest.params as {
    id: string;
  };

  await deleteTuition(id, currentUser);

  sendSuccess(res, {
    message: "Tuition post deleted successfully.",
  });
};

// PATCH /api/tuitions/:id/status
export const updateTuitionPostStatus: RequestHandler = async (
  req,
  res
) => {
  const currentUser = getCurrentUser(req);

  const { id } = res.locals.validatedRequest.params as {
    id: string;
  };

  const { isActive } = res.locals.validatedRequest.body as {
    isActive: boolean;
  };

  const tuition = await updateTuitionStatus(
    id,
    currentUser,
    isActive
  );

  sendSuccess(res, {
    message: `Tuition post ${isActive ? "activated" : "deactivated"} successfully.`,
    data: tuition,
  });
};
// GET /api/tuitions/mine
export const getMyTuitions: RequestHandler = async (
  req,
  res
) => {
  const currentUser = getCurrentUser(req);

  const query = res.locals.validatedRequest.query as {
    page: number;
    limit: number;
    approvalStatus?: "pending" | "approved" | "rejected";
  };

  const result = await getTutorTuitions(currentUser, query);

  res.status(200).json({
    success: true,
    status: "success",
    message: "Your tuition listings retrieved successfully.",
    data: result.tuitions,
    pagination: result.pagination,
  });
};

// GET /api/tuitions/mine/:id
export const getMyTuitionById: RequestHandler = async (
  req,
  res
) => {
  const currentUser = getCurrentUser(req);

  const { id } = res.locals.validatedRequest.params as {
    id: string;
  };

  const tuition = await getTutorTuitionById(id, currentUser);

  sendSuccess(res, {
    message: "Your tuition details retrieved successfully.",
    data: tuition,
  });
};