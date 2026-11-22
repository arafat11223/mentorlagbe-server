
import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../lib/auth.js";
import { usersCollection } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

export const requireAuth: RequestHandler = async (
  req,
  _res,
  next
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AppError("Authentication required. Please sign in.", 401);
    }

    const businessUser = await usersCollection().findOne({
      authUserId: session.user.id,
    });

    if (!businessUser) {
      throw new AppError(
        "Your user profile could not be found.",
        403
      );
    }

    req.authUser = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    };

    req.currentUser = businessUser;

    next();
  } catch (error) {
    next(error);
  }
};
