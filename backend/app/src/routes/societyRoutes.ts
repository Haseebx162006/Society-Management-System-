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
    deleteSociety
} from '../controllers/societycontroller';

const router = express.Router();


router.post('/request', protect, createSocietyRequest);
router.get('/requests', protect, adminOnly, getAllSocietyRequests);
router.put('/requests/:id', protect, adminOnly, updateSocietyRequestStatus);


router.post('/', protect, upload.single("logo"), createSociety);
router.get('/manageable', protect, getMyManageableSocieties);
router.get('/admin/all', protect, adminOnly, getAllSocietiesAdmin);
router.get('/', getAllSocieties);
router.get('/members/all', protect, adminOnly, getAllPlatformMembers);
router.get('/:id', getSocietyById);
router.put('/:id', protect, authorize(['PRESIDENT'], 'SOCIETY'), upload.single("logo"), updateSociety);
router.delete('/:id', protect, adminOnly, deleteSociety);


router.post('/:id/change-president', protect, adminOnly, changePresident);
router.post('/:id/suspend', protect, adminOnly, suspendSociety);
router.post('/:id/reactivate', protect, adminOnly, reactivateSociety);


router.get('/:id/members', protect, authorize(['PRESIDENT'], 'SOCIETY'), getSocietyMembers);
router.post('/:id/members', protect, authorize(['PRESIDENT'], 'SOCIETY'), addMember);
router.put('/:id/members/:userId', protect, authorize(['PRESIDENT'], 'SOCIETY'), updateMemberRole);
router.delete('/:id/members/:userId', protect, authorize(['PRESIDENT'], 'SOCIETY'), removeMember);

export default router;
