
import type { Db, Document } from "mongodb";

import { COLLECTIONS } from "./collections.js";

const nullableString = {
  bsonType: ["string", "null"],
};

const nullableDate = {
  bsonType: ["date", "null"],
};

const schemas: Record<string, Document> = {
  [COLLECTIONS.USERS]: {
    bsonType: "object",
    required: [
      "authUserId",
      "name",
      "email",
      "image",
      "role",
      "phone",
      "bio",
      "plan",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      authUserId: { bsonType: "string" },
      name: { bsonType: "string" },
      email: { bsonType: "string" },
      image: nullableString,
      role: {
        enum: ["student", "tutor", "admin"],
      },
      phone: nullableString,
      bio: { bsonType: "string" },
      plan: {
        enum: ["free", "pro"],
      },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },

  [COLLECTIONS.TUITIONS]: {
    bsonType: "object",
    required: [
      "tutorId",
      "tutorName",
      "tutorEmail",
      "title",
      "tuitionType",
      "subject",
      "classLevel",
      "mode",
      "location",
      "monthlyFee",
      "daysPerWeek",
      "bannerImage",
      "description",
      "approvalStatus",
      "isActive",
      "deletedAt",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      tutorId: { bsonType: "objectId" },
      tutorName: { bsonType: "string" },
      tutorEmail: { bsonType: "string" },
      title: { bsonType: "string" },
      tuitionType: {
        enum: ["group", "one-to-one"],
      },
      subject: { bsonType: "string" },
      classLevel: { bsonType: "string" },
      mode: {
        enum: ["online", "offline"],
      },
      location: { bsonType: "string" },
      monthlyFee: {
        bsonType: ["int", "long", "double", "decimal"],
        minimum: 0,
      },
      daysPerWeek: {
        bsonType: ["int", "long"],
        minimum: 1,
        maximum: 7,
      },
      bannerImage: nullableString,
      description: { bsonType: "string" },
      approvalStatus: {
        enum: ["pending", "approved", "rejected"],
      },
      isActive: { bsonType: "bool" },
      deletedAt: nullableDate,
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },

  [COLLECTIONS.APPLICATIONS]: {
    bsonType: "object",
    required: [
      "tuitionId",
      "studentId",
      "tutorId",
      "tuitionTitle",
      "subject",
      "monthlyFee",
      "tutorEmail",
      "studentName",
      "studentEmail",
      "studentPhone",
      "preferredSchedule",
      "studentNote",
      "status",
      "appliedAt",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      tuitionId: { bsonType: "objectId" },
      studentId: { bsonType: "objectId" },
      tutorId: { bsonType: "objectId" },
      tuitionTitle: { bsonType: "string" },
      subject: { bsonType: "string" },
      monthlyFee: {
        bsonType: ["int", "long", "double", "decimal"],
        minimum: 0,
      },
      tutorEmail: { bsonType: "string" },
      studentName: { bsonType: "string" },
      studentEmail: { bsonType: "string" },
      studentPhone: { bsonType: "string" },
      preferredSchedule: { bsonType: "string" },
      studentNote: { bsonType: "string" },
      status: {
        enum: ["pending", "accepted", "rejected", "cancelled"],
      },
      appliedAt: { bsonType: "date" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },

  [COLLECTIONS.PAYMENTS]: {
    bsonType: "object",
    required: [
      "userId",
      "userEmail",
      "userName",
      "userRole",
      "planName",
      "amount",
      "currency",
      "transactionId",
      "stripeSessionId",
      "stripeEventId",
      "paymentStatus",
      "paidAt",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      userId: { bsonType: "objectId" },
      userEmail: { bsonType: "string" },
      userName: { bsonType: "string" },
      userRole: {
        enum: ["student", "tutor", "admin"],
      },
      planName: { bsonType: "string" },
      amount: {
        bsonType: ["int", "long", "double", "decimal"],
        minimum: 0,
      },
      currency: {
        enum: ["bdt"],
      },
      transactionId: nullableString,
      stripeSessionId: { bsonType: "string" },
      stripeEventId: nullableString,
      paymentStatus: {
        enum: ["pending", "paid", "failed"],
      },
      paidAt: nullableDate,
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },
};

export async function createDatabaseValidators(
  db: Db
): Promise<void> {
  for (const [collectionName, schema] of Object.entries(schemas)) {
    await db.command({
      collMod: collectionName,
      validator: {
        $jsonSchema: schema,
      },
      validationLevel: "strict",
      validationAction: "error",
    });
  }

  console.log("MongoDB collection validators created successfully.");
}
