import type { RequestHandler } from "express";
import type { z } from "zod";

import { AppError } from "../utils/AppError.js";

export function validateRequest(
  schema: z.ZodType,
): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(" ");

      return next(new AppError(message, 400));
    }

    res.locals.validatedRequest = result.data;

    next();
  };
}