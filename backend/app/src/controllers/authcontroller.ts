import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User';
import OTP from '../models/OTP';
import RefreshToken from '../models/RefreshToken';
import { generateAccessToken, generateRefreshToken } from '../util/token';
import { sendResponse, sendError } from '../util/response';
import { sendEmail } from '../services/emailService';
import { emailTemplates } from '../utils/emailTemplates';

const MAX_OTP_ATTEMPTS = 5;

const generateOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

const hashOTP = async (otp: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const userFind = await User.findOne({ email });
        if (userFind && userFind.email_verified) {
            return sendError(res, 400, "User already exists with this email");
        }

        if (userFind && !userFind.email_verified) {
            await User.deleteOne({ _id: userFind._id });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone: req.body.phone || "",
            email_verified: false,
        });

        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        await OTP.deleteMany({ email, type: 'SIGNUP' });
        await OTP.create({
            email,
            otp: hashedOtp,
            type: 'SIGNUP',
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
        });

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
        return next(error);
    }
};

export const verifySignupOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({
            email,
            type: 'SIGNUP',
            verified: false,
        }).sort({ created_at: -1 });

        if (!otpRecord) {
            return sendError(res, 400, "No OTP found. Please request a new one.");
        }

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            await OTP.deleteMany({ email, type: 'SIGNUP' });
            return sendError(res, 429, "Too many failed attempts. Please request a new OTP.");
        }

        if (new Date() > otpRecord.expires_at) {
            return sendError(res, 400, "OTP has expired. Please request a new one.");
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return sendError(res, 400, "Invalid OTP");
        }

        otpRecord.verified = true;
        await otpRecord.save();

        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 404, "User not found");
        }

        user.email_verified = true;
        await user.save();

        const accessToken = generateAccessToken(user._id.toString());
        const refreshTokenStr = generateRefreshToken();

        await RefreshToken.create({
            token: refreshTokenStr,
            user: user._id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

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
        return next(error);
    }
};

export const resendSignupOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 404, "User not found. Please sign up first.");
        }

        if (user.email_verified) {
            return sendError(res, 400, "Email is already verified. Please login.");
        }

        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        await OTP.deleteMany({ email, type: 'SIGNUP' });
        await OTP.create({
            email,
            otp: hashedOtp,
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
        return next(error);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return sendResponse(res, 200, "If this email is registered, you will receive a password reset OTP.");
        }

        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        await OTP.deleteMany({ email, type: 'PASSWORD_RESET' });
        await OTP.create({
            email,
            otp: hashedOtp,
            type: 'PASSWORD_RESET',
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
        });

        await sendEmail(
            email,
            'Password Reset — Society Management System',
            emailTemplates.passwordResetOTP(user.name, otp)
        );

        return sendResponse(res, 200, "If this email is registered, you will receive a password reset OTP.");

    } catch (error: any) {
        return next(error);
    }
};

export const verifyResetOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({
            email,
            type: 'PASSWORD_RESET',
            verified: false,
        }).sort({ created_at: -1 });

        if (!otpRecord) {
            return sendError(res, 400, "No OTP found. Please request a new one.");
        }

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            await OTP.deleteMany({ email, type: 'PASSWORD_RESET' });
            return sendError(res, 429, "Too many failed attempts. Please request a new OTP.");
        }

        if (new Date() > otpRecord.expires_at) {
            return sendError(res, 400, "OTP has expired. Please request a new one.");
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return sendError(res, 400, "Invalid OTP");
        }

        otpRecord.verified = true;
        await otpRecord.save();

        return sendResponse(res, 200, "OTP verified. You can now reset your password.", {
            email,
            otpVerified: true,
        });

    } catch (error: any) {
        return next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, newPassword } = req.body;

        const otpRecord = await OTP.findOne({
            email,
            type: 'PASSWORD_RESET',
            verified: true,
        });

        if (!otpRecord) {
            return sendError(res, 400, "Invalid or unverified OTP. Please verify your OTP first.");
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return sendError(res, 400, "Invalid OTP.");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 404, "User not found");
        }

        user.password = newPassword;
        user.password_reset_required = false;
        user.password_changed_at = new Date();
        await user.save();

        await OTP.deleteMany({ email, type: 'PASSWORD_RESET' });

        await RefreshToken.updateMany(
            { user: user._id, revoked: false },
            { $set: { revoked: true } }
        );

        return sendResponse(res, 200, "Password reset successfully. Please login with your new password.");

    } catch (error: any) {
        return next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const finduser = await User.findOne({ email });

        if (!finduser) {
            return sendError(res, 401, "Invalid email or password");
        }

        if (!finduser.email_verified && !finduser.is_super_admin) {
            return sendError(res, 403, "Email not verified. Please verify your email first.");
        }

        if (finduser.locked_until && finduser.locked_until > new Date()) {
            return sendError(res, 403, "Account is temporarily locked. Please try again later.");
        }

        if (!await finduser.matchpassword(password)) {
            finduser.failed_login_attempts += 1;

            if (finduser.failed_login_attempts >= 5) {
                finduser.locked_until = new Date(Date.now() + 15 * 60 * 1000);
                finduser.failed_login_attempts = 0;
            }
            await finduser.save();

            return sendError(res, 401, "Invalid email or password");
        }

        finduser.failed_login_attempts = 0;
        finduser.locked_until = null;
        await finduser.save();

        const accessToken = generateAccessToken(finduser._id.toString());
        const refreshTokenStr = generateRefreshToken();

        await RefreshToken.create({
            token: refreshTokenStr,
            user: finduser._id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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
        return next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
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

        const accessToken = generateAccessToken(user._id.toString());

        const newRefreshTokenStr = generateRefreshToken();

        tokenDoc.revoked = true;
        tokenDoc.replaced_by_token = newRefreshTokenStr;
        await tokenDoc.save();

        await RefreshToken.create({
            token: newRefreshTokenStr,
            user: tokenDoc.user,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return sendResponse(res, 200, "Token refreshed successfully", {
            accessToken,
            refreshToken: newRefreshTokenStr,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                password_reset_required: user.password_reset_required,
                status: user.status,
                locked_until: user.locked_until
            }
        });

    } catch (error: any) {
        return next(error);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
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
        return next(error);
    }
};
