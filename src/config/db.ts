
import { MongoClient, type Db } from "mongodb";

import { env } from "./env.js";

// MongoDB client instance
let client: MongoClient | null = null;

// Database instance
let database: Db | null = null;

// Connect to MongoDB
export async function connectDatabase(): Promise<Db> {
  // Reuse existing connection
  if (database) {
    return database;
  }

  // Check MongoDB connection string
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  // Create MongoDB client
  const mongoClient = new MongoClient(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  // Connect to MongoDB Atlas
  await mongoClient.connect();

  // Store connection instances
  client = mongoClient;
  database = mongoClient.db(env.MONGODB_DB_NAME);

  console.log(
    `MongoDB connected successfully: ${env.MONGODB_DB_NAME}`
  );

  return database;
}

// Get existing database instance
export function getDatabase(): Db {
  if (!database) {
    throw new Error(
      "Database is not connected. Call connectDatabase() first."
    );
  }

  return database;
}

// Close MongoDB connection
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();

    client = null;
    database = null;

    console.log("MongoDB connection closed.");
  }
}
