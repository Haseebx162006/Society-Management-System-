import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateAccessToken = (id: string) => {
    return jwt.sign({ id }, process.env.PRIVATE_KEY as string, {
        expiresIn: "15m" // Short-lived access token
    });
};

export const generateRefreshToken = () => {
    // Generate a random string for refresh token
    return crypto.randomBytes(40).toString('hex');
};
