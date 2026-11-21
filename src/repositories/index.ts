
import { BaseRepository } from "./BaseRepository.js";

import {
  usersCollection,
  tuitionsCollection,
  applicationsCollection,
  paymentsCollection,
} from "../config/database.js";

import type {
  UserDocument,
  TuitionDocument,
  ApplicationDocument,
  PaymentDocument,
} from "../types/database.js";

export const userRepository =
  new BaseRepository<UserDocument>(usersCollection());

export const tuitionRepository =
  new BaseRepository<TuitionDocument>(tuitionsCollection());

export const applicationRepository =
  new BaseRepository<ApplicationDocument>(applicationsCollection());

export const paymentRepository =
  new BaseRepository<PaymentDocument>(paymentsCollection());
