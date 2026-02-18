import express from 'express';
import { protect } from '../middleware/authmiddleware';
import { optionalProtect } from '../middleware/optionalProtect';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/multer.middleware';
import {
    createJoinForm,
    getJoinFormsBySociety,
    getJoinFormById,
    updateJoinForm,
    deleteJoinForm,
    getJoinFormPublic,
    getPublicJoinFormsBySociety
} from '../controllers/joinFormController';
import {
    submitJoinRequest,
    getJoinRequestsForSociety,
    getJoinRequestById,
    updateJoinRequestStatus,
    getMyJoinRequests
} from '../controllers/joinRequestController';
import {
    uploadPreviousMembers,
    getPreviousMembers,
    deletePreviousMember,
    clearPreviousMembers,
    exportUnregisteredMembers
} from '../controllers/previousMemberController';

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

// ─── Public: List active forms for society + View + Submit ───────────────────
router.get(
    '/society/:id/public-join-forms',
    getPublicJoinFormsBySociety
);
router.get(
    '/join-forms/:formId',
    optionalProtect,
    getJoinFormPublic
);
router.post(
    '/join-forms/:formId/submit',
    protect,   // submission always requires login
    upload.any(),
    submitJoinRequest
);

// ─── Join Request Management (President) ─────────────────────────────────────
router.get(
    '/society/:id/join-requests',
    protect,
    authorize(['PRESIDENT', 'FINANCE MANAGER'], 'SOCIETY'),
    getJoinRequestsForSociety
);
router.get(
    '/society/:id/join-requests/:requestId',
    protect,
    authorize(['PRESIDENT', 'FINANCE MANAGER'], 'SOCIETY'),
    getJoinRequestById
);
router.put(
    '/society/:id/join-requests/:requestId',
    protect,
    authorize(['PRESIDENT', 'FINANCE MANAGER'], 'SOCIETY'),
    updateJoinRequestStatus
);

// ─── User: My Requests ──────────────────────────────────────────────────────
router.get(
    '/my/join-requests',
    protect,
    getMyJoinRequests
);

// ─── Previous Members (President) ───────────────────────────────────────────
router.post(
    '/society/:id/previous-members/upload',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    upload.single('file'),
    uploadPreviousMembers
);
router.get(
    '/society/:id/previous-members',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    getPreviousMembers
);
router.delete(
    '/society/:id/previous-members/:memberId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    deletePreviousMember
);
router.delete(
    '/society/:id/previous-members',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    clearPreviousMembers
);
router.get(
    '/society/:id/previous-members/export-unregistered',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    exportUnregisteredMembers
);

export default router;
