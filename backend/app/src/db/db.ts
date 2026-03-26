import mongoose from 'mongoose';

// Extend global type (TypeScript)
declare global {
  var _mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize global cache
if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}

const MONGO_URI = process.env.DB_URL as string;

if (!MONGO_URI) {
  throw new Error("❌ DB_URL is not defined in environment variables");
}

const options = {
  // ✅ Optimized for serverless (NOT overkill)
  maxPoolSize: 30,       // Enough for 100 users
  minPoolSize: 0,        // No idle connections (serverless friendly)

  // ✅ Timeouts (balanced)
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,

  // ✅ Reliability
  retryWrites: true,
  retryReads: true,

  // ✅ Performance
  autoIndex: false,      // IMPORTANT: create indexes manually
};

/**
 * 🚀 Optimized MongoDB connection for Vercel (serverless)
 */
const db = async (): Promise<typeof mongoose> => {
  // ✅ Reuse existing connection
  if (global._mongoose.conn) {
    return global._mongoose.conn;
  }

  // ✅ If connection is in progress, wait for it
  if (!global._mongoose.promise) {
    console.log("⏳ Creating new MongoDB connection...");

    global._mongoose.promise = mongoose.connect(MONGO_URI, options);
  }

  try {
    global._mongoose.conn = await global._mongoose.promise;

    console.log("✅ MongoDB connected");

    // Optional: Logging events (only once)
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      global._mongoose.conn = null;
      global._mongoose.promise = null;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
      global._mongoose.conn = null;
      global._mongoose.promise = null;
    });

    return global._mongoose.conn;
  } catch (error: any) {
    console.error("❌ DB connection failed:", error.message);
    global._mongoose.promise = null;
    throw error;
  }
};

export default db;