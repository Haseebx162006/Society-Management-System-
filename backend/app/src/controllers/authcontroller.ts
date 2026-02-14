import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import { generateAccessToken, generateRefreshToken } from '../util/token';
import { sendResponse, sendError } from '../util/response';

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || typeof name !== "string") {
            return sendError(res, 400, "Invalid name");
        }

        if (!email || typeof email !== "string") {
            return sendError(res, 400, "Invalid email");
        }

        if (!password || typeof password !== "string") {
             return sendError(res, 400, "Invalid password");
        }
        
        // Strong password validation: 8 chars, uppercase, lowercase, number, special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
             return sendError(res, 400, "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
        }

        const userFind = await User.findOne({ email });

        if (userFind) {
            return sendError(res, 400, "User already exists with this email check another one");
        }

        const user = await User.create({ name: name, email: email, password: password, phone: req.body.phone || "" });

        return sendResponse(res, 201, "User is created", user);

    } catch (error: any) {
        return sendError(res, 500, "Error in signup", error);
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+$/;

        if (!email || typeof email !== "string") {
            return sendError(res, 400, "Invalid email");
        }
        if (!emailRegex.test(email)) {
             return sendError(res, 400, "Invalid email format");
        }

        if (!password || typeof password !== "string") {
             return sendError(res, 400, "Invalid password");
        }
        if (password.length < 6) {
             return sendError(res, 400, "Password must be at least 6 characters long");
        }

        const finduser = await User.findOne({ email });

        if (!finduser) {
             return sendError(res, 404, "User does not exist. Signup first and then login");
        }

        // Check for account lockout
        if (finduser.locked_until && finduser.locked_until > new Date()) {
             return sendError(res, 403, `Account is locked. Try again after ${finduser.locked_until.toLocaleTimeString()}`);
        }

        if (!await finduser.matchpassword(password)) {
             // Increment failed login attempts
             finduser.failed_login_attempts += 1;
             
             if (finduser.failed_login_attempts >= 5) {
                 finduser.locked_until = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
                 finduser.failed_login_attempts = 0; // Reset attempts after lock
             }
             await finduser.save();

             return sendError(res, 400, "Invalid password");
        }

        // Successful login, reset failed attempts and lock
        finduser.failed_login_attempts = 0;
        finduser.locked_until = null;
        await finduser.save();

        if (finduser.password_reset_required) {
             // For now, we can just send a warning or handle it on frontend to redirect.
             // But let's proceed with login and user can change password later.
             // Or we could return a specific code? simpler for now.
        }

        const accessToken = generateAccessToken(finduser._id.toString());
        const refreshTokenStr = generateRefreshToken();

        // Save refresh token to database
        const refreshTokenDoc = await RefreshToken.create({
            token: refreshTokenStr,
            user: finduser._id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        return sendResponse(res, 200, "User logged in successfully", {
            accessToken,
            refreshToken: refreshTokenStr,
            user: {
                id: finduser._id,
                name: finduser.name,
                email: finduser.email,
                is_super_admin: finduser.is_super_admin,
                password_reset_required: finduser.password_reset_required
            }
        });

    } catch (error: any) {
        return sendError(res, 500, "Error in login", error);
    }
}

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return sendError(res, 400, "Refresh Token is required");
        }

        const tokenDoc = await RefreshToken.findOne({ token: refreshToken }).populate('user');

        if (!tokenDoc || tokenDoc.revoked) {
            return sendError(res, 403, "Invalid or revoked refresh token");
        }

        if (new Date() > tokenDoc.expires_at) {
            return sendError(res, 403, "Refresh token expired");
        }

        if (!tokenDoc.user) {
            return sendError(res, 403, "User not found associated with this token");
        }

        // Generate new access token
        const accessToken = generateAccessToken((tokenDoc.user as any)._id.toString());

        const newRefreshTokenStr = generateRefreshToken();

        // Revoke old token
        tokenDoc.revoked = true;
        tokenDoc.replaced_by_token = newRefreshTokenStr;
        await tokenDoc.save();

        // Create new token
        await RefreshToken.create({
            token: newRefreshTokenStr,
            user: tokenDoc.user,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        return sendResponse(res, 200, "Token refreshed successfully", {
            accessToken,
            refreshToken: newRefreshTokenStr
        });

    } catch (error: any) {
        return sendError(res, 500, "Error in refresh token", error);
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
            if (tokenDoc) {
                tokenDoc.revoked = true;
                await tokenDoc.save();
            }
        }

        return sendResponse(res, 200, "User logged out successfully");

    } catch (error: any) {
        return sendError(res, 500, "Error in logout", error);
    }
}
