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
