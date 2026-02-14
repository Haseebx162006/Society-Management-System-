import mongoose from 'mongoose';

const db = async (): Promise<void> => {
    try {
        if (!process.env.DB_URL) {
            throw new Error("DB_URL is not defined in environment variables");
        }
        await mongoose.connect(process.env.DB_URL);
        console.log("Database connected");
    } catch (error: any) {
        console.log("Database connection failed: ", error.message);
        process.exit(1);
    }
}

export default db;
