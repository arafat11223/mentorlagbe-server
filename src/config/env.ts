
import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env
dotenv.config();

// Convert empty environment values to undefined
const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1).optional()
);

// Define environment variable validation rules
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  CLIENT_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),

  MONGODB_URI: optionalString,

  MONGODB_DB_NAME: z
    .string()
    .trim()
    .min(1)
    .default("mentorlagbe"),

  BETTER_AUTH_SECRET: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(32).optional()
  ),

  BETTER_AUTH_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional()
  ),

  STRIPE_SECRET_KEY: optionalString,

  STRIPE_WEBHOOK_SECRET: optionalString,

  IMGBB_API_KEY: optionalString,
});

// Validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");

  parsedEnv.error.issues.forEach((issue) => {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  });

  process.exit(1);
}

// Export validated environment variables
export const env = parsedEnv.data;
