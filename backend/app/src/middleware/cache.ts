import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

export const cacheMiddleware = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      return next();
    }

    const userId = (req as any).user?._id || (req as any).user?.id || '';
    const key = `cache:${req.originalUrl}${userId ? `:${userId}` : ''}`;

    try {
      if (!redisClient.isReady) {
        return next();
      }

      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        res.status(200).json(JSON.parse(cachedData));
        return;
      }

      const originalSend = res.json.bind(res);
      res.json = (body: any): Response<any> => {
        if (redisClient.isReady) {
          redisClient.setEx(key, durationInSeconds, JSON.stringify(body));
        }
        return originalSend(body);
      };

      next();
    } catch (error) {
      next();
    }
  };
};
