
export const COLLECTIONS = {
  USERS: "users",
  TUITIONS: "tuitions",
  APPLICATIONS: "applications",
  PAYMENTS: "payments",
} as const;

export type CollectionName =
  (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
