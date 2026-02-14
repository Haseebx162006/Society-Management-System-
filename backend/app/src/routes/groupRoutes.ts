import express from 'express';
import { protect } from '../middleware/authmiddleware';
import {
    createGroup,
    getGroupsInSociety,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    assignLeadership,
    removeLeadership
} from '../controllers/groupController';

const router = express.Router();

// Group CRUD
router.post('/', protect, createGroup);
router.get('/society/:society_id', protect, getGroupsInSociety);
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, deleteGroup);

// Membership
router.post('/:id/members', protect, addMemberToGroup);
router.delete('/:id/members/:userId', protect, removeMemberFromGroup);

// Leadership
router.post('/:id/leadership', protect, assignLeadership);
router.delete('/:id/leadership/:userId', protect, removeLeadership);

export default router;
