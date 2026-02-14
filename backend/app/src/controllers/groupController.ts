import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import Group from '../models/Group';
import GroupMember from '../models/GroupMember';
import SocietyUserRole from '../models/SocietyUserRole';
import User from '../models/User';
import mongoose from 'mongoose';

const isPresident = async (userId: string | mongoose.Types.ObjectId, societyId: string | mongoose.Types.ObjectId): Promise<boolean> => {
    const role = await SocietyUserRole.findOne({
        user_id: userId,
        society_id: societyId,
        role: "PRESIDENT"
    });
    return !!role;
};


export const createGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { society_id, name, description } = req.body;

        if (!society_id || !name) {
            return res.status(400).json({ msg: "Society ID and Group Name are required" });
        }

        if (!await isPresident(req.user!._id, society_id)) {
            return res.status(403).json({ msg: "Only the Society President can create groups" });
        }

        const existingGroup = await Group.findOne({ society_id, name });
        if (existingGroup) {
            return res.status(400).json({ msg: "A group with this name already exists in the society" });
        }

        const group = await Group.create({
            society_id,
            name,
            description,
            created_by: req.user!._id
        });

        return res.status(201).json({
            msg: "Group created successfully",
            data: group
        });

    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ msg: "A group with this name already exists in the society" });
        }
        console.error("Error in createGroup:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

export const updateGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ msg: "Group not found" });
        }

        if (!await isPresident(req.user!._id, group.society_id.toString())) {
            return res.status(403).json({ msg: "Only the Society President can update groups" });
        }

        if (name) group.name = name;
        if (description !== undefined) group.description = description;
        group.updated_at = new Date();

        await group.save();

        return res.status(200).json({
            msg: "Group updated successfully",
            data: group
        });

    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ msg: "Group name must be unique within the society" });
        }
        console.error("Error in updateGroup:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

export const deleteGroup = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const group = await Group.findById(id).session(session);
        if (!group) {
            await session.abortTransaction();
            return res.status(404).json({ msg: "Group not found" });
        }

        if (!await isPresident(req.user!._id, group.society_id.toString())) {
            const presidentRole = await SocietyUserRole.findOne({
                user_id: req.user!._id,
                society_id: group.society_id,
                role: "PRESIDENT"
            }).session(session);
            if (!presidentRole) {
                await session.abortTransaction();
                return res.status(403).json({ msg: "Only the Society President can delete groups" });
            }
        }
        await GroupMember.deleteMany({ group_id: id }, { session });

        await SocietyUserRole.deleteMany({
            group_id: id,
            role: { $in: ["LEAD", "CO-LEAD"] }
        }, { session });
        await Group.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        return res.status(200).json({ msg: "Group and associated memberships deleted successfully" });

    } catch (error: any) {
        await session.abortTransaction();
        console.error("Error in deleteGroup:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    } finally {
        session.endSession();
    }
};

export const getGroupsInSociety = async (req: AuthRequest, res: Response) => {
    try {
        const { society_id } = req.params;

        const groups = await Group.find({ society_id }).sort({ name: 1 });
        return res.status(200).json({ data: groups });

    } catch (error: any) {
        console.error("Error in getGroupsInSociety:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

export const addMemberToGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { id: group_id } = req.params;
        const { user_id } = req.body;

        const group = await Group.findById(group_id);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        if (!await isPresident(req.user!._id, group.society_id.toString())) {
            return res.status(403).json({ msg: "Only President can add members" });
        }

        const societyRole = await SocietyUserRole.findOne({
            user_id,
            society_id: group.society_id
        });
        if (!societyRole) {
            return res.status(400).json({ msg: "User must be a member of the society before joining a group" });
        }

        const existingMember = await GroupMember.findOne({ group_id, user_id });
        if (existingMember) {
            return res.status(400).json({ msg: "User is already in this group" });
        }

        const newMember = await GroupMember.create({
            group_id,
            user_id,
            society_id: group.society_id
        });

        return res.status(201).json({ msg: "Member added to group", data: newMember });

    } catch (error: any) {
        console.error("Error in addMemberToGroup:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

export const removeMemberFromGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { id: group_id, userId: user_id } = req.params;

        const group = await Group.findById(group_id);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        if (!await isPresident(req.user!._id, group.society_id.toString())) {
            return res.status(403).json({ msg: "Only President can remove members" });
        }

        const deleted = await GroupMember.findOneAndDelete({ group_id, user_id });
        if (!deleted) {
            return res.status(404).json({ msg: "Member not found in this group" });
        }

        await SocietyUserRole.deleteMany({
            user_id,
            group_id,
            role: { $in: ["LEAD", "CO-LEAD"] }
        });

        return res.status(200).json({ msg: "Member removed from group" });

    } catch (error: any) {
        console.error("Error in removeMemberFromGroup:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

export const assignLeadership = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id: group_id } = req.params;
        const { user_id, role, title } = req.body; // role: "LEAD" | "CO-LEAD"

        if (!["LEAD", "CO-LEAD"].includes(role)) {
            return res.status(400).json({ msg: "Role must be LEAD or CO-LEAD" });
        }

        const group = await Group.findById(group_id);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        if (!await isPresident(req.user!._id, group.society_id.toString())) {
            return res.status(403).json({ msg: "Only President can assign leadership" });
        }

        const societyMember = await SocietyUserRole.findOne({ user_id, society_id: group.society_id });
        if (!societyMember) {
            return res.status(400).json({ msg: "User is not a member of the society" });
        }
        if (role === "LEAD") {
            const existingLead = await SocietyUserRole.findOne({
                group_id,
                role: "LEAD"
            }).session(session);

            if (existingLead && existingLead.user_id.toString() !== user_id) {
                await session.abortTransaction();
                return res.status(400).json({ msg: "Group already has a Lead. Remove existing Lead first." });
            }
        }

        await SocietyUserRole.findOneAndUpdate(
            { user_id, group_id },
            {
                name: title || (await User.findById(user_id))?.name,
                user_id,
                society_id: group.society_id,
                role, // LEAD or CO-LEAD
                group_id,
                assigned_by: req.user!._id,
                updated_at: new Date()
            },
            { upsert: true, new: true, session }
        );

        await session.commitTransaction();
        return res.status(200).json({ msg: `User assigned as ${role}` });

    } catch (error: any) {
        await session.abortTransaction();
        console.error("Error in assignLeadership:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    } finally {
        session.endSession();
    }
};

export const removeLeadership = async (req: AuthRequest, res: Response) => {
    try {
        const { id: group_id, userId: user_id } = req.params;

        const group = await Group.findById(group_id);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        if (!await isPresident(req.user!._id, group.society_id.toString())) {
            return res.status(403).json({ msg: "Only President can remove leadership" });
        }

        const result = await SocietyUserRole.findOneAndDelete({
            user_id,
            group_id,
            role: { $in: ["LEAD", "CO-LEAD"] }
        });

        if (!result) {
            return res.status(404).json({ msg: "User does not hold a leadership role in this group" });
        }

        return res.status(200).json({ msg: "Leadership role removed" });

    } catch (error: any) {
        console.error("Error in removeLeadership:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
};
