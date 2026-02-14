import express from 'express';
import { protect, adminOnly } from '../middleware/authmiddleware';
import {
    createSocietyRequest,
    getAllSocietyRequests,
    updateSocietyRequestStatus,
    getAllSocieties,
    getSocietyById,
    addMember,
    updateMemberRole,
    removeMember
} from '../controllers/societycontroller';

const router = express.Router();

// ─── Society Request Routes ──────────────────────────────────────────────────
router.post('/request', protect, createSocietyRequest);
router.get('/requests', protect, adminOnly, getAllSocietyRequests);
router.put('/requests/:id', protect, adminOnly, updateSocietyRequestStatus);

// ─── Society CRUD Routes ─────────────────────────────────────────────────────
router.get('/', protect, getAllSocieties);
router.get('/:id', protect, getSocietyById);

// ─── Member Management Routes ────────────────────────────────────────────────
router.post('/:id/members', protect, adminOnly, addMember);
router.put('/:id/members/:userId', protect, adminOnly, updateMemberRole);
router.delete('/:id/members/:userId', protect, adminOnly, removeMember);

export default router;
