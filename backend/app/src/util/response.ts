import { Response } from 'express';

export const sendResponse = (res: Response, statusCode: number, message: string, data?: any) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

export const sendError = (res: Response, statusCode: number, message: string, _error?: any) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};
