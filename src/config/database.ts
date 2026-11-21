
import type { Collection, Document } from "mongodb";

import { getDatabase } from "./db.js";
import { COLLECTIONS } from "./collections.js";

import type {
  UserDocument,
  TuitionDocument,
  ApplicationDocument,
  PaymentDocument,
} from "../types/database.js";

export function getCollection<T extends Document>(
  collectionName: string
): Collection<T> {
  return getDatabase().collection<T>(collectionName);
}

export const usersCollection = (): Collection<UserDocument> =>
  getCollection<UserDocument>(COLLECTIONS.USERS);

export const tuitionsCollection = (): Collection<TuitionDocument> =>
  getCollection<TuitionDocument>(COLLECTIONS.TUITIONS);

export const applicationsCollection =
  (): Collection<ApplicationDocument> =>
    getCollection<ApplicationDocument>(COLLECTIONS.APPLICATIONS);

export const paymentsCollection = (): Collection<PaymentDocument> =>
  getCollection<PaymentDocument>(COLLECTIONS.PAYMENTS);
