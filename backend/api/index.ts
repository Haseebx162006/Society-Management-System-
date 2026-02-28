import dotenv from 'dotenv';
dotenv.config();

import app from '../app/app';
import db from '../app/src/db/db';

// Connect to DB once per cold start (reused across warm invocations)
db();

export default app;
