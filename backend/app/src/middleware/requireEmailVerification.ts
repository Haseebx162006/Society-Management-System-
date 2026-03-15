import { Response, NextFunction } from 'express';
import { AuthRequest } from './authmiddleware';
import { sendError } from '../util/response';

/**
 * Middleware to enforce email verification
 * Prevents unverified users from accessing sensitive endpoints
 * 
 * Routes that bypass: Public reads, password reset, OTP verification
 * Routes that require verification: Create events, modify data, admin actions
 */
export const requireEmailVerification = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Allow super admin to bypass email verification
    if (req.user && req.user.is_super_admin) {
        return next();
    }

    // Check if user email is verified
    if (req.user && !req.user.email_verified) {
        return sendError(
            res,
            403,
            'Email verification required. Please verify your email before performing this action.'
        );
    }

    return next();
};

/**
 * Routes that should bypass email verification:
 * - GET /events (public read)
 * - GET /societies (public read)
 * - POST /auth/login
 * - POST /auth/signup
 * - POST /auth/verify-otp
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 * - POST /auth/refresh
 * - GET /api/documentations (public)
 * 
 * Routes that require email verification:
 * - POST /api/events (create)
 * - PATCH /api/events/:id (modify)
 * - DELETE /api/events/:id
 * - POST /api/society (create)
 * - POST /api/user any PUT/PATCH (profile modification)
 * - POST /api/join (join request)
 * - POST /api/groups (create)
 * - Any admin endpoint
 */
