import { Request, Response, NextFunction } from 'express';
import { AppError } from '../util/AppError';
import { sendError } from '../util/response';
import logger from '../util/logger';
import * as Sentry from '@sentry/node';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // ✅ SECURITY FIX: Hide duplicate key error to prevent field enumeration
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const userMessage = field === 'email' 
            ? 'This email address is already registered'
            : 'This record already exists in our system';
        
        logger.warn('DUPLICATE_KEY_ERROR', {
            field,
            operation: 'CREATE_OR_UPDATE',
            timestamp: new Date().toISOString()
        });
        
        err = new AppError(userMessage, 400);
    }

    // ✅ SECURITY FIX: Don't expose all validation errors to attacker
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el: any) => el.message).slice(0, 5);
        const message = 'Please check your input and try again';
        
        logger.warn('VALIDATION_ERROR', {
            path: req.path,
            method: req.method,
            errorCount: Object.keys(err.errors).length,
            timestamp: new Date().toISOString()
        });
        
        err = new AppError(message, 400);
    }

    if (err.name === 'JsonWebTokenError') {
        err = new AppError('Invalid token. Please log in again!', 401);
        logger.warn('JWT_ERROR', { endpoint: req.path });
    }

    if (err.name === 'TokenExpiredError') {
        err = new AppError('Your token has expired! Please log in again.', 401);
    }

    // ✅ SECURITY FIX: Don't expose database field names in CastError
    if (err.name === 'CastError') {
        logger.warn('CAST_ERROR', {
            path: err.path,
            value: err.value,
            endpoint: req.path
        });
        err = new AppError('Invalid identifier format', 400);
    }

    if (err.isOperational) {
        sendError(res, err.statusCode, err.message);
    } else {
        // ✅ SECURITY FIX: Log full error to file only, don't expose to client
        logger.error('UNEXPECTED_ERROR', {
            name: err.name,
            message: err.message,
            stack: err.stack,
            endpoint: req.path,
            method: req.method,
            userId: (req as any).user?._id || 'anonymous',
            timestamp: new Date().toISOString()
        });
        
        Sentry.captureException(err, {
            tags: {
                endpoint: req.path,
                method: req.method
            }
        });
        
        sendError(res, 500, 'An unexpected error occurred. Our team has been notified.');
    }
};
