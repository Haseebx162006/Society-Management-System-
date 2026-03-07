import express from 'express';
import { protect } from '../middleware/authmiddleware';
import { getMySocieties, getMyRequests, updateProfile, getProfile, changePassword, getAllUsers } from '../controllers/userController';
import { adminOrSocietyHead } from '../middleware/authmiddleware';

const router = express.Router();

router.get('/all', protect, adminOrSocietyHead, getAllUsers);
router.get('/societies', protect, getMySocieties);
router.get('/requests', protect, getMyRequests);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/me', protect, getProfile);

export default router;
