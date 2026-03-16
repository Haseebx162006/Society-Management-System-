import { ZodTypeAny, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../util/response';

export const validateRequest = (schema: ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.issues.map(err => {
                    const field = err.path.slice(1).join('.'); // strip leading 'body'/'query'/'params'
                    return field ? `${field}: ${err.message}` : err.message;
                }).join(', ');
                return sendError(res, 400, `Validation failed: ${errorMessage}`);
            }
            next(error);
        }
    };
};
