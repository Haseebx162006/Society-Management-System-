import morgan, { Morgan } from 'morgan';
import logger from '../util/logger';

/**
 * Create a stream object for Morgan to write logs via Winston
 */
const stream = {
    write: (message: string) => {
        // Remove trailing newline from Morgan's message
        logger.info(message.trim());
    },
};

/**
 * Skip logging for health check endpoints
 */
const skip = (req: any) => {
    // Skip logging for health checks and internal requests
    const skippedEndpoints = [
        '/health',
        '/ping',
        '/debug-sentry',
    ];
    return skippedEndpoints.some(endpoint => req.originalUrl.includes(endpoint));
};

/**
 * Custom Morgan token for request ID (useful for debugging)
 */
morgan.token('request-id', (req: any) => {
    return req.id || 'N/A';
});

/**
 * Custom format combining useful information
 */
const customFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

/**
 * Create Morgan middleware with Winston integration
 */
export const morganMiddleware = morgan(customFormat, {
    stream,
    skip,
});

/**
 * Production logging (combined format logged to file via Winston)
 */
export const morganProduction = morgan('combined', {
    stream,
    skip,
});

/**
 * Development logging (short format)
 */
export const morganDevelopment = morgan('dev', {
    skip,
});
