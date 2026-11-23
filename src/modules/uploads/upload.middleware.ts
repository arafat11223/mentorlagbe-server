import multer from "multer";
import type { RequestHandler } from "express";

import { AppError } from "../../utils/AppError.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new AppError(
          "Only JPEG, PNG, and WebP images are allowed.",
          400
        )
      );
    }

    callback(null, true);
  },
});

const singleImageUpload = upload.single("image");

export const uploadImageFile: RequestHandler = (
  req,
  res,
  next
) => {
  singleImageUpload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError("Image size cannot exceed 5 MB.", 400)
        );
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return next(
          new AppError("Only one image can be uploaded at a time.", 400)
        );
      }

      return next(
        new AppError("Invalid image upload request.", 400)
      );
    }

    if (error) {
      return next(error);
    }

    if (!req.file) {
      return next(
        new AppError("Please select an image to upload.", 400)
      );
    }

    next();
  });
};
