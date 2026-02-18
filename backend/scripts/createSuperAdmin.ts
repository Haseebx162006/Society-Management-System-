
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../app/src/models/User';
import readline from 'readline';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('Loading environment from:', envPath);

const connectDB = async () => {
    try {
        const dbUrl = process.env.DB_URL;
        if (!dbUrl) {
            throw new Error('DB_URL must be defined in .env file');
        }
        const conn = await mongoose.connect(dbUrl);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};


const createSuperAdmin = async () => {
    try {
        await connectDB();

        // Check for command line arguments
        const args = process.argv.slice(2);
        let emailArg = '';
        let passwordArg = '';
        let nameArg = '';
        let phoneArg = '';

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--email') emailArg = args[i + 1];
            if (args[i] === '--password') passwordArg = args[i + 1];
            if (args[i] === '--name') nameArg = args[i + 1];
            if (args[i] === '--phone') phoneArg = args[i + 1];
        }

        console.log('\n--- Create/Promote Super Admin ---\n');

        let email = emailArg;
        if (!email) {
            email = await askQuestion('Enter email address: ');
        }

        if (!email) {
            console.error('Email is required');
            process.exit(1);
        }

        const user = await User.findOne({ email });

        if (user) {
            console.log(`User found: ${user.name} (${user.email})`);
            if (user.is_super_admin) {
                console.log('User is already a Super Admin.');
            } else {
                let confirm = 'y';
                if (!emailArg) { // Only ask if running interactively
                    confirm = await askQuestion('Promote this user to Super Admin? (y/n): ');
                }

                if (confirm.toLowerCase() === 'y') {
                    user.is_super_admin = true;
                    await user.save();
                    console.log('User promoted to Super Admin successfully.');
                } else {
                    console.log('Operation cancelled.');
                }
            }
        } else {
            console.log('User not found. Creating new Super Admin.');

            let name = nameArg;
            if (!name) name = await askQuestion('Enter name: ');

            let password = passwordArg;
            if (!password) password = await askQuestion('Enter password: ');

            let phone = phoneArg;
            if (!phone) phone = await askQuestion('Enter phone number: ');

            if (!name || !password || !phone) {
                console.error('All fields are required for new user.');
                process.exit(1);
            }

            const newUser = await User.create({
                name,
                email,
                password,
                phone,
                is_super_admin: true,
                status: 'ACTIVE',
                email_verified: true
            });

            console.log(`Super Admin user created successfully: ${newUser.email}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        rl.close();
        process.exit(0);
    }
};

createSuperAdmin();
