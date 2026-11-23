import { z } from "zod";

const objectIdSchema = z.string().regex(
  /^[a-f\d]{24}$/i,
  "A valid ID is required."
);

export const createApplicationSchema = z.object({
  body: z.object({
    studentPhone: z.string().trim().min(7).max(20),
    preferredSchedule: z.string().trim().min(3).max(200),
    studentNote: z.string().trim().max(1000).default(""),
  }),
  params: z.object({
    tuitionId: objectIdSchema,
  }),
  query: z.object({}),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(["accepted", "rejected"]),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const applicationIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});
