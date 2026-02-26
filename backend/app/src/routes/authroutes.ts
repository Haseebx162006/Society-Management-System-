import express from 'express';
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

// Auth
router.post('/login', login);
router.post('/signup', signup);
router.post('/refresh', refresh);
router.post('/logout', logout);

// OTP Verification (Signup)
router.post('/verify-otp', verifySignupOTP);
router.post('/resend-otp', resendSignupOTP);

// Forgot Password
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

export default router;
