import { Request, Response, NextFunction } from 'express';
import { AppError } from '../util/AppError';
import { sendError } from '../util/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate field value: ${Object.keys(err.keyValue).join(', ')}. Please use another value!`;
        err = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el: any) => el.message);
        const message = `Invalid input data. ${errors.join('. ')}`;
        err = new AppError(message, 400);
    }

    // JWT invalid error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again!';
        err = new AppError(message, 401);
    }

    // JWT expired error
    if (err.name === 'TokenExpiredError') {
        const message = 'Your token has expired! Please log in again.';
        err = new AppError(message, 401);
    }

    // CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}.`;
        err = new AppError(message, 400);
    }

    // Development vs Production error response
    if (process.env.NODE_ENV === 'development') {
        sendError(res, err.statusCode, err.message, err);
    } else {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            sendError(res, err.statusCode, err.message);
        } else {
            // Programming or other unknown error: don't leak details
            console.error('ERROR', err);
            sendError(res, 500, 'Something went very wrong!');
        }
    }
};
