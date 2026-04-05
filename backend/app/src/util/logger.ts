import winston from 'winston';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Winston Logger Configuration
 * Handles structured logging for production monitoring
 */

// Determine logs directory - use /tmp for Lambda/container, fallback to local logs
let logsDir = path.join(process.cwd(), 'logs');
let canUseFileTransport = true;

// Try to use temp directory in Lambda/container environments
if (process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    logsDir = path.join(os.tmpdir(), 'logs');
}

// Create logs directory if it doesn't exist
try {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
} catch (error) {
    console.error('Failed to create logs directory:', error);
    canUseFileTransport = false;
}

// Custom format for better readability
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    })
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
const transportsList: winston.transport[] = [];

// Add file transports only if directory creation succeeded
if (canUseFileTransport) {
    transportsList.push(
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
        })
    );
}

// Always add console transport as fallback/primary in production containers
transportsList.push(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                return `\x1b[90m[${timestamp}]\x1b[0m ${level}: ${message}${metaStr}`;
            })
        ),
    })
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: transportsList,
});

// Log uncaught exceptions - only to file if available, otherwise console handles it
if (canUseFileTransport) {
    logger.exceptions.handle(
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log'),
        })
    );
}

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', {
        promise,
        reason: reason instanceof Error ? reason.message : reason,
    });
});

export default logger;
