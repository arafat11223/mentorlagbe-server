
import app from "./app.js";
import { env } from "./config/env.js";
import {
  closeDatabase,
  connectDatabase,
} from "./config/db.js";

async function startServer() {
  try {
    // Connect to MongoDB before starting the server
    await connectDatabase();

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      console.log(
        `MentorLagbe server running at http://localhost:${env.PORT}`
      );
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      console.log(`${signal} received. Closing server...`);

      server.close(async (error) => {
        try {
          await closeDatabase();
        } catch (databaseError) {
          console.error(
            "Error while closing MongoDB connection:",
            databaseError
          );
        }

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
  } catch (error) {
    console.error("Failed to start MentorLagbe server:", error);

    await closeDatabase();

    process.exit(1);
  }
}

startServer();
