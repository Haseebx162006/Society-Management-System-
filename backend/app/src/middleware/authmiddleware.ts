import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser | null;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;
    try {
        const token_header = req.headers.authorization;
        if (!token_header || !token_header.startsWith("Bearer ")) {
            return res.status(401).json({
                msg: "Error in header of the token"
            });
        }
        token = token_header.split(" ")[1];
        if (!process.env.PRIVATE_KEY) {
             throw new Error("PRIVATE_KEY is not defined");
        }
        const decode = jwt.verify(token, process.env.PRIVATE_KEY) as JwtPayload;
        
        req.user = await User.findById(decode.id).select("-password");
        return next();
    } catch (error: any) {
        console.log("Error in verifying token: ", error.message);
        return res.status(401).json({
            msg: "Error in verifiying the token",
            error: error.message
        });
    }
}

export const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user && req.user.role === "SuperAdmin") { // Assuming "SuperAdmin" based on User model enums, original code said "admin" but enum has "SuperAdmin"
             return next();
        }
        // Original code checked for "admin", but User model has "SuperAdmin".
        // Use "SuperAdmin" as it aligns with the updated User model.
        // Wait, original code said: req.user.role === "admin"
        // User model enum: ["SuperAdmin","President","Lead","Co-Lead","Member"]
        // I should probably check for "SuperAdmin" or stick to what was there if they have some other logic.
        // But since I saw User model, "admin" is not there.
        // I will change it to "SuperAdmin" to match the model, but add a comment.
        else {
            return res.status(403).json({
                msg: "You cant access admin roles"
            });
        }
    } catch (error) {
        return res.status(403).json({
            msg: "You cant access admin roles"
        });
    }
}
