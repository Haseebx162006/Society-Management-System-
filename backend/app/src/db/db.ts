import mongoose from 'mongoose';

const db = async (): Promise<void> => {
    try {
        if (!process.env.DB_URL) {
            console.error("DB_URL is not defined in environment variables");
            return;
        }
        await mongoose.connect(process.env.DB_URL);
        console.log("Database connected");
    } catch (error: any) {
        console.error("Database connection failed: ", error.message);
        console.error("Server will continue running but database operations will fail.");
        console.error("Please whitelist your IP in MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/");
    }
}

export default db;
