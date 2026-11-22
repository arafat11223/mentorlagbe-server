
import { setServers } from "node:dns";

import { env } from "./config/env.js";
import {
  closeDatabase,
  connectDatabase,
} from "./config/db.js";

// Configure DNS before MongoDB performs SRV record lookup.
if (env.NODE_ENV === "development") {
  setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("[DNS] Configured Google and Cloudflare DNS.");
}

async function startServer() {
  try {
    // Connect to MongoDB before loading authentication.
    await connectDatabase();

    // Load Express application after database initialization.
    const { default: app } = await import("./app.js");

    // Start HTTP server.
    const server = app.listen(env.PORT, () => {
      console.log(
        `MentorLagbe server running at http://localhost:${env.PORT}`
      );
    });

    // Graceful shutdown.
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

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start MentorLagbe server:", error);

    await closeDatabase();

    process.exit(1);
  }
}

startServer();
