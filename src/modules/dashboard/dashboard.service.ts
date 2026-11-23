import {
  usersCollection,
  tuitionsCollection,
  applicationsCollection,
  paymentsCollection,
} from "../../config/database.js";

// ============================================
// Student Dashboard Statistics
// ============================================

export async function getStudentDashboard(userId: import("mongodb").ObjectId) {
  const applications = applicationsCollection();

  const [
    totalApplications,
    pendingApplications,
    acceptedApplications,
  ] = await Promise.all([
    applications.countDocuments({
      studentId: userId,
    }),
    applications.countDocuments({
      studentId: userId,
      status: "pending",
    }),
    applications.countDocuments({
      studentId: userId,
      status: "accepted",
    }),
  ]);

  const user = await usersCollection().findOne(
    { _id: userId },
    { projection: { plan: 1 } }
  );

  return {
    totalApplications,
    pendingApplications,
    acceptedApplications,
    currentPlan: user?.plan ?? "free",
  };
}

// ============================================
// Tutor Dashboard Statistics
// ============================================

export async function getTutorDashboard(userId: import("mongodb").ObjectId) {
  const tuitions = tuitionsCollection();
  const applications = applicationsCollection();

  const [
    totalTuitions,
    approvedActiveTuitions,
    totalApplicants,
  ] = await Promise.all([
    tuitions.countDocuments({
      tutorId: userId,
      deletedAt: null,
    }),
    tuitions.countDocuments({
      tutorId: userId,
      approvalStatus: "approved",
      isActive: true,
      deletedAt: null,
    }),
    applications.countDocuments({
      tutorId: userId,
    }),
  ]);

  const user = await usersCollection().findOne(
    { _id: userId },
    { projection: { plan: 1 } }
  );

  return {
    totalTuitions,
    approvedActiveTuitions,
    totalApplicants,
    currentPlan: user?.plan ?? "free",
  };
}

// ============================================
// Admin Dashboard Statistics
// ============================================

export async function getAdminDashboard() {
  const users = usersCollection();
  const tuitions = tuitionsCollection();
  const payments = paymentsCollection();

  const [
    totalUsers,
    totalTutors,
    pendingTuitions,
    approvedTuitions,
    revenueByCurrency,
  ] = await Promise.all([
    users.countDocuments({}),

    users.countDocuments({
      role: "tutor",
    }),

    tuitions.countDocuments({
      approvalStatus: "pending",
      deletedAt: null,
    }),

    tuitions.countDocuments({
      approvalStatus: "approved",
      deletedAt: null,
    }),

    payments.aggregate<{
      _id: string;
      totalAmount: number;
      totalPayments: number;
    }>([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: "$currency",
          totalAmount: {
            $sum: "$amount",
          },
          totalPayments: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]).toArray(),
  ]);

  return {
    totalUsers,
    totalTutors,
    pendingTuitions,
    approvedTuitions,
    revenueByCurrency: revenueByCurrency.map((item) => ({
      currency: item._id,
      totalAmount: item.totalAmount,
      totalPayments: item.totalPayments,
    })),
  };
}
