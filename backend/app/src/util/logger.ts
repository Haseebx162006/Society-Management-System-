import winston from 'winston';
import path from 'path';
import fs from 'fs';

/**
 * Winston Logger Configuration
 * Handles structured logging for production monitoring
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for better readability
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Error log format
const errorFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        return JSON.stringify({
            timestamp,
            level,
            message,
            stack,
            meta: Object.keys(meta).length ? meta : undefined,
        });
    })
);

// Info log format (cleaner for info logs)
const infoFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    })
);

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: [
        // Error logs - File transport
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: errorFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        }),

        // Combined logs - File transport
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: customFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        }),

        // Auth logs - File transport (critical for security)
        new winston.transports.File({
            filename: path.join(logsDir, 'auth.log'),
            level: 'info',
            format: infoFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        }),
    ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    );
}

// Log uncaught exceptions
logger.exceptions.handle(
    new winston.transports.File({
        filename: path.join(logsDir, 'exceptions.log'),
    })
);

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', {
        promise,
        reason: reason instanceof Error ? reason.message : reason,
    });
});

export default logger;
