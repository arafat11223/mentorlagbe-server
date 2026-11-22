
import type { RequestHandler } from "express";

import { AppError } from "../../utils/AppError.js";
import { sendSuccess } from "../../utils/apiResponse.js";

export const getMyProfile: RequestHandler = (
  req,
  res,
  next
) => {
  const user = req.currentUser;

  if (!user) {
    return next(
      new AppError("User profile not found.", 404)
    );
  }

  return sendSuccess(res, {
    message: "Your profile retrieved successfully.",
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      plan: user.plan,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};
