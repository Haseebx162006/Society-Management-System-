import dotenv from 'dotenv';
dotenv.config();

import app from '../app/app';
import db from '../app/src/db/db';
import { Request, Response } from 'express';

// Connect to DB once per cold start (reused across warm invocations)
db();

// Vercel strips the /api prefix when routing to api/ directory functions.
// Re-add it so Express routes (/api/auth, /api/user, etc.) match correctly.
export default function handler(req: Request, res: Response) {
  if (!req.url!.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
