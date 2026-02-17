import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import Group from '../models/Group';
import Society from '../models/Society';
import SocietyRequest from '../models/SocietyRequest';
import SocietyUserRole from '../models/SocietyUserRole';
import User from '../models/User';
import { isPresident } from '../util/roleUtils';
import mongoose from 'mongoose';
import { sendResponse, sendError } from '../util/response';


export const createSocietyRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { society_name, description } = req.body;

        if (!society_name || typeof society_name !== "string") {
            return sendError(res, 400, "Society name is required");
        }

        // Check if a society with this name already exists
        const existingSociety = await Society.findOne({ name: society_name });
        if (existingSociety) {
             return sendError(res, 400, "A society with this name already exists");
        }

        // Check if there's already a pending request for this society name
        const existingRequest = await SocietyRequest.findOne({
            society_name,
            status: "PENDING"
        });
        if (existingRequest) {
             return sendError(res, 400, "A pending request for this society name already exists");
        }

        const societyRequest = await SocietyRequest.create({
            user_id: req.user!._id,
            society_name,
            description
        });

        return sendResponse(res, 201, "Society request submitted successfully", societyRequest);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error while creating society request", error);
    }
};

export const createSociety = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, registration_fee, teams, custom_fields, content_sections } = req.body;

        if (!name) return sendError(res, 400, "Society name is required");

        const existingSociety = await Society.findOne({ name });
        if (existingSociety) {
            // Check for soft-deleted society or orphan (failed creation)
            const presidentRole = await SocietyUserRole.findOne({ society_id: existingSociety._id, role: 'PRESIDENT' });
            
            if (existingSociety.status === 'DELETED' || !presidentRole) {
                 console.log(`Cleaning up zombie/orphan society: ${name}`);
                 await Society.deleteOne({ _id: existingSociety._id });
                 await Group.deleteMany({ society_id: existingSociety._id });
                 await SocietyUserRole.deleteMany({ society_id: existingSociety._id });
            } else if (presidentRole.user_id.toString() === req.user!._id.toString()) {
                 console.log(`User ${req.user!.name} is already president of ${name}. Returning existing society.`);
                 return sendResponse(res, 200, "Society already exists", existingSociety);
            } else {
                 return sendError(res, 400, "Society with this name already exists");
            }
        }

        // 1. Create Society
        const society = await Society.create({
            name,
            description,
            registration_fee: registration_fee || 0,
            custom_fields: custom_fields || [],
            content_sections: content_sections || [],
            created_by: req.user!._id,
            status: "ACTIVE"
        });

        const newSociety = society;

        // 2. Assign President Role
        await SocietyUserRole.create({
            name: req.user!.name, // Assuming user name is available in req.user, otherwise fetch user
            user_id: req.user!._id,
            society_id: newSociety._id,
            role: "PRESIDENT",
            assigned_by: req.user!._id
        });

        // 3. Create Teams (Groups)
        if (teams && Array.isArray(teams)) {
            // Deduplicate teams to prevent unique index violation
            const uniqueTeams = [...new Set(teams)];
            const teamDocs = uniqueTeams.map((teamName: string) => ({
                society_id: newSociety._id,
                name: teamName,
                created_by: req.user!._id
            }));
            await Group.create(teamDocs);
        }

        return sendResponse(res, 201, "Society created successfully", newSociety);

    } catch (error: any) {
        console.error("Error creating society:", error);
        return sendError(res, 500, "Internal server error while creating society", error);
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

        return sendResponse(res, 200, "Society requests fetched successfully", requests);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error while fetching society requests", error);
    }
};


export const updateSocietyRequestStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        if (!status || !["APPROVED", "REJECTED"].includes(status)) {
             return sendError(res, 400, "Status must be either 'APPROVED' or 'REJECTED'");
        }

        const societyRequest = await SocietyRequest.findById(id);
        if (!societyRequest) {
             return sendError(res, 404, "Society request not found");
        }

        if (societyRequest.status !== "PENDING") {
             return sendError(res, 400, "This request has already been processed");
        }

        if (status === "REJECTED") {
            if (!rejection_reason || typeof rejection_reason !== "string") {
                 return sendError(res, 400, "Rejection reason is required when rejecting a request");
            }
            societyRequest.status = "REJECTED";
            societyRequest.rejection_reason = rejection_reason;
            await societyRequest.save();

            return sendResponse(res, 200, "Society request rejected", societyRequest);
        }

        const existingSociety = await Society.findOne({ name: societyRequest.society_name });
        if (existingSociety) {
             return sendError(res, 400, "A society with this name already exists");
        }

        const newSociety = await Society.create({
            name: societyRequest.society_name,
            description: `Society created from approved request`,
            created_by: societyRequest.user_id
        });

        // Fetch user data to get the name
        const requestUser = await User.findById(societyRequest.user_id);

        console.log(`Creating President role for user ${societyRequest.user_id} in society ${newSociety._id}`);

        // Assign the requester as PRESIDENT of the new society
        const newRole = await SocietyUserRole.create({
            name: requestUser?.name || societyRequest.society_name,
            user_id: societyRequest.user_id,
            society_id: newSociety._id,
            role: "PRESIDENT",
            assigned_by: req.user!._id
        });

        console.log("Role created:", newRole);

        societyRequest.status = "APPROVED";
        await societyRequest.save();

        return sendResponse(res, 200, "Society request approved and society created", {
            request: societyRequest,
            society: newSociety
        });

    } catch (error: any) {
        return sendError(res, 500, "Internal server error while updating society request", error);
    }
};


export const getAllSocieties = async (req: AuthRequest, res: Response) => {
    try {
        const societies = await Society.find({ status: "ACTIVE" })
            .populate("created_by", "name email")
            .sort({ created_at: -1 });

        return sendResponse(res, 200, "Societies fetched successfully", societies);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error while fetching societies", error);
    }
};


export const getSocietyById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const society = await Society.findById(id)
            .populate("created_by", "name email");

        if (!society) {
             return sendError(res, 404, "Society not found");
        }

        // Fetch members of this society
        const members = await SocietyUserRole.find({ society_id: id })
            .populate("user_id", "name email")
            .populate("assigned_by", "name email");

        return sendResponse(res, 200, "Society fetched successfully", {
            society,
            members
        });

    } catch (error: any) {
        return sendError(res, 500, "Internal server error while fetching society", error);
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
             return sendError(res, 400, "user_id is required");
        }

        // Verify society exists and is active
        const society = await Society.findById(society_id);
        if (!society || society.status !== "ACTIVE") {
             return sendError(res, 404, "Active society not found");
        }

        // Verify user exists
        const user = await User.findById(user_id);
        if (!user) {
             return sendError(res, 404, "User not found");
        }

        // Check if user is already a member of this society
        const existingRole = await SocietyUserRole.findOne({ user_id, society_id });
        if (existingRole) {
             return sendError(res, 400, "User is already a member of this society");
        }

        const memberRole = await SocietyUserRole.create({
            name: name || user.name,
            user_id,
            society_id,
            role: role || "MEMBER",
            group_id: group_id || null,
            assigned_by: req.user!._id
        });

        return sendResponse(res, 201, "Member added to society successfully", memberRole);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error while adding member", error);
    }
};


export const updateMemberRole = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id, userId: user_id } = req.params;
        const { role, group_id } = req.body;

        if (!role) {
             return sendError(res, 400, "Role is required");
        }

        const validRoles = ["PRESIDENT", "LEAD", "CO-LEAD", "GENERAL SECRETARY", "MEMBER"];
        if (!validRoles.includes(role)) {
             return sendError(res, 400, `Invalid role. Must be one of: ${validRoles.join(", ")}`);
        }

        const memberRole = await SocietyUserRole.findOne({ user_id, society_id });
        if (!memberRole) {
             return sendError(res, 404, "Member not found in this society");
        }

        memberRole.role = role;
        if (group_id !== undefined) {
            memberRole.group_id = group_id;
        }
        memberRole.updated_at = new Date();
        await memberRole.save();

        return sendResponse(res, 200, "Member role updated successfully", memberRole);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error while updating member role", error);
    }
};



export const removeMember = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id, userId: user_id } = req.params;

        const memberRole = await SocietyUserRole.findOneAndDelete({ user_id, society_id });
        if (!memberRole) {
             return sendError(res, 404, "Member not found in this society");
        }

        return sendResponse(res, 200, "Member removed from society successfully");

    } catch (error: any) {
        return sendError(res, 500, "Internal server error while removing member", error);
    }
};

export const updateSociety = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const society = await Society.findById(id);
        if (!society) {
             return sendError(res, 404, "Society not found");
        }



        if (name) {
             const existing = await Society.findOne({ name, _id: { $ne: new mongoose.Types.ObjectId(id as string) } });
             if (existing) {
                 return sendError(res, 400, "Society name already taken");
             }
             society.name = name;
        }
        if (description) society.description = description;
        if (req.body.registration_fee !== undefined) society.registration_fee = req.body.registration_fee;
        if (req.body.custom_fields) society.custom_fields = req.body.custom_fields;
        if (req.body.content_sections) society.content_sections = req.body.content_sections;
        if (req.body.is_setup !== undefined) society.is_setup = req.body.is_setup;

        society.updated_at = new Date();
        await society.save();

        return sendResponse(res, 200, "Society updated successfully", society);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error", error);
    }
};

export const changePresident = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id: society_id } = req.params;
        const { new_president_id } = req.body;

        if (!new_president_id) {
             return sendError(res, 400, "New president ID is required");
        }

        const society = await Society.findById(society_id).session(session);
        if (!society) {
            await session.abortTransaction();
            return sendError(res, 404, "Society not found");
        }

        // Verify new president exists
        const newPresidentUser = await User.findById(new_president_id).session(session);
        if (!newPresidentUser) {
            await session.abortTransaction();
            return sendError(res, 404, "New president user not found");
        }

        // Check if new president is ALREADY a member
        let newPresidentRole = await SocietyUserRole.findOne({
            user_id: new_president_id,
            society_id
        }).session(session);

        // Find current president role
        const currentPresidentRole = await SocietyUserRole.findOne({
            society_id,
            role: "PRESIDENT"
        }).session(session);

        if (currentPresidentRole) {
            // Demote current president to MEMBER
            currentPresidentRole.role = "MEMBER";
            currentPresidentRole.updated_at = new Date();
            await currentPresidentRole.save({ session });
        }

        if (newPresidentRole) {
            // Update existing role to PRESIDENT
            newPresidentRole.role = "PRESIDENT";
            newPresidentRole.updated_at = new Date();
            await newPresidentRole.save({ session });
        } else {
            // Create new role
            await SocietyUserRole.create([{
                name: newPresidentUser.name,
                user_id: new_president_id,
                society_id,
                role: "PRESIDENT",
                assigned_by: req.user!._id,
                assigned_at: new Date()
            }], { session });
        }

        await session.commitTransaction();

        return sendResponse(res, 200, "President changed successfully");

    } catch (error: any) {
        await session.abortTransaction();
        return sendError(res, 500, "Internal server error", error);
    } finally {
        session.endSession();
    }
};

export const suspendSociety = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body; // Unused for now but kept for compatibility

        const society = await Society.findById(id);
        if (!society) return sendError(res, 404, "Society not found");

        if (society.status === "SUSPENDED") return sendError(res, 400, "Society is already suspended");

        society.status = "SUSPENDED";
        society.updated_at = new Date();
        await society.save();

        return sendResponse(res, 200, "Society suspended successfully", society);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error", error);
    }
};

export const reactivateSociety = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const society = await Society.findById(id);
        if (!society) return sendError(res, 404, "Society not found");

        if (society.status === "ACTIVE") return sendError(res, 400, "Society is already active");

        society.status = "ACTIVE";
        society.updated_at = new Date();
        await society.save();

        return sendResponse(res, 200, "Society reactivated successfully", society);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error", error);
    }
};

export const deleteSociety = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const society = await Society.findById(id).session(session);
        if (!society) {
            await session.abortTransaction();
            return sendError(res, 404, "Society not found");
        }

        society.status = "DELETED";
        society.updated_at = new Date();
        await society.save({ session });

        await session.commitTransaction();
        return sendResponse(res, 200, "Society deleted successfully");

    } catch (error: any) {
        await session.abortTransaction();
        return sendError(res, 500, "Internal server error", error);
    } finally {
        session.endSession();
    }
};
