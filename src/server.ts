
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";

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
  res.status(200).json({
    success: true,
    message: "MentorLagbe API is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const server = app.listen(env.PORT, () => {
  console.log(
    `MentorLagbe server running at http://localhost:${env.PORT}`
  );
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`${signal} received. Closing server...`);

  server.close((error) => {
    if (error) {
      console.error("Error while closing server:", error);
      process.exit(1);
    }

    console.log("Server closed successfully.");
    process.exit(0);
  });
};

// Handle termination signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
