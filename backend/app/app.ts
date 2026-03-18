import './instrument';
import * as Sentry from '@sentry/node';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { sanitize } from 'express-mongo-sanitize';
import auth_routes from './src/routes/authroutes';
import user_routes from './src/routes/userRoutes';
import society_routes from './src/routes/societyRoutes';
import group_routes from './src/routes/groupRoutes';
import join_routes from './src/routes/joinRoutes';
import event_routes from './src/routes/eventRoutes';
import email_routes from './src/routes/emailRoutes';
import sponsor_routes from './src/routes/sponsorRoutes';
import documentation_routes from './src/routes/documentationRoutes';
import qr_routes from './src/routes/qrRoutes';
import { errorHandler } from './src/middleware/errorHandler';
import { AppError } from './src/util/AppError';
import { paginationLimiter } from './src/middleware/paginationLimiter';
import { morganMiddleware } from './src/middleware/morganLogger';
import { attachRequestMetadata } from './src/middleware/auditLogger';
import logger from './src/util/logger';

const app = express();

// Set request timeout globally (30 seconds for API operations)
app.use((req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(30000);
    res.setTimeout(30000);
    next();
});

app.set('trust proxy', 1);

// HTTP Request logging with Morgan (via Winston)
app.use(morganMiddleware);

// Attach request metadata for audit logging
app.use(attachRequestMetadata);

// Log startup
logger.info('Express server initialized', {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString(),
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
    },
}));

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            // Allow non-browser requests like Postman, server-to-server, curl, etc.
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const err = new AppError(`CORS policy violation: ${origin} is not allowed`, 403);
        return callback(err);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

const globalLimiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: true }
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
    max: 10,
    windowMs: 15 * 60 * 1000,
    message: 'Too many authentication attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: true }
});
app.use('/api/auth', authLimiter);

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: (hits) => hits * 200,
});
app.use('/api', speedLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


// Add pagination limiter to prevent resource exhaustion
app.use(paginationLimiter);

app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);
    if (req.query && Object.keys(req.query).length > 0) {
        sanitize(req.query as Record<string, unknown>);
    }
    next();
});

app.get("/", (req: Request, res: Response) => {
    res.send("Hello How are you");
});

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/auth', auth_routes);
app.use('/api/user', user_routes);
app.use('/api/society', society_routes);
app.use('/api/groups', group_routes);
app.use('/api', join_routes);
app.use('/api', event_routes);
app.use('/api/email', email_routes);
app.use('/api/sponsors', sponsor_routes);
app.use('/api/documentations', documentation_routes);
app.use('/api', qr_routes);

app.get('/debug-sentry', (req: Request, res: Response) => {
    try {
        const foo = () => { throw new Error("Intentional Sentry Error"); };
        foo();
    } catch (e) {
        Sentry.captureException(e);
        res.status(500).send("Error reported to Sentry");
    }
});

app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

Sentry.setupExpressErrorHandler(app);

app.use(errorHandler);

export default app;
