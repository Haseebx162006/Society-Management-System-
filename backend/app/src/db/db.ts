import mongoose from 'mongoose';

let isConnected = false;

const db = async (): Promise<void> => {
    // Reuse existing connection on warm Vercel invocations
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }

    try {
        if (!process.env.DB_URL) {
            console.error("DB_URL is not defined in environment variables");
            return;
        }
        await mongoose.connect(process.env.DB_URL, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 20000,
            // ✅ CRITICAL: Connection pool tuned for 1500+ concurrent users
            // Calculation: With N+1 queries fixed, avg 2-3 queries per request
            // 1500 users × 3 queries × 50ms = 225 concurrent connections needed
            // Using 150 max to handle bursts safely
            maxPoolSize: 150,        // Increased from 50 for 1500+ users
            minPoolSize: 30,         // Increased from 20 to maintain connections
            maxIdleTimeMS: 45000,    // Close idle connections after 45s
            // Retry configuration
            retryWrites: true,
            retryReads: true,
            // Performance tuning
            waitQueueTimeoutMS: 10000,
        });
        isConnected = true;
        console.log("Database connected with optimized connection pool");
    } catch (error: any) {
        console.error("Database connection failed: ", error.message);
        console.error("Please whitelist 0.0.0.0/0 in MongoDB Atlas Network Access.");
    }
}

export default db;
