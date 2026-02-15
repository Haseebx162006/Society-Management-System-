import express from 'express';
import { protect } from '../middleware/authmiddleware';
import { optionalProtect } from '../middleware/optionalProtect';
import { authorize } from '../middleware/authorize';
import {
    createJoinForm,
    getJoinFormsBySociety,
    getJoinFormById,
    updateJoinForm,
    deleteJoinForm,
    getJoinFormPublic
} from '../controllers/joinFormController';
import {
    submitJoinRequest,
    getJoinRequestsForSociety,
    getJoinRequestById,
    updateJoinRequestStatus,
    getMyJoinRequests
} from '../controllers/joinRequestController';

const router = express.Router();

// ─── Join Form CRUD (President) ──────────────────────────────────────────────
router.post(
    '/society/:id/join-forms',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    createJoinForm
);
router.get(
    '/society/:id/join-forms',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    getJoinFormsBySociety
);
router.get(
    '/society/:id/join-forms/:formId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    getJoinFormById
);
router.put(
    '/society/:id/join-forms/:formId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    updateJoinForm
);
router.delete(
    '/society/:id/join-forms/:formId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    deleteJoinForm
);

// ─── Public: View Form + Submit ──────────────────────────────────────────────
router.get(
    '/join-forms/:formId',
    optionalProtect,
    getJoinFormPublic
);
router.post(
    '/join-forms/:formId/submit',
    protect,   // submission always requires login
    submitJoinRequest
);

// ─── Join Request Management (President) ─────────────────────────────────────
router.get(
    '/society/:id/join-requests',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    getJoinRequestsForSociety
);
router.get(
    '/society/:id/join-requests/:requestId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    getJoinRequestById
);
router.put(
    '/society/:id/join-requests/:requestId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    updateJoinRequestStatus
);

// ─── User: My Requests ──────────────────────────────────────────────────────
router.get(
    '/my/join-requests',
    protect,
    getMyJoinRequests
);

export default router;
