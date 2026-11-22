
import type { RequestHandler } from "express";

import type { UserRole } from "../types/database.js";
import { AppError } from "../utils/AppError.js";

export function requireRole(
  ...allowedRoles: UserRole[]
): RequestHandler {
  return (req, _res, next) => {
    const currentUser = req.currentUser;

    if (!currentUser) {
      return next(
        new AppError(
          "Authentication required before authorization.",
          401
        )
      );
    }

    if (!allowedRoles.includes(currentUser.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action.",
          403
        )
      );
    }

    next();
  };
}
