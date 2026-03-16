import express from 'express';
import { protect } from '../middleware/authmiddleware';
import { authorize } from '../middleware/authorize';
import { validateRequest } from '../middleware/validate';
import { validateQRSchema, confirmEntrySchema } from '../validators/qrValidator';
import { validateQR, confirmEntry } from '../controllers/qrController';

const router = express.Router();

router.post(
    '/qr/validate',
    protect,
    authorize(['PRESIDENT', 'FACULTY ADVISOR', 'EVENT MANAGER'], 'SOCIETY'),
    validateRequest(validateQRSchema),
    validateQR
);

router.post(
    '/qr/confirm',
    protect,
    authorize(['PRESIDENT', 'FACULTY ADVISOR', 'EVENT MANAGER'], 'SOCIETY'),
    validateRequest(confirmEntrySchema),
    confirmEntry
);

export default router;
