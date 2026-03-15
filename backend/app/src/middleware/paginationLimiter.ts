import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to enforce pagination limits
 * Prevents resource exhaustion from unlimited result sets
 * 
 * Usage: app.use(paginationLimiter);
 */
export const paginationLimiter = (req: Request, res: Response, next: NextFunction) => {
    // Default pagination values
    const DEFAULT_PAGE = 1;
    const DEFAULT_LIMIT = 12;
    const MIN_LIMIT = 1;
    const MAX_LIMIT = 100;

    try {
        // Get pagination parameters from query
        const { page, limit } = req.query;

        // Parse and validate page
        let pageNum = DEFAULT_PAGE;
        if (page) {
            pageNum = parseInt(page as string, 10);
            if (isNaN(pageNum) || pageNum < 1) {
                pageNum = DEFAULT_PAGE;
            }
        }

        // Parse and validate limit
        let limitNum = DEFAULT_LIMIT;
        if (limit) {
            limitNum = parseInt(limit as string, 10);
            if (isNaN(limitNum) || limitNum < MIN_LIMIT) {
                limitNum = DEFAULT_LIMIT;
            }
            if (limitNum > MAX_LIMIT) {
                limitNum = MAX_LIMIT;
            }
        }

        // Attach validated values to request object
        (req as any).pagination = {
            page: pageNum,
            limit: limitNum,
            skip: (pageNum - 1) * limitNum,
        };

        next();
    } catch (error) {
        // On error, set defaults
        (req as any).pagination = {
            page: DEFAULT_PAGE,
            limit: DEFAULT_LIMIT,
            skip: 0,
        };
        next();
    }
};

/**
 * Type-safe pagination interface for Express Request
 */
export interface PaginatedRequest extends Request {
    pagination: {
        page: number;
        limit: number;
        skip: number;
    };
}
