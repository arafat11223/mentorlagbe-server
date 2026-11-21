import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sendSuccess } from "./utils/apiResponse.js";

// Initialize Express application
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Request logging
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

// Parse JSON request bodies
app.use(express.json({ limit: "1mb" }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  return sendSuccess(res, {
    message: "MentorLagbe API is running",
    data: {
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// Handle unknown routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;