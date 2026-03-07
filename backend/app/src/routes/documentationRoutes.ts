import express from 'express';
import { protect } from '../middleware/authmiddleware';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/multer.middleware';
import {
    uploadDocumentation,
    getSocietyDocumentations,
    deleteDocumentation
} from '../controllers/documentationController';

const router = express.Router({ mergeParams: true });

// Routes are expected to be mounted at /api/society/:id/documentations
// OR we can mount at /api/documentations and pass societyId in params. 
// Standard in this app seems to be /api/society/:id/... or standalone.
// We'll use standalone: /api/documentations/society/:id

router.post(
    '/society/:id',
    protect,
    authorize(['PRESIDENT', 'DOCUMENTATION MANAGER'], 'SOCIETY'),
    upload.single('file'),
    uploadDocumentation
);

router.get(
    '/society/:id',
    protect,
    authorize(['PRESIDENT', 'DOCUMENTATION MANAGER', 'FINANCE MANAGER', 'EVENT MANAGER', 'SPONSOR MANAGER'], 'SOCIETY'),
    getSocietyDocumentations
);

router.delete(
    '/:docId/society/:id',
    protect,
    authorize(['PRESIDENT', 'DOCUMENTATION MANAGER'], 'SOCIETY'),
    deleteDocumentation
);

export default router;
