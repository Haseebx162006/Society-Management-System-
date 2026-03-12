import { catchAsync } from '../util/catchAsync';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import Group from '../models/Group';
import GroupMember from '../models/GroupMember';
import SocietyUserRole from '../models/SocietyUserRole';
import User from '../models/User';
import mongoose from 'mongoose';
import { sendResponse, sendError } from '../util/response';

const isPresident = async (userId: string | mongoose.Types.ObjectId, societyId: string | mongoose.Types.ObjectId): Promise<boolean> => {
    const role = await SocietyUserRole.findOne({
        user_id: userId,
        society_id: societyId,
        role: "PRESIDENT"
    });
    return !!role;
};

export const createGroup = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { society_id, name, description } = req.body;

    if (!society_id || !name) {
        return sendError(res, 400, "Society ID and Group Name are required");
    }

    const existingGroup = await Group.findOne({ society_id, name });
    if (existingGroup) {
        return sendError(res, 400, "A group with this name already exists in the society");
    }

    const group = await Group.create({
        society_id,
        name,
        description,
        created_by: req.user!._id
    });

    return sendResponse(res, 201, "Group created successfully", group);
});

export const updateGroup = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const group = await Group.findById(id);
    if (!group) {
        return sendError(res, 404, "Group not found");
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    group.updated_at = new Date();

    await group.save();

    return sendResponse(res, 200, "Group updated successfully", group);
});

export const deleteGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const group = await Group.findById(id).session(session);
        if (!group) {
            await session.abortTransaction();
            return sendError(res, 404, "Group not found");
        }

        await GroupMember.deleteMany({ group_id: id }, { session });

        await SocietyUserRole.deleteMany({
            group_id: id,
            role: { $in: ["LEAD", "CO-LEAD"] }
        }, { session });
        await Group.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        return sendResponse(res, 200, "Group and associated memberships deleted successfully");

    } catch (error: any) {
        await session.abortTransaction();
        return next(error);
    } finally {
        session.endSession();
    }
};

export const getGroupsInSociety = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { society_id } = req.params;

    const groups = await Group.aggregate([
        {
            $match: {
                society_id: new mongoose.Types.ObjectId(society_id as string)
            }
        },
        {
            $lookup: {
                from: "groupmembers",
                localField: "_id",
                foreignField: "group_id",
                as: "members"
            }
        },
        {
            $addFields: {
                memberCount: { $size: "$members" }
            }
        },
        {
            $project: {
                members: 0
            }
        },
        {
            $sort: { name: 1 }
        }
    ]);

    return sendResponse(res, 200, "Groups in society fetched successfully", groups);
});

export const addMemberToGroup = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id: group_id } = req.params;
    const { user_id } = req.body;

    const group = await Group.findById(group_id);
    if (!group) return sendError(res, 404, "Group not found");

    const societyRole = await SocietyUserRole.findOne({
        user_id,
        society_id: group.society_id
    });
    if (!societyRole) {
        return sendError(res, 400, "User must be a member of the society before joining a group");
    }

    const existingMember = await GroupMember.findOne({ group_id, user_id });
    if (existingMember) {
        return sendError(res, 400, "User is already in this group");
    }

    const newMember = await GroupMember.create({
        group_id,
        user_id,
        society_id: group.society_id
    });

    societyRole.group_id = new mongoose.Types.ObjectId(group_id as string);
    await societyRole.save();

    return sendResponse(res, 201, "Member added to group", newMember);
});

export const removeMemberFromGroup = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id: group_id, userId: user_id } = req.params;

    const group = await Group.findById(group_id);
    if (!group) return sendError(res, 404, "Group not found");

    const deleted = await GroupMember.findOneAndDelete({ group_id, user_id });
    if (!deleted) {
        return sendError(res, 404, "Member not found in this group");
    }

    await SocietyUserRole.deleteMany({
        user_id,
        group_id,
        role: { $in: ["LEAD", "CO-LEAD"] }
    });

    await SocietyUserRole.findOneAndUpdate(
        { user_id, society_id: group.society_id },
        { $unset: { group_id: 1 } }
    );

    return sendResponse(res, 200, "Member removed from group");
});

export const assignLeadership = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id: group_id } = req.params;
        const { user_id, role, title } = req.body;

        if (!["LEAD", "CO-LEAD"].includes(role)) {
            return sendError(res, 400, "Role must be LEAD or CO-LEAD");
        }

        const group = await Group.findById(group_id);
        if (!group) return sendError(res, 404, "Group not found");

        const societyMember = await SocietyUserRole.findOne({ user_id, society_id: group.society_id });
        if (!societyMember) {
            return sendError(res, 400, "User is not a member of the society");
        }

        if (role === "LEAD") {
            const existingLead = await SocietyUserRole.findOne({
                group_id,
                role: "LEAD"
            }).session(session);

            if (existingLead && existingLead.user_id.toString() !== user_id) {
                await session.abortTransaction();
                return sendError(res, 400, "Group already has a lead");
            }
        }

        await SocietyUserRole.findOneAndUpdate(
            { user_id, society_id: group.society_id, group_id }, // Fixed query
            {
                name: title || (await User.findById(user_id))?.name,
                user_id,
                society_id: group.society_id,
                role,
                group_id,
                assigned_by: req.user!._id,
                updated_at: new Date()
            },
            { upsert: true, new: true, session }
        );

        await session.commitTransaction();
        return sendResponse(res, 200, `User assigned as ${role}`);

    } catch (error: any) {
        await session.abortTransaction();
        return next(error);
    } finally {
        session.endSession();
    }
};

export const removeLeadership = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id: group_id, userId: user_id } = req.params;

    const group = await Group.findById(group_id);
    if (!group) return sendError(res, 404, "Group not found");

    const result = await SocietyUserRole.findOneAndDelete({
        user_id,
        group_id,
        role: { $in: ["LEAD", "CO-LEAD"] }
    });

    if (!result) {
        return sendError(res, 404, "User does not hold a leadership role in this group");
    }

    return sendResponse(res, 200, "Leadership role removed");
});

export const getGroupById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const group = await Group.findById(id).populate("created_by", "name email phone");
    if (!group) {
        return sendError(res, 404, "Group not found");
    }

    const members = await GroupMember.find({ group_id: id }).populate("user_id", "name email phone");
    const leadership = await SocietyUserRole.find({
        group_id: id,
        role: { $in: ["LEAD", "CO-LEAD"] }
    }).populate("user_id", "name email phone");

    return sendResponse(res, 200, "Group details fetched successfully", {
        group,
        members,
        leadership
    });
});

export const getGroupMembers = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id: group_id } = req.params;

    const group = await Group.findById(group_id);
    if (!group) {
        return sendError(res, 404, "Group not found");
    }

    const members = await GroupMember.find({ group_id }).populate("user_id", "name email phone");

    return sendResponse(res, 200, "Group members fetched successfully", members);
});

export const updateMemberRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id: group_id, userId: user_id } = req.params;
        const { role } = req.body;

        if (!["LEAD", "CO-LEAD", "SPONSOR MANAGER", "MEMBER"].includes(role)) {
            return sendError(res, 400, "Invalid role");
        }

        const group = await Group.findById(group_id).session(session);
        if (!group) return sendError(res, 404, "Group not found");

        const member = await GroupMember.findOne({ group_id, user_id }).session(session);
        if (!member) return sendError(res, 404, "Member not found in this group");

        member.role = role;
        await member.save({ session });

        if (["LEAD", "CO-LEAD", "SPONSOR MANAGER"].includes(role)) {
            await SocietyUserRole.findOneAndUpdate(
                { user_id, society_id: group.society_id },
                {
                    role: role,
                    group_id: group._id, 
                    assigned_by: req.user!._id,
                    updated_at: new Date()
                },
                { session }
            );
        } else {
            const currentSocietyRole = await SocietyUserRole.findOne({ 
                user_id, 
                society_id: group.society_id 
            }).session(session);

            if (currentSocietyRole?.group_id?.toString() === group_id.toString()) {
                await SocietyUserRole.findOneAndUpdate(
                    { user_id, society_id: group.society_id },
                    {
                        role: "MEMBER",
                        $unset: { group_id: 1 }, 
                        updated_at: new Date()
                    },
                    { session }
                );
            }
        }

        await session.commitTransaction();
        return sendResponse(res, 200, "Member role updated successfully", member);

    } catch (error: any) {
        await session.abortTransaction();
        return next(error);
    } finally {
        session.endSession();
    }
};

export const getMyGroupMemberships = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const memberships = await GroupMember.find({ user_id: req.user!._id })
        .populate('group_id', 'name society_id')
        .populate('society_id', 'name');

    return sendResponse(res, 200, "My group memberships fetched", memberships);
});
