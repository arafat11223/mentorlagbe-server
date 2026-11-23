import { ObjectId } from "mongodb";

import {
  applicationsCollection,
  tuitionsCollection,
} from "../../config/database.js";

import type {
  ApplicationDocument,
  ApplicationStatus,
  UserDocument,
} from "../../types/database.js";

import { AppError } from "../../utils/AppError.js";

interface CreateApplicationInput {
  studentPhone: string;
  preferredSchedule: string;
  studentNote: string;
}

function ensureValidId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid resource ID.", 400);
  }

  return new ObjectId(id);
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function createApplication(
  tuitionId: string,
  input: CreateApplicationInput,
  student: UserDocument
): Promise<ApplicationDocument> {
  const tuitionObjectId = ensureValidId(tuitionId);

  const tuition = await tuitionsCollection().findOne({
    _id: tuitionObjectId,
    approvalStatus: "approved",
    isActive: true,
    deletedAt: null,
  });

  if (!tuition) {
    throw new AppError(
      "This tuition is unavailable for applications.",
      404
    );
  }

  const existingApplication = await applicationsCollection().findOne({
    tuitionId: tuitionObjectId,
    studentId: student._id,
    status: { $in: ["pending", "accepted"] },
  });

  if (existingApplication) {
    throw new AppError(
      "You already have an active application for this tuition.",
      409
    );
  }

  const now = new Date();

  const application: ApplicationDocument = {
    _id: new ObjectId(),
    tuitionId: tuition._id,
    studentId: student._id,
    tutorId: tuition.tutorId,

    tuitionTitle: tuition.title,
    subject: tuition.subject,
    monthlyFee: tuition.monthlyFee,
    tutorEmail: tuition.tutorEmail,

    studentName: student.name,
    studentEmail: student.email,
    studentPhone: input.studentPhone,

    preferredSchedule: input.preferredSchedule,
    studentNote: input.studentNote,

    status: "pending",
    appliedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await applicationsCollection().insertOne(application);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(
        "You already have an active application for this tuition.",
        409
      );
    }

    throw error;
  }

  return application;
}

export async function getStudentApplications(
  studentId: ObjectId
): Promise<ApplicationDocument[]> {
  return applicationsCollection()
    .find({ studentId })
    .sort({ appliedAt: -1 })
    .toArray();
}

export async function cancelStudentApplication(
  applicationId: string,
  studentId: ObjectId
): Promise<ApplicationDocument> {
  const _id = ensureValidId(applicationId);

  const application = await applicationsCollection().findOne({
    _id,
    studentId,
  });

  if (!application) {
    throw new AppError("Application not found.", 404);
  }

  if (application.status !== "pending") {
    throw new AppError(
      "Only pending applications can be cancelled.",
      409
    );
  }

  await applicationsCollection().updateOne(
    {
      _id,
      studentId,
      status: "pending",
    },
    {
      $set: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    }
  );

  const updatedApplication = await applicationsCollection().findOne({
    _id,
    studentId,
  });

  if (!updatedApplication) {
    throw new AppError("Application not found.", 404);
  }

  return updatedApplication;
}

export async function getTutorApplications(
  tutorId: ObjectId
): Promise<ApplicationDocument[]> {
  return applicationsCollection()
    .find({ tutorId })
    .sort({ appliedAt: -1 })
    .toArray();
}

export async function updateTutorApplicationStatus(
  applicationId: string,
  tutorId: ObjectId,
  status: Extract<ApplicationStatus, "accepted" | "rejected">
): Promise<ApplicationDocument> {
  const _id = ensureValidId(applicationId);

  const application = await applicationsCollection().findOne({
    _id,
    tutorId,
  });

  if (!application) {
    throw new AppError("Application not found.", 404);
  }

  if (application.status !== "pending") {
    throw new AppError(
      "Only pending applications can be reviewed.",
      409
    );
  }

  const result = await applicationsCollection().updateOne(
    {
      _id,
      tutorId,
      status: "pending",
    },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );

  if (result.modifiedCount === 0) {
    throw new AppError(
      "This application has already been reviewed.",
      409
    );
  }

  const updatedApplication = await applicationsCollection().findOne({
    _id,
    tutorId,
  });

  if (!updatedApplication) {
    throw new AppError("Application not found.", 404);
  }

  return updatedApplication;
}
