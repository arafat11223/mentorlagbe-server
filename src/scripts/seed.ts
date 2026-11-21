
import { ObjectId } from "mongodb";

import {
  closeDatabase,
  connectDatabase,
} from "../config/db.js";

import {
  usersCollection,
  tuitionsCollection,
} from "../config/database.js";

import type {
  UserDocument,
  TuitionDocument,
} from "../types/database.js";

const now = new Date();

const tutorSeeds: UserDocument[] = [
  {
    _id: new ObjectId("690000000000000000000001"),
    authUserId: "seed:mentorlagbe:tutor-01",
    name: "Demo Tutor One",
    email: "tutor1@mentorlagbe.demo",
    image: null,
    role: "tutor",
    phone: "01710000001",
    bio: "Experienced Mathematics and Physics tutor.",
    plan: "free",
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: new ObjectId("690000000000000000000002"),
    authUserId: "seed:mentorlagbe:tutor-02",
    name: "Demo Tutor Two",
    email: "tutor2@mentorlagbe.demo",
    image: null,
    role: "tutor",
    phone: "01710000002",
    bio: "English and IELTS preparation tutor.",
    plan: "free",
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: new ObjectId("690000000000000000000003"),
    authUserId: "seed:mentorlagbe:tutor-03",
    name: "Demo Tutor Three",
    email: "tutor3@mentorlagbe.demo",
    image: null,
    role: "tutor",
    phone: "01710000003",
    bio: "Experienced science and programming tutor.",
    plan: "free",
    createdAt: now,
    updatedAt: now,
  },
];

const tuitionSeeds = [
  {
    id: "691000000000000000000001",
    tutorIndex: 0,
    title: "Mathematics Tutor for Class 9-10",
    tuitionType: "one-to-one",
    subject: "Mathematics",
    classLevel: "Class 9-10",
    mode: "offline",
    location: "Agrabad, Chattogram",
    monthlyFee: 5000,
    daysPerWeek: 4,
    description: "Looking for a dedicated Mathematics tutor for regular academic support.",
  },
  {
    id: "691000000000000000000002",
    tutorIndex: 0,
    title: "Physics Tutor for HSC Students",
    tuitionType: "group",
    subject: "Physics",
    classLevel: "HSC",
    mode: "online",
    location: "Online",
    monthlyFee: 4000,
    daysPerWeek: 3,
    description: "HSC Physics lessons with concept-based explanations and practice.",
  },
  {
    id: "691000000000000000000003",
    tutorIndex: 1,
    title: "English Version Tutor for Class 6",
    tuitionType: "one-to-one",
    subject: "English",
    classLevel: "Class 6",
    mode: "offline",
    location: "GEC, Chattogram",
    monthlyFee: 4500,
    daysPerWeek: 4,
    description: "English Version student needs support in English and general subjects.",
  },
  {
    id: "691000000000000000000004",
    tutorIndex: 1,
    title: "IELTS Academic Preparation",
    tuitionType: "group",
    subject: "IELTS",
    classLevel: "IELTS Preparation",
    mode: "online",
    location: "Online",
    monthlyFee: 6000,
    daysPerWeek: 3,
    description: "Structured IELTS Academic preparation with speaking and writing practice.",
  },
  {
    id: "691000000000000000000005",
    tutorIndex: 2,
    title: "Chemistry Tutor for HSC",
    tuitionType: "one-to-one",
    subject: "Chemistry",
    classLevel: "HSC",
    mode: "offline",
    location: "Panchlaish, Chattogram",
    monthlyFee: 5500,
    daysPerWeek: 4,
    description: "HSC Chemistry tutor needed for theory and problem-solving support.",
  },
  {
    id: "691000000000000000000006",
    tutorIndex: 2,
    title: "Programming Fundamentals for Beginners",
    tuitionType: "group",
    subject: "Programming",
    classLevel: "Beginner",
    mode: "online",
    location: "Online",
    monthlyFee: 3500,
    daysPerWeek: 2,
    description: "Beginner-friendly programming lessons covering fundamental concepts.",
  },
  {
    id: "691000000000000000000007",
    tutorIndex: 0,
    title: "ICT Tutor for Class 11-12",
    tuitionType: "one-to-one",
    subject: "ICT",
    classLevel: "HSC",
    mode: "offline",
    location: "Khulshi, Chattogram",
    monthlyFee: 4000,
    daysPerWeek: 3,
    description: "HSC ICT tutor needed for practical and theoretical preparation.",
  },
  {
    id: "691000000000000000000008",
    tutorIndex: 1,
    title: "Primary School All Subjects Tutor",
    tuitionType: "one-to-one",
    subject: "All Subjects",
    classLevel: "Class 4-5",
    mode: "offline",
    location: "Halishahar, Chattogram",
    monthlyFee: 3500,
    daysPerWeek: 5,
    description: "Patient tutor needed for primary-level academic support.",
  },
  {
    id: "691000000000000000000009",
    tutorIndex: 2,
    title: "Biology Tutor for HSC Students",
    tuitionType: "group",
    subject: "Biology",
    classLevel: "HSC",
    mode: "online",
    location: "Online",
    monthlyFee: 4500,
    daysPerWeek: 3,
    description: "HSC Biology lessons focused on understanding and exam preparation.",
  },
  {
    id: "691000000000000000000010",
    tutorIndex: 2,
    title: "General Mathematics for Class 7-8",
    tuitionType: "one-to-one",
    subject: "Mathematics",
    classLevel: "Class 7-8",
    mode: "offline",
    location: "Nasirabad, Chattogram",
    monthlyFee: 4000,
    daysPerWeek: 4,
    description: "Regular Mathematics tutoring for middle-school students.",
  },
] as const;

async function seedDatabase() {
  try {
    await connectDatabase();

    const users = usersCollection();
    const tuitions = tuitionsCollection();

    // Insert demo tutor profiles if they do not exist.
    for (const tutor of tutorSeeds) {
      await users.updateOne(
        { authUserId: tutor.authUserId },
        { $setOnInsert: tutor },
        { upsert: true }
      );
    }

    const tutors = await Promise.all(
      tutorSeeds.map((tutor) =>
        users.findOne({ authUserId: tutor.authUserId })
      )
    );

    for (const seed of tuitionSeeds) {
      const tutor = tutors[seed.tutorIndex];

      if (!tutor) {
        throw new Error(
          `Seed tutor not found for tuition: ${seed.title}`
        );
      }

      const tuition: TuitionDocument = {
        _id: new ObjectId(seed.id),
        tutorId: tutor._id,
        tutorName: tutor.name,
        tutorEmail: tutor.email,

        title: seed.title,
        tuitionType: seed.tuitionType,
        subject: seed.subject,
        classLevel: seed.classLevel,

        mode: seed.mode,
        location: seed.location,

        monthlyFee: seed.monthlyFee,
        daysPerWeek: seed.daysPerWeek,

        bannerImage: null,
        description: seed.description,

        approvalStatus: "approved",
        isActive: true,
        deletedAt: null,

        createdAt: now,
        updatedAt: now,
      };

      await tuitions.updateOne(
        { _id: tuition._id },
        { $setOnInsert: tuition },
        { upsert: true }
      );
    }

    console.log("MentorLagbe seed completed successfully.");
    console.log(`Demo tutor profiles: ${tutorSeeds.length}`);
    console.log(`Demo tuition listings: ${tuitionSeeds.length}`);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

seedDatabase();
