import dotenv from 'dotenv';
dotenv.config();

import app from '../app/app';
import db from '../app/src/db/db';
import { Request, Response } from 'express';

let dbReady: Promise<void> | null = null;

export default async function handler(req: Request, res: Response) {
  if (!dbReady) {
    dbReady = db();
  }
  await dbReady;

  if (req.url !== '/' && req.url !== '' && !req.url!.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
