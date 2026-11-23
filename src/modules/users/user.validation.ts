import { z } from "zod";

export const updateProfileImageSchema = z.object({
  body: z.object({
    image: z
      .string()
      .trim()
      .url("Please provide a valid image URL.")
      .refine((value) => {
        try {
          const url = new URL(value);

          return (
            url.protocol === "https:" &&
            url.hostname === "i.ibb.co"
          );
        } catch {
          return false;
        }
      }, "Only secure ImgBB image URLs are allowed.")
      .nullable(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters.")
      .max(80, "Name cannot exceed 80 characters."),
    phone: z
      .string()
      .trim()
      .max(30, "Phone number cannot exceed 30 characters.")
      .nullable(),
    bio: z
      .string()
      .trim()
      .max(500, "Bio cannot exceed 500 characters."),
  }).strict(),
});