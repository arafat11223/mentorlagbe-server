import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../../lib/auth.js";
import { AppError } from "../../utils/AppError.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import {
  updateBusinessUserImage,
  updateBusinessUserProfile,
} from "./user.service.js";

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

export const updateMyProfile: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = req.currentUser;

    if (!user) {
      throw new AppError("User profile not found.", 404);
    }

    const profile = res.locals.validatedRequest.body as {
      name: string;
      phone: string | null;
      bio: string;
    };

    await auth.api.updateUser({
      headers: fromNodeHeaders(req.headers),
      body: {
        name: profile.name,
      },
    });

    await updateBusinessUserProfile(
      user.authUserId,
      profile
    );

    return sendSuccess(res, {
      message: "Your profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfileImage: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = req.currentUser;

    if (!user) {
      throw new AppError("User profile not found.", 404);
    }

    const { image } = res.locals.validatedRequest.body as {
      image: string | null;
    };

    await updateBusinessUserImage(user.authUserId, image);

    return sendSuccess(res, {
      message: image
        ? "Profile image updated successfully."
        : "Profile image removed successfully.",
      data: { image },
    });
  } catch (error) {
    next(error);
  }
};