import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User';
import OTP from '../models/OTP';
import RefreshToken from '../models/RefreshToken';
import { generateAccessToken, generateRefreshToken } from '../util/token';
import { sendResponse, sendError } from '../util/response';
import { sendEmail } from '../services/emailService';
import { emailTemplates } from '../utils/emailTemplates';

// ─── Helper: Generate 6-digit OTP ─────────────────────────────────────────────
const generateOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

// ─── Step 1: Signup — send OTP to email ────────────────────────────────────────
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

        // Strong password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return sendError(res, 400, "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
        }

        const userFind = await User.findOne({ email });
        if (userFind && userFind.email_verified) {
            return sendError(res, 400, "User already exists with this email");
        }

        // If user exists but not verified, delete the old record so they can re-register
        if (userFind && !userFind.email_verified) {
            await User.deleteOne({ _id: userFind._id });
        }

        // Create user with email_verified = false
        const user = await User.create({
            name,
            email,
            password,
            phone: req.body.phone || "",
            email_verified: false,
        });

        // Generate OTP and save
        const otp = generateOTP();
        await OTP.deleteMany({ email, type: 'SIGNUP' }); // Remove old OTPs
        await OTP.create({
            email,
            otp,
            type: 'SIGNUP',
            expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        // Send OTP email
        await sendEmail(
            email,
            'Verify Your Email — Society Management System',
            emailTemplates.otpVerification(name, otp)
        );

        return sendResponse(res, 201, "OTP sent to your email. Please verify to complete signup.", {
            email: user.email,
            requiresVerification: true,
        });

    } catch (error: any) {
        return sendError(res, 500, "Error in signup", error);
    }
};

// ─── Step 2: Verify OTP and complete signup ────────────────────────────────────
export const verifySignupOTP = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return sendError(res, 400, "Email and OTP are required");
        }

        // Find the latest OTP for this email
        const otpRecord = await OTP.findOne({
            email,
            type: 'SIGNUP',
            verified: false,
        }).sort({ created_at: -1 });

        if (!otpRecord) {
            return sendError(res, 400, "No OTP found. Please request a new one.");
        }

        if (new Date() > otpRecord.expires_at) {
            return sendError(res, 400, "OTP has expired. Please request a new one.");
        }

        if (otpRecord.otp !== otp) {
            return sendError(res, 400, "Invalid OTP");
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Mark user as verified
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 404, "User not found");
        }

        user.email_verified = true;
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id.toString());
        const refreshTokenStr = generateRefreshToken();

        await RefreshToken.create({
            token: refreshTokenStr,
            user: user._id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // Clean up OTPs
        await OTP.deleteMany({ email, type: 'SIGNUP' });

        return sendResponse(res, 200, "Email verified successfully. Signup complete!", {
            accessToken,
            refreshToken: refreshTokenStr,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                is_super_admin: user.is_super_admin,
                password_reset_required: user.password_reset_required,
                status: user.status,
                locked_until: user.locked_until,
            },
        });

    } catch (error: any) {
        return sendError(res, 500, "Error verifying OTP", error);
    }
};

// ─── Resend Signup OTP ─────────────────────────────────────────────────────────
export const resendSignupOTP = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendError(res, 400, "Email is required");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 404, "User not found. Please sign up first.");
        }

        if (user.email_verified) {
            return sendError(res, 400, "Email is already verified. Please login.");
        }

        // Generate new OTP
        const otp = generateOTP();
        await OTP.deleteMany({ email, type: 'SIGNUP' });
        await OTP.create({
            email,
            otp,
            type: 'SIGNUP',
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
        });

        await sendEmail(
            email,
            'Verify Your Email — Society Management System',
            emailTemplates.otpVerification(user.name, otp)
        );

        return sendResponse(res, 200, "OTP resent successfully");

    } catch (error: any) {
        return sendError(res, 500, "Error resending OTP", error);
    }
};

// ─── Forgot Password — send OTP ───────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== "string") {
            return sendError(res, 400, "Email is required");
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal whether user exists
            return sendResponse(res, 200, "If this email is registered, you will receive a password reset OTP.");
        }

        // Generate OTP
        const otp = generateOTP();
        await OTP.deleteMany({ email, type: 'PASSWORD_RESET' });
        await OTP.create({
            email,
            otp,
            type: 'PASSWORD_RESET',
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
        });

        // Send OTP email
        await sendEmail(
            email,
            'Password Reset — Society Management System',
            emailTemplates.passwordResetOTP(user.name, otp)
        );

        return sendResponse(res, 200, "If this email is registered, you will receive a password reset OTP.");

    } catch (error: any) {
        return sendError(res, 500, "Error in forgot password", error);
    }
};

// ─── Verify Password Reset OTP ────────────────────────────────────────────────
export const verifyResetOTP = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return sendError(res, 400, "Email and OTP are required");
        }

        const otpRecord = await OTP.findOne({
            email,
            type: 'PASSWORD_RESET',
            verified: false,
        }).sort({ created_at: -1 });

        if (!otpRecord) {
            return sendError(res, 400, "No OTP found. Please request a new one.");
        }

        if (new Date() > otpRecord.expires_at) {
            return sendError(res, 400, "OTP has expired. Please request a new one.");
        }

        if (otpRecord.otp !== otp) {
            return sendError(res, 400, "Invalid OTP");
        }

        // Mark as verified — user can now reset password
        otpRecord.verified = true;
        await otpRecord.save();

        return sendResponse(res, 200, "OTP verified. You can now reset your password.", {
            email,
            otpVerified: true,
        });

    } catch (error: any) {
        return sendError(res, 500, "Error verifying reset OTP", error);
    }
};

// ─── Reset Password (after OTP is verified) ───────────────────────────────────
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return sendError(res, 400, "Email, OTP, and new password are required");
        }

        // Strong password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return sendError(res, 400, "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
        }

        // Check that OTP was verified
        const otpRecord = await OTP.findOne({
            email,
            type: 'PASSWORD_RESET',
            otp,
            verified: true,
        });

        if (!otpRecord) {
            return sendError(res, 400, "Invalid or unverified OTP. Please verify your OTP first.");
        }

        // Find user and update password
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 404, "User not found");
        }

        user.password = newPassword;
        user.password_reset_required = false;
        user.password_changed_at = new Date();
        await user.save();

        // Clean up OTPs
        await OTP.deleteMany({ email, type: 'PASSWORD_RESET' });

        // Revoke all existing refresh tokens for security
        await RefreshToken.updateMany(
            { user: user._id, revoked: false },
            { $set: { revoked: true } }
        );

        return sendResponse(res, 200, "Password reset successfully. Please login with your new password.");

    } catch (error: any) {
        return sendError(res, 500, "Error resetting password", error);
    }
};

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

        // Check if email is verified (skip for super admins)
        if (!finduser.email_verified && !finduser.is_super_admin) {
             return sendError(res, 403, "Email not verified. Please verify your email first.");
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
                phone: finduser.phone,
                is_super_admin: finduser.is_super_admin,
                password_reset_required: finduser.password_reset_required,
                status: finduser.status,
                locked_until: finduser.locked_until
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

        const user = tokenDoc.user as any;

        // Generate new access token
        const accessToken = generateAccessToken(user._id.toString());

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
            refreshToken: newRefreshTokenStr,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                is_super_admin: user.is_super_admin,
                password_reset_required: user.password_reset_required,
                status: user.status,
                locked_until: user.locked_until
            }
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
