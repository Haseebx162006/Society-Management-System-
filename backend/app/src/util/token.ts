import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateAccessToken = (id: string) => {
    return jwt.sign({ id }, process.env.PRIVATE_KEY as string, {
        algorithm: 'HS256',
        expiresIn: "15m"
    });
};

export const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};
