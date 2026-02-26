import { Request, Response, NextFunction } from 'express';
import { AppError } from '../util/AppError';
import { sendError } from '../util/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err.code === 11000) {
        const message = `Duplicate field value: ${Object.keys(err.keyValue).join(', ')}. Please use another value!`;
        err = new AppError(message, 400);
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el: any) => el.message);
        const message = `Invalid input data. ${errors.join('. ')}`;
        err = new AppError(message, 400);
    }

    if (err.name === 'JsonWebTokenError') {
        err = new AppError('Invalid token. Please log in again!', 401);
    }

    if (err.name === 'TokenExpiredError') {
        err = new AppError('Your token has expired! Please log in again.', 401);
    }

    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}.`;
        err = new AppError(message, 400);
    }

    if (err.isOperational) {
        sendError(res, err.statusCode, err.message);
    } else {
        console.error('ERROR', err);
        sendError(res, 500, 'Something went very wrong!');
    }
};
