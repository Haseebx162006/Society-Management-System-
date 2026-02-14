import express from 'express';
import { signup, login } from '../controllers/authcontroller';
import { protect, adminOnly } from '../middleware/authmiddleware';

const router = express.Router();

router.post('/login', login);

router.post('/signup', signup);

export default router;
