import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    signup,
    verifySignupOTP,
    resendSignupOTP,
    login,
    refresh,
    logout,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} from '../controllers/authcontroller';
import { protect, adminOnly } from '../middleware/authmiddleware';

const router = express.Router();

const otpLimiter = rateLimit({
    max: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many OTP attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const resendLimiter = rateLimit({
    max: 3,
    windowMs: 15 * 60 * 1000,
    message: 'Too many resend requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const signupLimiter = rateLimit({
    max: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many signup attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', login);
router.post('/signup', signupLimiter, signup);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.post('/verify-otp', otpLimiter, verifySignupOTP);
router.post('/resend-otp', resendLimiter, resendSignupOTP);

router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-reset-otp', otpLimiter, verifyResetOTP);
router.post('/reset-password', otpLimiter, resetPassword);

export default router;
