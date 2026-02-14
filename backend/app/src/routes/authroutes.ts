import express from 'express';
import { signup, login, refresh, logout } from '../controllers/authcontroller';
import { protect, adminOnly } from '../middleware/authmiddleware';

const router = express.Router();

router.post('/login', login);

router.post('/signup', signup);

router.post('/refresh', refresh);

router.post('/logout', logout);

export default router;
