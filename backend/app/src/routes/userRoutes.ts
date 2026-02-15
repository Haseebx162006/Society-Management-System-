import express from 'express';
import { protect } from '../middleware/authmiddleware';
import { getMySocieties, getMyRequests, updateProfile } from '../controllers/userController';

const router = express.Router();

router.get('/societies', protect, getMySocieties);
router.get('/requests', protect, getMyRequests);
router.put('/profile', protect, updateProfile);

export default router;
