import type { RequestHandler } from "express";

import { sendSuccess } from "../../utils/apiResponse.js";

import {
  getAdminTuitions,
  moderateTuition,
  type AdminTuitionListQuery,
} from "./admin-tuition.service.js";

// GET /api/admin/tuitions
export const getAdminTuitionList: RequestHandler = async (
  _req,
  res
) => {
  const query = res.locals.validatedRequest.query as AdminTuitionListQuery;

  const result = await getAdminTuitions(query);

  return res.status(200).json({
    success: true,
    status: "success",
    message: "Admin tuition listings retrieved successfully.",
    data: result.tuitions,
    pagination: result.pagination,
  });
};

// PATCH /api/admin/tuitions/:id/approval
export const updateTuitionApproval: RequestHandler = async (
  _req,
  res
) => {
  const { id } = res.locals.validatedRequest.params as {
    id: string;
  };

  const { approvalStatus } = res.locals.validatedRequest.body as {
    approvalStatus: "approved" | "rejected";
  };

  const tuition = await moderateTuition(id, approvalStatus);

  return sendSuccess(res, {
    message: `Tuition post ${approvalStatus} successfully.`,
    data: tuition,
  });
};
