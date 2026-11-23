import type { RequestHandler } from "express";

import { AppError } from "../../utils/AppError.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { uploadImageToImgBB } from "./upload.service.js";

export const uploadImage: RequestHandler = async (
  req,
  res
) => {
  if (!req.file) {
    throw new AppError(
      "Please select an image to upload.",
      400
    );
  }

  const imageUrl = await uploadImageToImgBB(req.file);

  sendSuccess(res, {
    message: "Image uploaded successfully.",
    data: {
      imageUrl,
    },
    statusCode: 201,
  });
};
