import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { setServers } from "node:dns";

import {
  closeDatabase,
  connectDatabase,
} from "../config/db.js";

import { env } from "../config/env.js";
import { usersCollection } from "../config/database.js";

async function promoteAdmin(): Promise<void> {
  const terminal = createInterface({
    input: stdin,
    output: stdout,
  });

  try {
    const email = (
      await terminal.question(
        "Enter the existing account email to promote: "
      )
    ).trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    // Match the development DNS configuration used by server.ts.
    if (env.NODE_ENV === "development") {
      setServers(["8.8.8.8", "1.1.1.1"]);
      console.log("[DNS] Configured Google and Cloudflare DNS.");
    }

    await connectDatabase();

    const users = usersCollection();
    const matches = await users.find({ email }).limit(2).toArray();

    if (matches.length !== 1) {
      throw new Error(
        matches.length === 0
          ? "No existing business account found for this email."
          : "Multiple accounts matched. Promotion cancelled."
      );
    }

    const user = matches[0];

    if (!user) {
      throw new Error("Account could not be loaded.");
    }

    if (!user.authUserId || user.authUserId.startsWith("seed:")) {
      throw new Error(
        "This is not an eligible authenticated user account."
      );
    }

    if (user.role === "admin") {
      console.log("This account is already an Admin.");
      return;
    }

    if (user.role !== "student" && user.role !== "tutor") {
      throw new Error("This account has an unsupported role.");
    }

    console.log(`Account found: ${user.name}`);
    console.log(`Current role: ${user.role}`);

    const confirmation = (
      await terminal.question(
        "Promote this account to Admin? (yes/no): "
      )
    ).trim().toLowerCase();

    if (confirmation !== "yes") {
      console.log("Promotion cancelled. No changes were made.");
      return;
    }

    const result = await users.updateOne(
      {
        _id: user._id,
        authUserId: user.authUserId,
        role: user.role,
      },
      {
        $set: {
          role: "admin",
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount !== 1) {
      throw new Error(
        "Promotion could not be confirmed. Please inspect the account."
      );
    }

    console.log("-----------------------------------");
    console.log("Admin promotion completed successfully.");
    console.log(`Account: ${user.name}`);
    console.log("New business role: admin");
    console.log("-----------------------------------");
  } catch (error) {
    console.error(
      "Admin promotion failed:",
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  } finally {
    terminal.close();

    try {
      await closeDatabase();
    } catch (error) {
      console.error("Database cleanup failed:", error);
      process.exitCode = 1;
    }
  }
}

void promoteAdmin();
