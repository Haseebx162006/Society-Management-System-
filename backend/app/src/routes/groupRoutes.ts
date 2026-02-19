import express from 'express';
import { protect } from '../middleware/authmiddleware';
import { authorize } from '../middleware/authorize';
import {
    createGroup,
    getGroupsInSociety,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    assignLeadership,
    removeLeadership,
    getGroupById,
    getGroupMembers,
    updateMemberRole,
    getMyGroupMemberships
} from '../controllers/groupController';

const router = express.Router();

// Group CRUD
router.get('/my-memberships', protect, getMyGroupMemberships);
router.post('/', protect, authorize(['PRESIDENT'], 'SOCIETY'), createGroup);
router.get('/society/:society_id', protect, authorize(['PRESIDENT', 'LEAD', 'CO-LEAD', 'MEMBER'], 'SOCIETY'), getGroupsInSociety);
router.put('/:id', protect, authorize(['PRESIDENT'], 'GROUP'), updateGroup);
router.delete('/:id', protect, authorize(['PRESIDENT'], 'GROUP'), deleteGroup);

router.get('/:id', protect, authorize(['PRESIDENT', 'LEAD', 'CO-LEAD', 'MEMBER'], 'GROUP'), getGroupById);
router.get('/:id/members', protect, authorize(['PRESIDENT', 'LEAD', 'CO-LEAD', 'MEMBER'], 'GROUP'), getGroupMembers);

// Membership
router.post('/:id/members', protect, authorize(['PRESIDENT', 'LEAD'], 'GROUP'), addMemberToGroup);
router.delete('/:id/members/:userId', protect, authorize(['PRESIDENT', 'LEAD'], 'GROUP'), removeMemberFromGroup);
router.put('/:id/members/:userId/role', protect, authorize(['PRESIDENT'], 'GROUP'), updateMemberRole);

// Leadership
router.post('/:id/leadership', protect, authorize(['PRESIDENT'], 'GROUP'), assignLeadership);
router.delete('/:id/leadership/:userId', protect, authorize(['PRESIDENT'], 'GROUP'), removeLeadership);

export default router;
