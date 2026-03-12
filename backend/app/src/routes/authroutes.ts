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
    resetPassword,
} from '../controllers/authcontroller';
import { protect, adminOnly } from '../middleware/authmiddleware';
import { validateRequest } from '../middleware/validate';
import { 
    signupSchema, 
    loginSchema, 
    verifyOTPSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema 
} from '../validators/authValidator';

const router = express.Router();

const otpLimiter = rateLimit({
    max: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many OTP attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: true }
});

const resendLimiter = rateLimit({
    max: 3,
    windowMs: 15 * 60 * 1000,
    message: 'Too many resend requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: true }
});

const signupLimiter = rateLimit({
    max: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many signup attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: true }
});

router.post('/login', validateRequest(loginSchema), login);
router.post('/signup', signupLimiter, validateRequest(signupSchema), signup);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.post('/verify-otp', otpLimiter, validateRequest(verifyOTPSchema), verifySignupOTP);
router.post('/resend-otp', resendLimiter, resendSignupOTP);

router.post('/forgot-password', otpLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-otp', otpLimiter, validateRequest(verifyOTPSchema), verifyResetOTP);
router.post('/reset-password', otpLimiter, validateRequest(resetPasswordSchema), resetPassword);

export default router;
