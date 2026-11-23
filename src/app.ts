import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";

import { env } from "./config/env.js";
import { auth } from "./lib/auth.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { sendSuccess } from "./utils/apiResponse.js";

import userRoutes from "./modules/users/user.routes.js";
import tuitionRoutes from "./modules/tuitions/tuition.routes.js";
import statisticsRoutes from "./modules/statistics/statistics.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import uploadRoutes from "./modules/uploads/upload.routes.js";
import applicationRoutes from "./modules/applications/application.routes.js";

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

// Better Auth must be mounted before body parsers.
app.all("/api/auth/*splat", toNodeHandler(auth));

// Parse JSON request bodies for other API routes
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

// User routes
app.use("/api/users", userRoutes);

// Tuition routes
app.use("/api/tuitions", tuitionRoutes);

// Public platform statistics
app.use("/api/statistics", statisticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/applications", applicationRoutes);

// Handle unknown routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;
