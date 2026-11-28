import { z } from "zod";

export const verifyCheckoutSessionSchema = z.object({
  body: z.object({
    sessionId: z.string().trim().min(1).max(255),
  }),
  params: z.object({}),
  query: z.object({}),
});
