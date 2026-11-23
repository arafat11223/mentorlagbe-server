import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

interface ImgBBResponse {
  success: boolean;
  data?: {
    url?: string;
    display_url?: string;
  };
}

function validateImageSignature(
  buffer: Buffer,
  mimeType: string
): boolean {
  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([
          0x89, 0x50, 0x4e, 0x47,
          0x0d, 0x0a, 0x1a, 0x0a,
        ])
      )
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  return false;
}

export async function uploadImageToImgBB(
  file: Express.Multer.File
): Promise<string> {
  if (!env.IMGBB_API_KEY) {
    throw new AppError(
      "Image upload is not configured on the server.",
      503
    );
  }

  if (
    !validateImageSignature(file.buffer, file.mimetype)
  ) {
    throw new AppError(
      "The uploaded file is not a valid JPEG, PNG, or WebP image.",
      400
    );
  }

  const formData = new FormData();

  formData.append(
    "image",
    file.buffer.toString("base64")
  );

  const url = new URL("https://api.imgbb.com/1/upload");
  url.searchParams.set("key", env.IMGBB_API_KEY);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(20_000),
    });

    const result = (await response.json()) as ImgBBResponse;

    if (
      !response.ok ||
      result.success !== true ||
      !result.data?.url
    ) {
      throw new AppError(
        "Image hosting service could not upload the image.",
        502
      );
    }

    return result.data.url;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Image hosting service is temporarily unavailable.",
      502
    );
  }
}
