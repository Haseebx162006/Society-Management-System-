import redisClient from '../config/redis';
import logger from '../util/logger';

export const invalidateCache = async (pattern: string) => {
  try {
    if (!redisClient.isReady) return;

    for await (const key of redisClient.scanIterator({
      MATCH: `*${pattern}*`,
      COUNT: 100
    })) {
      await redisClient.del(key);
    }
  } catch (error) {
    logger.error(`Error invalidating cache for pattern: ${pattern}`, error);
  }
};
