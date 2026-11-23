
import type { Document, ObjectId } from "mongodb";

// ============================================
// Common Types
// ============================================

export type UserRole = "student" | "tutor" | "admin";

export type UserPlan = "free" | "pro";

export type TuitionType = "group" | "one-to-one";

export type TuitionMode = "online" | "offline";

export type TuitionApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed";

export interface BaseDocument extends Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Users Collection
// ============================================

export interface UserDocument extends BaseDocument {
  authUserId: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  phone: string | null;
  bio: string;
  plan: UserPlan;
}

// ============================================
// Tuitions Collection
// ============================================

export interface TuitionDocument extends BaseDocument {
  tutorId: ObjectId;
  tutorName: string;
  tutorEmail: string;

  title: string;
  tuitionType: TuitionType;
  subject: string;
  classLevel: string;

  mode: TuitionMode;
  location: string;

  monthlyFee: number;
  daysPerWeek: number;

  bannerImage: string | null;
  description: string;

  approvalStatus: TuitionApprovalStatus;
  isActive: boolean;

  deletedAt: Date | null;
}

// ============================================
// Applications Collection
// ============================================

export interface ApplicationDocument extends BaseDocument {
  tuitionId: ObjectId;
  studentId: ObjectId;
  tutorId: ObjectId;

  tuitionTitle: string;
  subject: string;
  monthlyFee: number;

  tutorEmail: string;

  studentName: string;
  studentEmail: string;
  studentPhone: string;

  preferredSchedule: string;
  studentNote: string;

  status: ApplicationStatus;
  appliedAt: Date;
}

// ============================================
// Payments Collection
// ============================================

export interface PaymentDocument extends BaseDocument {
  userId: ObjectId;
  userEmail: string;
  userName: string;
  userRole: UserRole;

  planName: string;

  amount: number;
  currency: "usd";

  transactionId: string | null;
  stripeSessionId: string;
  stripeEventId: string | null;

  paymentStatus: PaymentStatus;
  paidAt: Date | null;
}
