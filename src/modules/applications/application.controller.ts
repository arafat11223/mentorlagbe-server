import type { RequestHandler } from "express";

import { sendSuccess } from "../../utils/apiResponse.js";

import {
  createApplication as createApplicationService,
  getStudentApplications,
  cancelStudentApplication,
  getTutorApplications,
  updateTutorApplicationStatus,
} from "./application.service.js";

export const createApplication: RequestHandler = async (
  req,
  res
) => {
  const { tuitionId } = res.locals.validatedRequest.params as {
    tuitionId: string;
  };

  const body = res.locals.validatedRequest.body as {
    studentPhone: string;
    preferredSchedule: string;
    studentNote: string;
  };

  const application = await createApplicationService(
    tuitionId,
    body,
    req.currentUser!
  );

  return sendSuccess(res, {
    message: "Your tuition application has been submitted successfully.",
    data: application,
  });
};

export const getMyApplications: RequestHandler = async (
  req,
  res
) => {
  const applications = await getStudentApplications(
    req.currentUser!._id
  );

  return sendSuccess(res, {
    message: "Your applications retrieved successfully.",
    data: applications,
  });
};

export const cancelApplication: RequestHandler = async (
  req,
  res
) => {
  const { id } = res.locals.validatedRequest.params as {
    id: string;
  };

  const application = await cancelStudentApplication(
    id,
    req.currentUser!._id
  );

  return sendSuccess(res, {
    message: "Application cancelled successfully.",
    data: application,
  });
};

export const getApplicationsForTutor: RequestHandler = async (
  req,
  res
) => {
  const applications = await getTutorApplications(
    req.currentUser!._id
  );

  return sendSuccess(res, {
    message: "Tutor applications retrieved successfully.",
    data: applications,
  });
};

export const updateApplicationStatus: RequestHandler = async (
  req,
  res
) => {
  const { id } = res.locals.validatedRequest.params as {
    id: string;
  };

  const { status } = res.locals.validatedRequest.body as {
    status: "accepted" | "rejected";
  };

  const application = await updateTutorApplicationStatus(
    id,
    req.currentUser!._id,
    status
  );

  return sendSuccess(res, {
    message: `Application ${status} successfully.`,
    data: application,
  });
};
