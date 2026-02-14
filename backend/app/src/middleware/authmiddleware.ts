import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { sendError } from '../util/response';

export interface AuthRequest extends Request {
    user?: IUser | null;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return sendError(res, 401, "Not authorized, no token");
    }

    try {
        if (!process.env.PRIVATE_KEY) {
             throw new Error("PRIVATE_KEY is not defined");
        }
        
        const decode = jwt.verify(token, process.env.PRIVATE_KEY) as JwtPayload;
        
        req.user = await User.findById(decode.id).select("-password");
        
        if (!req.user) {
            return sendError(res, 401, "User not found");
        }

        return next();

    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return sendError(res, 401, "Token expired");
        }
        return sendError(res, 401, "Not authorized, token failed", error);
    }
}

export const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.is_super_admin) {
         return next();
    } else {
        return sendError(res, 403, "Not authorized as admin");
    }
}
