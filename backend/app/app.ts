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
import { errorHandler } from './src/middleware/errorHandler';
import { AppError } from './src/util/AppError';

const app = express();

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

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

const globalLimiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
    max: 10,
    windowMs: 15 * 60 * 1000,
    message: 'Too many authentication attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
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

app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.params) req.params = sanitize(req.params) as typeof req.params;
    next();
});

app.get("/", (req: Request, res: Response) => {
    res.send("Hello How are you");
});

app.use('/api/auth', auth_routes);
app.use('/api/user', user_routes);
app.use('/api/society', society_routes);
app.use('/api/groups', group_routes);
app.use('/api', join_routes);
app.use('/api', event_routes);
app.use('/api/email', email_routes);

app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
