
import { usersCollection } from "../../config/database.js";
import type { UserRole } from "../../types/database.js";

interface SyncBusinessUserInput {
  authUserId: string;
  name: string;
  email: string;
  image: string | null;
  role: unknown;
}

function isPublicRole(role: unknown): role is Extract<UserRole, "student" | "tutor"> {
  return role === "student" || role === "tutor";
}

export async function syncBusinessUserProfile(
  input: SyncBusinessUserInput
): Promise<void> {
  const {
    authUserId,
    name,
    email,
    image,
    role,
  } = input;

  if (!authUserId || !name || !email) {
    throw new Error("Required authentication user information is missing.");
  }

  if (!isPublicRole(role)) {
    throw new Error("Invalid public user role.");
  }

  const collection = usersCollection();

  // Prevent linking an existing profile to a different auth account.
  const existingByEmail = await collection.findOne({ email });

  if (
    existingByEmail &&
    existingByEmail.authUserId !== authUserId
  ) {
    throw new Error(
      "A business profile with this email already exists."
    );
  }

  const now = new Date();

  // Upsert makes profile synchronization idempotent.
  await collection.updateOne(
    { authUserId },
    {
      $set: {
        name,
        email,
        image,
        updatedAt: now,
      },
      $setOnInsert: {
        authUserId,
        role,
        phone: null,
        bio: "",
        plan: "free",
        createdAt: now,
      },
    },
    { upsert: true }
  );
}
