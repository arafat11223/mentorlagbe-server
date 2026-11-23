import { ObjectId, type Filter, type WithId } from "mongodb";

import { tuitionRepository } from "../../repositories/index.js";
import { tuitionsCollection } from "../../config/database.js";

import type {
  TuitionDocument,
  UserDocument,
} from "../../types/database.js";

import { AppError } from "../../utils/AppError.js";

export interface CreateTuitionInput {
  title: string;
  tuitionType: "group" | "one-to-one";
  subject: string;
  classLevel: string;
  mode: "online" | "offline";
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage: string | null;
  description: string;
}

export interface TuitionListQuery {
  page: number;
  limit: number;
  search?: string;
  subject?: string;
  classLevel?: string;
  mode?: "online" | "offline";
  sort: "latest";
}

// Public fields shared by tuition listing and details.
function toPublicTuitionSummary(tuition: WithId<TuitionDocument>) {
  return {
    _id: tuition._id,
    title: tuition.title,
    tuitionType: tuition.tuitionType,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    mode: tuition.mode,
    location: tuition.location,
    monthlyFee: tuition.monthlyFee,
    daysPerWeek: tuition.daysPerWeek,
    tutorName: tuition.tutorName,
    createdAt: tuition.createdAt,
  };
}

// Additional fields needed only on the details page.
function toPublicTuitionDetails(tuition: WithId<TuitionDocument>) {
  return {
    ...toPublicTuitionSummary(tuition),
    bannerImage: tuition.bannerImage,
    description: tuition.description,
  };
}

// Escape special regex characters from user input.
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build filters for publicly visible tuition posts.
function getPublicFilter(
  query?: Partial<TuitionListQuery>
): Filter<TuitionDocument> {
  const filter: Filter<TuitionDocument> = {
    approvalStatus: "approved",
    isActive: true,
    deletedAt: null,
  };

  if (query?.subject) {
    filter.subject = {
      $regex: escapeRegex(query.subject),
      $options: "i",
    };
  }

  if (query?.classLevel) {
    filter.classLevel = {
      $regex: escapeRegex(query.classLevel),
      $options: "i",
    };
  }

  if (query?.mode) {
    filter.mode = query.mode;
  }

  if (query?.search) {
    const searchRegex = {
      $regex: escapeRegex(query.search),
      $options: "i",
    };

    filter.$or = [
      { title: searchRegex },
      { subject: searchRegex },
      { description: searchRegex },
      { classLevel: searchRegex },
    ];
  }

  return filter;
}

// Create a tuition post.
export async function createTuition(
  currentUser: UserDocument,
  input: CreateTuitionInput
) {
  if (currentUser.role !== "tutor") {
    throw new AppError(
      "Only tutors can create tuition posts.",
      403
    );
  }

  // Free tutors can create a maximum of two non-deleted posts.
  if (currentUser.plan === "free") {
    const existingPosts = await tuitionRepository.count({
      tutorId: currentUser._id,
      deletedAt: null,
    });

    if (existingPosts >= 2) {
      throw new AppError(
        "Free tutors can create a maximum of 2 tuition posts. Upgrade to Pro for unlimited posts.",
        403
      );
    }
  }

  const now = new Date();

  const tuition: Omit<TuitionDocument, "_id"> = {
    tutorId: currentUser._id,
    tutorName: currentUser.name,
    tutorEmail: currentUser.email,
    ...input,
    approvalStatus: "pending",
    isActive: true,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const result = await tuitionRepository.create(tuition);

  return tuitionRepository.findById(result.insertedId);
}

// Get public tuition listings with pagination.
export async function getPublicTuitions(
  query: TuitionListQuery
) {
  const filter = getPublicFilter(query);
  const collection = tuitionsCollection();

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const [tuitions, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),

    collection.countDocuments(filter),
  ]);

  return {
    tuitions: tuitions.map(toPublicTuitionSummary),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get featured public tuition posts.
export async function getFeaturedTuitions() {
  const tuitions = await tuitionsCollection()
    .find(getPublicFilter())
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();

  return tuitions.map(toPublicTuitionSummary);
}

// Get one public tuition post.
export async function getPublicTuitionById(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid tuition ID.", 400);
  }

  const tuition = await tuitionRepository.findOne({
    _id: new ObjectId(id),
    approvalStatus: "approved",
    isActive: true,
    deletedAt: null,
  });

  if (!tuition) {
    throw new AppError("Tuition post not found.", 404);
  }

  return toPublicTuitionDetails(tuition);
}

// Update a tutor's own tuition post.
export async function updateTuition(
  id: string,
  currentUser: UserDocument,
  input: Partial<CreateTuitionInput>
) {
  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid tuition ID.", 400);
  }

  const tuitionId = new ObjectId(id);

  const tuition = await tuitionRepository.findOne({
    _id: tuitionId,
    tutorId: currentUser._id,
    deletedAt: null,
  });

  if (!tuition) {
    throw new AppError("Tuition post not found.", 404);
  }

  await tuitionRepository.updateById(tuitionId, {
    $set: {
      ...input,
      approvalStatus: "pending",
      updatedAt: new Date(),
    },
  });

  return tuitionRepository.findById(tuitionId);
}

// Soft-delete a tutor's own tuition post.
export async function deleteTuition(
  id: string,
  currentUser: UserDocument
) {
  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid tuition ID.", 400);
  }

  const tuitionId = new ObjectId(id);

  const tuition = await tuitionRepository.findOne({
    _id: tuitionId,
    tutorId: currentUser._id,
    deletedAt: null,
  });

  if (!tuition) {
    throw new AppError("Tuition post not found.", 404);
  }

  await tuitionRepository.updateById(tuitionId, {
    $set: {
      deletedAt: new Date(),
      isActive: false,
      updatedAt: new Date(),
    },
  });

  return null;
}

// Activate or deactivate a tutor's own tuition post.
export async function updateTuitionStatus(
  id: string,
  currentUser: UserDocument,
  isActive: boolean
) {
  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid tuition ID.", 400);
  }

  const tuitionId = new ObjectId(id);

  const tuition = await tuitionRepository.findOne({
    _id: tuitionId,
    tutorId: currentUser._id,
    deletedAt: null,
  });

  if (!tuition) {
    throw new AppError("Tuition post not found.", 404);
  }

  await tuitionRepository.updateById(tuitionId, {
    $set: {
      isActive,
      updatedAt: new Date(),
    },
  });

  return tuitionRepository.findById(tuitionId);
}

// Get the authenticated tutor's non-deleted tuition posts.
export interface TutorTuitionListQuery {
  page: number;
  limit: number;
  approvalStatus?: "pending" | "approved" | "rejected";
}

export async function getTutorTuitions(
  currentUser: UserDocument,
  query: TutorTuitionListQuery
) {
  const filter: Filter<TuitionDocument> = {
    tutorId: currentUser._id,
    deletedAt: null,
  };

  if (query.approvalStatus) {
    filter.approvalStatus = query.approvalStatus;
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

// Get one non-deleted tuition post owned by the authenticated tutor.
export async function getTutorTuitionById(
  id: string,
  currentUser: UserDocument
) {
  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid tuition ID.", 400);
  }

  const tuition = await tuitionRepository.findOne({
    _id: new ObjectId(id),
    tutorId: currentUser._id,
    deletedAt: null,
  });

  if (!tuition) {
    throw new AppError("Tuition post not found.", 404);
  }

  return {
    _id: tuition._id,
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
  };
}