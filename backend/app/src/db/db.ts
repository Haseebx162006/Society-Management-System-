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
        });
        isConnected = true;
        console.log("Database connected");
    } catch (error: any) {
        console.error("Database connection failed: ", error.message);
        console.error("Please whitelist 0.0.0.0/0 in MongoDB Atlas Network Access.");
    }
}

export default db;
