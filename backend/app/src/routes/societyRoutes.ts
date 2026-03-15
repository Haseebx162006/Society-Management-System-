import express from 'express';
import { protect, adminOnly, societyHeadOnly, adminOrSocietyHead } from '../middleware/authmiddleware';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/multer.middleware';
import { memberOperationsLimiter, adminActionLimiter, societyCreationLimiter } from '../middleware/rateLimiters';
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
    askForRenewal,
    createPresident,
    compareSocietyRequest,
    changeFacultyAdvisor,
    updatePresidentDetails
} from '../controllers/societycontroller';

const router = express.Router();


router.post('/request', protect, createSocietyRequest);
router.get('/requests/me', protect, getMySocietyRequests);
router.get('/requests', protect, adminOrSocietyHead, getAllSocietyRequests);
router.get('/requests/pending', protect, societyHeadOnly, getPendingSocietyRequests);
router.get('/requests/:id/compare', protect, adminOrSocietyHead, compareSocietyRequest);
router.put('/requests/:id', protect, adminOrSocietyHead, updateSocietyRequestStatus);

// ✅ ADD RATE LIMITER: Prevent spam society creation
router.post('/', protect, societyCreationLimiter, upload.single("logo"), createSociety);
router.get('/manageable', protect, getMyManageableSocieties);
router.get('/admin/all', protect, adminOrSocietyHead, getAllSocietiesAdmin);
router.get('/', getAllSocieties);
router.get('/members/all', protect, adminOrSocietyHead, getAllPlatformMembers);
router.get('/:id/request', protect, getSocietyRequestForSociety);
router.get('/:id', getSocietyById);
router.put('/:id', protect, authorize(['PRESIDENT'], 'SOCIETY'), upload.single("logo"), updateSociety);
router.delete('/:id', protect, adminOnly, deleteSociety);


router.post('/:id/change-president', protect, adminOnly, changePresident);
router.post('/:id/president', protect, adminOrSocietyHead, createPresident);
// ✅ ADD RATE LIMITER: Prevent admin abuse
router.post('/:id/suspend', protect, adminActionLimiter, adminOrSocietyHead, suspendSociety);
router.post('/:id/reactivate', protect, adminActionLimiter, adminOrSocietyHead, reactivateSociety);
router.post('/ask-for-renewal', protect, societyHeadOnly, askForRenewal);
router.put('/:id/faculty-advisor', protect, adminOrSocietyHead, changeFacultyAdvisor);
router.put('/:id/president/details', protect, adminOrSocietyHead, updatePresidentDetails);


// ✅ ADD RATE LIMITER: Prevent mass member operations
router.get('/:id/members', protect, authorize(['PRESIDENT', 'SPONSOR MANAGER'], 'SOCIETY'), getSocietyMembers);
router.post('/:id/members', protect, memberOperationsLimiter, authorize(['PRESIDENT', 'SPONSOR MANAGER'], 'SOCIETY'), addMember);
router.put('/:id/members/:userId', protect, memberOperationsLimiter, authorize(['PRESIDENT', 'SPONSOR MANAGER'], 'SOCIETY'), updateMemberRole);
router.delete('/:id/members/:userId', protect, memberOperationsLimiter, authorize(['PRESIDENT', 'SPONSOR MANAGER'], 'SOCIETY'), removeMember);

export default router;
