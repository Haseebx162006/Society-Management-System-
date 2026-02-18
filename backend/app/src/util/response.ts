import { Response } from 'express';

export const sendResponse = (res: Response, statusCode: number, message: string, data?: any) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

export const sendError = (res: Response, statusCode: number, message: string, error?: any) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
    });
};
