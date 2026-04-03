import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";

let clientPromise: Promise<MongoClient>;

if (!uri) {
  // Return a promise that rejects clearly instead of throwing at import time.
  clientPromise = Promise.reject(
    new Error("MONGODB_URI is not set. Add it to apps/web/.env.local"),
  );
} else if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export default clientPromise;
