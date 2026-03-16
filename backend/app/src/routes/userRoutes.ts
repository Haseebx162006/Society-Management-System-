import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/authmiddleware';
import { getMySocieties, getMyRequests, updateProfile, getProfile, changePassword, getAllUsers } from '../controllers/userController';
import { adminOrSocietyHead } from '../middleware/authmiddleware';
import { validateRequest } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../validators/userValidator';

const profileMutationLimiter = rateLimit({
    max: 10,
    windowMs: 15 * 60 * 1000,
    message: 'Too many profile update attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: true },
});

const router = express.Router();

router.get('/all', protect, adminOrSocietyHead, getAllUsers);
router.get('/societies', protect, getMySocieties);
router.get('/requests', protect, getMyRequests);
router.put('/profile', protect, profileMutationLimiter, validateRequest(updateProfileSchema), updateProfile);
router.put('/password', protect, profileMutationLimiter, validateRequest(changePasswordSchema), changePassword);
router.get('/me', protect, getProfile);

export default router;
