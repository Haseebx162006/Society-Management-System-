import express from 'express';
import { protect, adminOnly } from '../middleware/authmiddleware';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/multer.middleware';
import {
    createSocietyRequest,
    createSociety,
    getAllSocietyRequests,
    updateSocietyRequestStatus,
    getAllSocieties,
    getMyManageableSocieties,
    getSocietyById,
    getSocietyMembers,
    addMember,
    updateMemberRole,
    removeMember,
    updateSociety,
    changePresident,
    suspendSociety,
    reactivateSociety,
    deleteSociety
} from '../controllers/societycontroller';

const router = express.Router();

// ─── Society Request Routes ──────────────────────────────────────────────────
router.post('/request', protect, createSocietyRequest);
router.get('/requests', protect, adminOnly, getAllSocietyRequests);
router.put('/requests/:id', protect, adminOnly, updateSocietyRequestStatus);

// ─── Society CRUD Routes ─────────────────────────────────────────────────────
router.post('/', protect, upload.single("logo"), createSociety);
router.get('/manageable', protect, getMyManageableSocieties);
router.get('/', protect, getAllSocieties);
router.get('/:id', protect, getSocietyById);
router.put('/:id', protect, authorize(['PRESIDENT'], 'SOCIETY'), upload.single("logo"), updateSociety);
router.delete('/:id', protect, adminOnly, deleteSociety);

// ─── Society Admin Actions ───────────────────────────────────────────────────
router.post('/:id/change-president', protect, adminOnly, changePresident);
router.post('/:id/suspend', protect, adminOnly, suspendSociety);
router.post('/:id/reactivate', protect, adminOnly, reactivateSociety);

// ─── Member Management Routes ────────────────────────────────────────────────
router.get('/:id/members', protect, authorize(['PRESIDENT'], 'SOCIETY'), getSocietyMembers);
router.post('/:id/members', protect, authorize(['PRESIDENT'], 'SOCIETY'), addMember);
router.put('/:id/members/:userId', protect, authorize(['PRESIDENT'], 'SOCIETY'), updateMemberRole);
router.delete('/:id/members/:userId', protect, authorize(['PRESIDENT'], 'SOCIETY'), removeMember);

export default router;
