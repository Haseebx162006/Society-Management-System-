import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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


// Security HTTP headers
app.use(helmet());

// CORS configuration
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS policy violation: ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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

// Handle unhandled routes
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
