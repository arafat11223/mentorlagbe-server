
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

import { env } from "../config/env.js";
import {
  getDatabase,
  getMongoClient,
} from "../config/db.js";

import { syncBusinessUserProfile } from "../modules/users/user.service.js";

if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET must be configured with at least 32 characters."
  );
}

if (!env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL is not configured.");
}

export const auth = betterAuth({
  appName: "MentorLagbe",

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(getDatabase(), {
    client: getMongoClient(),
  }),

  trustedOrigins: [env.CLIENT_URL],

  user: {
    additionalFields: {
      role: {
        type: ["student", "tutor"],
        required: true,
        defaultValue: "student",
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = (
            user as typeof user & { role?: unknown }
          ).role;

          if (role !== "student" && role !== "tutor") {
            throw new APIError("BAD_REQUEST", {
              message: "Only student and tutor accounts are allowed.",
            });
          }

          return {
            data: user,
          };
        },

        after: async (user) => {
          const role = (
            user as typeof user & { role?: unknown }
          ).role;

          await syncBusinessUserProfile({
            authUserId: user.id,
            name: user.name,
            email: user.email,
            image: user.image ?? null,
            role,
          });
        },
      },

      update: {
        before: async (userData) => {
          if ("role" in userData) {
            throw new APIError("FORBIDDEN", {
              message: "You are not allowed to change your account role.",
            });
          }

          return {
            data: userData,
          };
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  advanced: {
    database: {
      joins: true,
    },
  },
});
