import { Request, Response, NextFunction } from 'express';
import logger from '../util/logger';
import { AuthRequest } from './authmiddleware';

/**
 * Middleware to log critical security and business events
 * Tracks authentication, data modifications, admin actions
 */

/**
 * Log authentication events
 */
export const logAuthEvent = (
    eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'SIGNUP' | 'PASSWORD_RESET' | 'LOGOUT',
    userId: string | null,
    email: string,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>
) => {
    logger.info('AUTH_EVENT', {
        eventType,
        userId,
        email,
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString(),
        ...details,
    });
};

/**
 * Log data modification events
 */
export const logDataModification = (
    operationType: 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: string, // 'EVENT', 'SOCIETY', 'USER', etc.
    entityId: string,
    userId: string,
    changes?: Record<string, any>
) => {
    logger.info('DATA_MODIFICATION', {
        operationType,
        entityType,
        entityId,
        userId,
        changes,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Log admin actions
 */
export const logAdminAction = (
    action: string,
    adminId: string,
    targetId: string | null,
    details?: Record<string, any>
) => {
    logger.warn('ADMIN_ACTION', {
        action,
        adminId,
        targetId,
        details,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Log security events
 */
export const logSecurityEvent = (
    eventType: string, // 'RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_ACTIVITY', etc.
    userId: string | null,
    ipAddress: string,
    details?: Record<string, any>
) => {
    logger.warn('SECURITY_EVENT', {
        eventType,
        userId,
        ipAddress,
        details,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Log error events with context
 */
export const logErrorEvent = (
    errorType: string,
    message: string,
    userId: string | null,
    endpoint: string,
    statusCode: number,
    error: Error | any
) => {
    logger.error('ERROR_EVENT', {
        errorType,
        message,
        userId,
        endpoint,
        statusCode,
        errorStack: error instanceof Error ? error.stack : String(error),
        timestamp: new Date().toISOString(),
    });
};

/**
 * Middleware to attach request metadata for easier logging
 */
export const attachRequestMetadata = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Generate unique request ID if not present
    if (!req.id) {
        req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Attach IP address
    req.ipAddress = req.ip || req.connection.remoteAddress || 'UNKNOWN';

    // Attach user agent
    req.userAgent = req.get('user-agent') || 'UNKNOWN';

    // Log request details at the end of request
    res.on('finish', () => {
        const statusCode = res.statusCode;
        const isError = statusCode >= 400;

        if (isError) {
            logger.warn('HTTP_REQUEST', {
                id: req.id,
                method: req.method,
                url: req.originalUrl,
                statusCode,
                userId: req.user?._id || null,
                ipAddress: req.ipAddress,
                responseTime: res.get('X-Response-Time'),
            });
        }
    });

    next();
};

/**
 * Get IP address from request
 */
export const getClientIp = (req: Request): string => {
    return (
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.ip ||
        req.connection.remoteAddress ||
        'UNKNOWN'
    );
};

/**
 * Express Request with logging metadata
 */
declare global {
    namespace Express {
        interface Request {
            id?: string;
            ipAddress?: string;
            userAgent?: string;
        }
    }
}
