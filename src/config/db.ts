
import { MongoClient, type Db } from "mongodb";

import { env } from "./env.js";
import { createDatabaseIndexes } from "./databaseIndexes.js";
import { createDatabaseValidators } from "./databaseValidators.js";

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (database) return database;

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const mongoClient = new MongoClient(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await mongoClient.connect();

    const db = mongoClient.db(env.MONGODB_DB_NAME);

    await createDatabaseIndexes(db);
    await createDatabaseValidators(db);

    client = mongoClient;
    database = db;

    console.log(
      `MongoDB connected successfully: ${env.MONGODB_DB_NAME}`
    );

    return db;
  } catch (error) {
    await mongoClient.close();
    throw error;
  }
}

export function getDatabase(): Db {
  if (!database) {
    throw new Error(
      "Database is not connected. Call connectDatabase() first."
    );
  }

  return database;
}

export function getMongoClient(): MongoClient {
  if (!client) {
    throw new Error(
      "MongoDB client is not connected. Call connectDatabase() first."
    );
  }

  return client;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();

    client = null;
    database = null;

    console.log("MongoDB connection closed.");
  }
}
