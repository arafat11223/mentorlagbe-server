import { z } from "zod";

const tuitionTypeSchema = z.enum([
  "group",
  "one-to-one",
]);

const tuitionModeSchema = z.enum([
  "online",
  "offline",
]);

const approvalStatusSchema = z.enum([
  "approved",
  "rejected",
]);

const tuitionFields = {
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(120, "Title cannot exceed 120 characters."),

  tuitionType: tuitionTypeSchema,

  subject: z
    .string()
    .trim()
    .min(2, "Subject is required.")
    .max(60),

  classLevel: z
    .string()
    .trim()
    .min(2, "Class level is required.")
    .max(60),

  mode: tuitionModeSchema,

  location: z
    .string()
    .trim()
    .min(2, "Location is required.")
    .max(150),

  monthlyFee: z
    .number()
    .finite()
    .int()
    .min(0, "Monthly fee cannot be negative.")
    .max(1000000),

  daysPerWeek: z
    .number()
    .int()
    .min(1)
    .max(7),

  bannerImage: z
    .string()
    .trim()
    .url("Please provide a valid image URL.")
    .nullable(),

  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(3000),
};

const tuitionIdParamsSchema = z.object({
  id: z.string().regex(
    /^[a-fA-F0-9]{24}$/,
    "Invalid tuition ID."
  ),
});

export const createTuitionSchema = z.object({
  body: z.object(tuitionFields),
});

export const updateTuitionSchema = z.object({
  params: tuitionIdParamsSchema,
  body: z
    .object(tuitionFields)
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field is required for an update."
    ),
});

export const tuitionListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(9),

    search: z.string().trim().max(100).optional(),

    subject: z.string().trim().max(60).optional(),

    classLevel: z.string().trim().max(60).optional(),

    mode: tuitionModeSchema.optional(),

    sort: z.enum(["latest"]).default("latest"),
  }),
});

export const updateTuitionStatusSchema = z.object({
  params: tuitionIdParamsSchema,
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const updateTuitionApprovalSchema = z.object({
  params: tuitionIdParamsSchema,
  body: z.object({
    approvalStatus: approvalStatusSchema,
  }),
});

export const mongoIdSchema = z.object({
  params: tuitionIdParamsSchema,
});