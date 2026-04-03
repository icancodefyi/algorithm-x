import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Lazy Mongo client — avoids rejecting or connecting at module load time
 * (so `next build` works without MONGODB_URI until a route actually runs).
 */
export function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI ?? "";
  if (!uri) {
    return Promise.reject(
      new Error("MONGODB_URI is not set. Add it to .env.local"),
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  return global._mongoClientPromise;
}
