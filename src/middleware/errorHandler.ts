import type { ErrorRequestHandler } from "express";

import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error && env.NODE_ENV === "development") {
    message = error.message;
  }

  if (statusCode >= 500) {
    console.error("Server Error:", error);
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode >= 500 ? "error" : "fail",
    message,
    ...(env.NODE_ENV === "development" && error instanceof Error
      ? { stack: error.stack }
      : {}),
  });
};