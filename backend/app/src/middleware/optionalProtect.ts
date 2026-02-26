import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from './authmiddleware';

export const optionalProtect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.PRIVATE_KEY as string,
            { algorithms: ['HS256'] }
        ) as JwtPayload;

        req.user = await User.findById(decoded.id).select('-password');
        return next();
    } catch {
        req.user = null;
        return next();
    }
};
