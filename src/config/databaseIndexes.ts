
import type { Db, IndexDescription } from "mongodb";

import { COLLECTIONS } from "./collections.js";

const indexes: Record<string, IndexDescription[]> = {
  [COLLECTIONS.USERS]: [
    { key: { authUserId: 1 }, unique: true },
    { key: { email: 1 }, unique: true },
    { key: { role: 1 } },
  ],

  [COLLECTIONS.TUITIONS]: [
    { key: { tutorId: 1, deletedAt: 1 } },
    {
      key: {
        approvalStatus: 1,
        isActive: 1,
        deletedAt: 1,
      },
    },
    { key: { subject: 1, classLevel: 1 } },
    { key: { createdAt: -1 } },
    { key: { title: "text", subject: "text" } },
  ],

  [COLLECTIONS.APPLICATIONS]: [
    { key: { tuitionId: 1, status: 1 } },
    { key: { studentId: 1, appliedAt: -1 } },
    { key: { tutorId: 1, status: 1 } },
    {
      key: { tuitionId: 1, studentId: 1 },
      unique: true,
      partialFilterExpression: {
        status: { $in: ["pending", "accepted"] },
      },
    },
  ],

  [COLLECTIONS.PAYMENTS]: [
    { key: { userId: 1, createdAt: -1 } },
    { key: { stripeSessionId: 1 }, unique: true },
    {
      key: { stripeEventId: 1 },
      unique: true,
      partialFilterExpression: {
        stripeEventId: { $type: "string" },
      },
    },
    { key: { paymentStatus: 1, createdAt: -1 } },
  ],
};

export async function createDatabaseIndexes(db: Db): Promise<void> {
  for (const [collectionName, collectionIndexes] of Object.entries(indexes)) {
    await db.collection(collectionName).createIndexes(collectionIndexes);
  }

  console.log("MongoDB indexes created successfully.");
}
