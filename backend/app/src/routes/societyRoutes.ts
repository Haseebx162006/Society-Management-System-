import express from 'express';
import { protect, adminOnly, societyHeadOnly, adminOrSocietyHead } from '../middleware/authmiddleware';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/multer.middleware';
import {
    createSocietyRequest,
    createSociety,
    getAllSocietyRequests,
    getPendingSocietyRequests,
    updateSocietyRequestStatus,
    getAllSocieties,
    getAllSocietiesAdmin,
    getMyManageableSocieties,
    getSocietyById,
    getAllPlatformMembers,
    getSocietyMembers,
    addMember,
    updateMemberRole,
    removeMember,
    updateSociety,
    changePresident,
    suspendSociety,
    reactivateSociety,
    deleteSociety,
    getMySocietyRequests,
    getSocietyRequestForSociety,
    askForRenewal
} from '../controllers/societycontroller';

const router = express.Router();


router.post('/request', protect, createSocietyRequest);
router.get('/requests/me', protect, getMySocietyRequests);
router.get('/requests', protect, adminOrSocietyHead, getAllSocietyRequests);
router.get('/requests/pending', protect, societyHeadOnly, getPendingSocietyRequests);
router.put('/requests/:id', protect, adminOrSocietyHead, updateSocietyRequestStatus);


router.post('/', protect, upload.single("logo"), createSociety);
router.get('/manageable', protect, getMyManageableSocieties);
router.get('/admin/all', protect, adminOrSocietyHead, getAllSocietiesAdmin);
router.get('/', getAllSocieties);
router.get('/members/all', protect, adminOrSocietyHead, getAllPlatformMembers);
router.get('/:id/request', protect, getSocietyRequestForSociety);
router.get('/:id', getSocietyById);
router.put('/:id', protect, authorize(['PRESIDENT'], 'SOCIETY'), upload.single("logo"), updateSociety);
router.delete('/:id', protect, adminOnly, deleteSociety);


router.post('/:id/change-president', protect, adminOnly, changePresident);
router.post('/:id/suspend', protect, adminOrSocietyHead, suspendSociety);
router.post('/:id/reactivate', protect, adminOrSocietyHead, reactivateSociety);
router.post('/ask-for-renewal', protect, societyHeadOnly, askForRenewal);


router.get('/:id/members', protect, authorize(['PRESIDENT', 'SPONSOR MANAGER'], 'SOCIETY'), getSocietyMembers);
router.post('/:id/members', protect, authorize(['PRESIDENT', 'SPONSOR MANAGER'], 'SOCIETY'), addMember);
router.put('/:id/members/:userId', protect, authorize(['PRESIDENT', 'SPONSOR MANAGER'], 'SOCIETY'), updateMemberRole);
router.delete('/:id/members/:userId', protect, authorize(['PRESIDENT', 'SPONSOR MANAGER'], 'SOCIETY'), removeMember);

export default router;
