import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import Society from '../models/Society';
import SocietyRequest from '../models/SocietyRequest';
import SocietyUserRole from '../models/SocietyUserRole';
import User from '../models/User';


export const createSocietyRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { society_name } = req.body;

        if (!society_name || typeof society_name !== "string") {
            return res.status(400).json({ msg: "Society name is required" });
        }

        // Check if a society with this name already exists
        const existingSociety = await Society.findOne({ name: society_name });
        if (existingSociety) {
            return res.status(400).json({ msg: "A society with this name already exists" });
        }

        // Check if there's already a pending request for this society name
        const existingRequest = await SocietyRequest.findOne({
            society_name,
            status: "PENDING"
        });
        if (existingRequest) {
            return res.status(400).json({ msg: "A pending request for this society name already exists" });
        }

        const societyRequest = await SocietyRequest.create({
            user_id: req.user!._id,
            society_name
        });

        return res.status(201).json({
            msg: "Society request submitted successfully",
            data: societyRequest
        });

    } catch (error: any) {
        console.error("Error in createSocietyRequest:", error.message);
        return res.status(500).json({ msg: "Internal server error while creating society request" });
    }
};


export const getAllSocietyRequests = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query;

        const filter: any = {};
        if (status && ["APPROVED", "PENDING", "REJECTED"].includes(status as string)) {
            filter.status = status;
        }

        const requests = await SocietyRequest.find(filter)
            .populate("user_id", "name email")
            .sort({ created_at: -1 });

        return res.status(200).json({
            msg: "Society requests fetched successfully",
            data: requests
        });

    } catch (error: any) {
        console.error("Error in getAllSocietyRequests:", error.message);
        return res.status(500).json({ msg: "Internal server error while fetching society requests" });
    }
};


export const updateSocietyRequestStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        if (!status || !["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({ msg: "Status must be either 'APPROVED' or 'REJECTED'" });
        }

        const societyRequest = await SocietyRequest.findById(id);
        if (!societyRequest) {
            return res.status(404).json({ msg: "Society request not found" });
        }

        if (societyRequest.status !== "PENDING") {
            return res.status(400).json({ msg: "This request has already been processed" });
        }

        if (status === "REJECTED") {
            if (!rejection_reason || typeof rejection_reason !== "string") {
                return res.status(400).json({ msg: "Rejection reason is required when rejecting a request" });
            }
            societyRequest.status = "REJECTED";
            societyRequest.rejection_reason = rejection_reason;
            await societyRequest.save();

            return res.status(200).json({
                msg: "Society request rejected",
                data: societyRequest
            });
        }

        const existingSociety = await Society.findOne({ name: societyRequest.society_name });
        if (existingSociety) {
            return res.status(400).json({ msg: "A society with this name already exists" });
        }

        const newSociety = await Society.create({
            name: societyRequest.society_name,
            description: `Society created from approved request`,
            created_by: societyRequest.user_id
        });

        // Assign the requester as PRESIDENT of the new society
        await SocietyUserRole.create({
            name: societyRequest.society_name,
            user_id: societyRequest.user_id,
            society_id: newSociety._id,
            role: "PRESIDENT",
            assigned_by: req.user!._id
        });

        societyRequest.status = "APPROVED";
        await societyRequest.save();

        return res.status(200).json({
            msg: "Society request approved and society created",
            data: {
                request: societyRequest,
                society: newSociety
            }
        });

    } catch (error: any) {
        console.error("Error in updateSocietyRequestStatus:", error.message);
        return res.status(500).json({ msg: "Internal server error while updating society request" });
    }
};


export const getAllSocieties = async (req: AuthRequest, res: Response) => {
    try {
        const societies = await Society.find({ status: "ACTIVE" })
            .populate("created_by", "name email")
            .sort({ created_at: -1 });

        return res.status(200).json({
            msg: "Societies fetched successfully",
            data: societies
        });

    } catch (error: any) {
        console.error("Error in getAllSocieties:", error.message);
        return res.status(500).json({ msg: "Internal server error while fetching societies" });
    }
};


export const getSocietyById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const society = await Society.findById(id)
            .populate("created_by", "name email");

        if (!society) {
            return res.status(404).json({ msg: "Society not found" });
        }

        // Fetch members of this society
        const members = await SocietyUserRole.find({ society_id: id })
            .populate("user_id", "name email")
            .populate("assigned_by", "name email");

        return res.status(200).json({
            msg: "Society fetched successfully",
            data: {
                society,
                members
            }
        });

    } catch (error: any) {
        console.error("Error in getSocietyById:", error.message);
        return res.status(500).json({ msg: "Internal server error while fetching society" });
    }
};

// ─── Member Management Endpoints ─────────────────────────────────────────────

/**
 * POST /api/society/:id/members
 * Assigns a user to a society with a specific role.
 * Body: { user_id, role, name?, group_id? }
 */
export const addMember = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;
        const { user_id, role, name, group_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ msg: "user_id is required" });
        }

        // Verify society exists and is active
        const society = await Society.findById(society_id);
        if (!society || society.status !== "ACTIVE") {
            return res.status(404).json({ msg: "Active society not found" });
        }

        // Verify user exists
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Check if user is already a member of this society
        const existingRole = await SocietyUserRole.findOne({ user_id, society_id });
        if (existingRole) {
            return res.status(400).json({ msg: "User is already a member of this society" });
        }

        const memberRole = await SocietyUserRole.create({
            name: name || user.name,
            user_id,
            society_id,
            role: role || "MEMBER",
            group_id: group_id || null,
            assigned_by: req.user!._id
        });

        return res.status(201).json({
            msg: "Member added to society successfully",
            data: memberRole
        });

    } catch (error: any) {
        console.error("Error in addMember:", error.message);
        return res.status(500).json({ msg: "Internal server error while adding member" });
    }
};


export const updateMemberRole = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id, userId: user_id } = req.params;
        const { role, group_id } = req.body;

        if (!role) {
            return res.status(400).json({ msg: "Role is required" });
        }

        const validRoles = ["PRESIDENT", "LEAD", "CO-LEAD", "GENERAL SECRETARY", "MEMBER"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                msg: `Invalid role. Must be one of: ${validRoles.join(", ")}`
            });
        }

        const memberRole = await SocietyUserRole.findOne({ user_id, society_id });
        if (!memberRole) {
            return res.status(404).json({ msg: "Member not found in this society" });
        }

        memberRole.role = role;
        if (group_id !== undefined) {
            memberRole.group_id = group_id;
        }
        memberRole.updated_at = new Date();
        await memberRole.save();

        return res.status(200).json({
            msg: "Member role updated successfully",
            data: memberRole
        });

    } catch (error: any) {
        console.error("Error in updateMemberRole:", error.message);
        return res.status(500).json({ msg: "Internal server error while updating member role" });
    }
};


export const removeMember = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id, userId: user_id } = req.params;

        const memberRole = await SocietyUserRole.findOneAndDelete({ user_id, society_id });
        if (!memberRole) {
            return res.status(404).json({ msg: "Member not found in this society" });
        }

        return res.status(200).json({
            msg: "Member removed from society successfully"
        });

    } catch (error: any) {
        console.error("Error in removeMember:", error.message);
        return res.status(500).json({ msg: "Internal server error while removing member" });
    }
};
