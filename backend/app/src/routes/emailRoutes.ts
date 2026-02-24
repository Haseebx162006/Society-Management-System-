import express from 'express';
import { protect } from '../middleware/authmiddleware';
import { authorize } from '../middleware/authorize';
import { sendBulkEmail, getEmailTargets } from '../controllers/emailController';

const router = express.Router();

// Get available email targets (groups + member counts)
router.get(
    '/:society_id/targets',
    protect,
    authorize(['PRESIDENT', 'GENERAL SECRETARY', 'EVENT MANAGER', 'LEAD', 'CO-LEAD'], 'SOCIETY'),
    getEmailTargets
);

// Send bulk email to society members
router.post(
    '/:society_id/send',
    protect,
    authorize(['PRESIDENT', 'GENERAL SECRETARY', 'EVENT MANAGER', 'LEAD', 'CO-LEAD'], 'SOCIETY'),
    sendBulkEmail
);

export default router;
