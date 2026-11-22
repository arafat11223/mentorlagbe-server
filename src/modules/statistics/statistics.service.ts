import {
  usersCollection,
  tuitionsCollection,
} from "../../config/database.js";

// Return public platform statistics using real database counts.
export async function getPlatformStatistics() {
  const users = usersCollection();
  const tuitions = tuitionsCollection();

  const [
    totalStudents,
    totalTutors,
    approvedTuitions,
  ] = await Promise.all([
    users.countDocuments({ role: "student" }),
    users.countDocuments({ role: "tutor" }),
    tuitions.countDocuments({
      approvalStatus: "approved",
      isActive: true,
      deletedAt: null,
    }),
  ]);

  return {
    totalStudents,
    totalTutors,
    approvedTuitions,
  };
}