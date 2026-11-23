import { ObjectId, type Filter } from "mongodb";

import { tuitionsCollection } from "../../config/database.js";

import type {
  TuitionApprovalStatus,
  TuitionDocument,
} from "../../types/database.js";

import { AppError } from "../../utils/AppError.js";

export interface AdminTuitionListQuery {
  page: number;
  limit: number;
  approvalStatus?: TuitionApprovalStatus;
  search?: string;
}

export async function getAdminTuitions(
  query: AdminTuitionListQuery
) {
  const filter: Filter<TuitionDocument> = {
    deletedAt: null,
  };

  if (query.approvalStatus) {
    filter.approvalStatus = query.approvalStatus;
  }

  if (query.search) {
    const escapedSearch = query.search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const searchRegex = new RegExp(escapedSearch, "i");

    filter.$or = [
      { title: searchRegex },
      { subject: searchRegex },
      { classLevel: searchRegex },
      { tutorName: searchRegex },
      { tutorEmail: searchRegex },
    ];
  }

  const collection = tuitionsCollection();
  const skip = (query.page - 1) * query.limit;

  const [tuitions, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .toArray(),

    collection.countDocuments(filter),
  ]);

  return {
    tuitions: tuitions.map((tuition) => ({
      _id: tuition._id,
      tutorId: tuition.tutorId,
      tutorName: tuition.tutorName,
      tutorEmail: tuition.tutorEmail,
      title: tuition.title,
      tuitionType: tuition.tuitionType,
      subject: tuition.subject,
      classLevel: tuition.classLevel,
      mode: tuition.mode,
      location: tuition.location,
      monthlyFee: tuition.monthlyFee,
      daysPerWeek: tuition.daysPerWeek,
      bannerImage: tuition.bannerImage,
      description: tuition.description,
      approvalStatus: tuition.approvalStatus,
      isActive: tuition.isActive,
      createdAt: tuition.createdAt,
      updatedAt: tuition.updatedAt,
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function moderateTuition(
  id: string,
  approvalStatus: "approved" | "rejected"
) {
  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid tuition ID.", 400);
  }

  const collection = tuitionsCollection();
  const tuitionId = new ObjectId(id);

  const existing = await collection.findOne({
    _id: tuitionId,
    deletedAt: null,
  });

  if (!existing) {
    throw new AppError("Tuition post not found.", 404);
  }

  // Make repeated identical requests safe.
  if (existing.approvalStatus === approvalStatus) {
    return existing;
  }

  if (existing.approvalStatus !== "pending") {
    throw new AppError(
      "Only pending tuition posts can be moderated.",
      409
    );
  }

  const result = await collection.updateOne(
    {
      _id: tuitionId,
      approvalStatus: "pending",
      deletedAt: null,
    },
    {
      $set: {
        approvalStatus,
        isActive: approvalStatus === "approved",
        updatedAt: new Date(),
      },
    }
  );

  if (result.modifiedCount === 0) {
    const latest = await collection.findOne({
      _id: tuitionId,
      deletedAt: null,
    });

    if (latest?.approvalStatus === approvalStatus) {
      return latest;
    }

    throw new AppError(
      "This tuition post was already updated. Refresh and try again.",
      409
    );
  }

  const updated = await collection.findOne({
    _id: tuitionId,
    deletedAt: null,
  });

  if (!updated) {
    throw new AppError("Updated tuition post could not be found.", 404);
  }

  return updated;
}
