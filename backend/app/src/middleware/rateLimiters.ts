import rateLimit from 'express-rate-limit';

/**
 * ✅ CRITICAL RATE LIMITERS FOR PRODUCTION
 * Prevents DoS attacks and resource exhaustion
 */

// ============= MEMBER OPERATIONS LIMITER =============
// Prevents mass adding/removing of members
export const memberOperationsLimiter = rateLimit({
    max: 100,                           // 100 operations
    windowMs: 60 * 60 * 1000,          // Per hour
    message: 'Too many member operations. Please try again later.',
    statusCode: 429,
    keyGenerator: (req: any) => {
        // Limit per society and user combo
        return `${req.user?._id}:${req.params.id}`;
    },
    skip: (req: any) => !req.user       // Skip if not authenticated
});

// ============= EVENT REGISTRATION LIMITER =============
// Prevents spam event registrations
export const eventRegistrationLimiter = rateLimit({
    max: 200,                           // 200 registrations
    windowMs: 60 * 60 * 1000,          // Per hour
    message: 'Too many event registrations. Please try again later.',
    statusCode: 429,
    keyGenerator: (req: any) => `${req.user?._id}:events`,
    skip: (req: any) => !req.user
});

// ============= JOIN REQUEST LIMITER =============
// Prevents spam join requests
export const joinRequestLimiter = rateLimit({
    max: 50,                            // 50 join requests
    windowMs: 24 * 60 * 60 * 1000,      // Per day
    message: 'You have too many pending join requests. Please wait before submitting more.',
    statusCode: 429,
    keyGenerator: (req: any) => `${req.user?._id}:joins`,
    skip: (req: any) => !req.user
});

// ============= ADMIN ACTION LIMITER =============
// Prevents admin abuse
export const adminActionLimiter = rateLimit({
    max: 500,                           // 500 admin actions
    windowMs: 60 * 60 * 1000,          // Per hour
    message: 'Admin action limit exceeded.',
    statusCode: 429,
    keyGenerator: (req: any) => `${req.user?._id}:admin`,
    skip: (req: any) => !req.user || req.user?.role !== 'ADMIN'
});

// ============= EXPORT LIMITER =============
// Prevents resource exhaustion from exports
export const exportLimiter = rateLimit({
    max: 10,                            // 10 exports
    windowMs: 60 * 60 * 1000,          // Per hour
    message: 'Export limit exceeded. Try again in 1 hour.',
    statusCode: 429,
    keyGenerator: (req: any) => `${req.user?._id}:export`,
    skip: (req: any) => !req.user
});

// ============= SOCIETY CREATION LIMITER =============
// Prevents spam society creation
export const societyCreationLimiter = rateLimit({
    max: 5,                             // 5 society creations
    windowMs: 30 * 24 * 60 * 60 * 1000, // Per 30 days
    message: 'You have reached the limit for creating new societies.',
    statusCode: 429,
    keyGenerator: (req: any) => `${req.user?._id}:society_create`,
    skip: (req: any) => !req.user
});

export default {};
