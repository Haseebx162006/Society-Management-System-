import dotenv from 'dotenv';
dotenv.config();

import app from '../app/app';
import db from '../app/src/db/db';
import { Request, Response } from 'express';

// Await DB connection before handling any request (critical for serverless cold starts)
let dbReady: Promise<void> | null = null;

export default async function handler(req: Request, res: Response) {
  // Ensure DB is connected before processing
  if (!dbReady) {
    dbReady = db();
  }
  await dbReady;

  // Vercel strips the /api prefix when routing to api/ directory functions.
  // Re-add it so Express routes (/api/auth, /api/user, etc.) match correctly.
  if (req.url !== '/' && req.url !== '' && !req.url!.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
