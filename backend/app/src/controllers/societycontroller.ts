import { Response, NextFunction } from 'express';
import { catchAsync } from '../util/catchAsync';
import { AuthRequest } from '../middleware/authmiddleware';
import Group from '../models/Group';
import Society from '../models/Society';
import SocietyRequest from '../models/SocietyRequest';
import SocietyUserRole from '../models/SocietyUserRole';
import GroupMemberModel from '../models/GroupMember';
import User from '../models/User';
import { isPresident } from '../util/roleUtils';
import mongoose from 'mongoose';
import { sendResponse, sendError } from '../util/response';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { notifySocietyRequest, notifySocietyRequestStatus } from '../services/notificationService';
import { isFacultyEmail } from '../utils/isFacultyEmail';
import { compareSocietyWithExisting } from '../services/comparisonService';


export const createSocietyRequest = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !isFacultyEmail(req.user.email)) {
            return sendError(res, 403, "Only faculty members with a valid university email can request society registration");
        }



        const { society_name, description, request_type, form_data } = req.body;

        if (!society_name || typeof society_name !== "string") {
            return sendError(res, 400, "Society name is required");
        }

        const existingSociety = await Society.findOne({ name: society_name });
        if (existingSociety && request_type !== "RENEWAL") {
            return sendError(res, 400, "A society with this name already exists");
        }
        
        if (!existingSociety && request_type === "RENEWAL") {
            return sendError(res, 404, "Cannot renew a society that does not exist");
        }

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
            description,
            request_type: request_type || "REGISTER",
            form_data: form_data || {}
        });

        notifySocietyRequest(req.user!.name, society_name);

        return sendResponse(res, 201, "Society request submitted successfully", societyRequest);

});

export const createSociety = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {


        const { name, description, registration_fee, category } = req.body;

        let teams = req.body.teams;
        let custom_fields = req.body.custom_fields;
        let content_sections = req.body.content_sections;
        let why_join_us = req.body.why_join_us;
        let faqs = req.body.faqs;
        let contact_info = req.body.contact_info;
        let payment_info = req.body.payment_info;

        // Parse JSON strings if coming from FormData
        const safeParse = (data: any, label: string) => {
            if (typeof data === 'string') {
                try {
                    return JSON.parse(data);
                } catch {
                    return [];
                }
            }
            return data;
        };

        const safeParseObj = (data: any, label: string) => {
            if (typeof data === 'string') {
                try {
                    return JSON.parse(data);
                } catch {
                    return {};
                }
            }
            return data;
        };

        teams = safeParse(teams, 'teams');
        custom_fields = safeParse(custom_fields, 'custom_fields');
        content_sections = safeParse(content_sections, 'content_sections');
        why_join_us = safeParse(why_join_us, 'why_join_us');
        faqs = safeParse(faqs, 'faqs');
        contact_info = safeParseObj(contact_info, 'contact_info');
        payment_info = safeParseObj(payment_info, 'payment_info');

        if (!name) return sendError(res, 400, "Society name is required");

        const existingSociety = await Society.findOne({ name });
        if (existingSociety) {
            // Check for soft-deleted society or orphan (failed creation)
            const presidentRole = await SocietyUserRole.findOne({ society_id: existingSociety._id, role: 'PRESIDENT' });

            if (existingSociety.status === 'DELETED' || !presidentRole) {

                await Society.deleteOne({ _id: existingSociety._id });
                await Group.deleteMany({ society_id: existingSociety._id });
                await SocietyUserRole.deleteMany({ society_id: existingSociety._id });
            } else if (presidentRole.user_id.toString() === req.user!._id.toString()) {

                return sendResponse(res, 200, "Society already exists", existingSociety);
            } else {
                return sendError(res, 400, "Society with this name already exists");
            }
        }

        // Handle Image Upload
        let logoUrl = "";
        if (req.file) {
            const uploadResponse = await uploadOnCloudinary(req.file.path);
            if (uploadResponse) {
                logoUrl = uploadResponse.secure_url;
            }
        }

        let discounts = req.body.discounts;
        discounts = safeParse(discounts, 'discounts');

        // 1. Create Society
        const society = await Society.create({
            name,
            description,
            registration_fee: registration_fee || 0,
            category: category || "Others",
            custom_fields: custom_fields || [],
            content_sections: content_sections || [],
            why_join_us: why_join_us || [],
            faqs: faqs || [],
            contact_info: contact_info || {},
            payment_info: payment_info || undefined,
            discounts: discounts || [],
            logo: logoUrl || undefined,
            created_by: req.user!._id,
            status: "ACTIVE",
            registration_start_date: req.body.registration_start_date || undefined,
            registration_end_date: req.body.registration_end_date || undefined
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

});


export const getAllSocietyRequests = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { status } = req.query;

        const filter: any = {};
        if (status && ["APPROVED", "PENDING", "REJECTED"].includes(status as string)) {
            filter.status = status;
        }

        const requests = await SocietyRequest.find(filter)
            .populate("user_id", "name email")
            .sort({ created_at: -1 });

        return sendResponse(res, 200, "Society requests fetched successfully", requests);

});

export const getMySocietyRequests = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const requests = await SocietyRequest.find({ user_id: req.user?._id }).sort({ created_at: -1 });
        return sendResponse(res, 200, "My society requests fetched successfully", requests);
});

export const getPendingSocietyRequests = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const requests = await SocietyRequest.find({ status: "PENDING" })
            .populate("user_id", "name email")
            .sort({ created_at: -1 });

        return sendResponse(res, 200, "Pending society requests fetched successfully", requests);

});

export const getSocietyRequestForSociety = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const requestType = (req.query.type as string)?.toUpperCase() || "REGISTER";

        const society = await Society.findById(id);
        if (!society) return sendError(res, 404, "Society not found");
        
        // Find the most recent APPROVED request for this society
        const request = await SocietyRequest.findOne({ 
            society_name: society.name, 
            status: "APPROVED",
            request_type: requestType 
        }).sort({created_at: -1});

        if (!request) return sendError(res, 404, "Approved registration request not found for this society");
        
        return sendResponse(res, 200, "Society request fetched successfully", request);
});


export const updateSocietyRequestStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
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

            if (societyRequest.request_type === "RENEWAL") {
                await Society.findOneAndUpdate(
                    { name: societyRequest.society_name },
                    { $set: { renewal_approved: false, updated_at: new Date() } }
                );
            }

            notifySocietyRequestStatus(
                societyRequest.user_id.toString(),
                societyRequest.society_name,
                'REJECTED',
                rejection_reason
            );

            return sendResponse(res, 200, "Society request rejected", societyRequest);
        }

        if (societyRequest.request_type === "REGISTER") {
            const existingSociety = await Society.findOne({ name: societyRequest.society_name });
            if (existingSociety) {
                return sendError(res, 400, "A society with this name already exists");
            }

            const newSociety = await Society.create({
                name: societyRequest.society_name,
                description: `Society created from approved request`,
                created_by: societyRequest.user_id,
                renewal_approved: false
            });

            const requestUser = await User.findById(societyRequest.user_id);

            await SocietyUserRole.create({
                name: requestUser?.name || societyRequest.society_name,
                user_id: societyRequest.user_id,
                society_id: newSociety._id,
                role: "FACULTY ADVISOR",
                assigned_by: req.user!._id
            });
        }

        if (societyRequest.request_type === "RENEWAL") {
            await Society.findOneAndUpdate(
                { name: societyRequest.society_name },
                { $set: { renewal_approved: true, updated_at: new Date() } }
            );
        }

        societyRequest.status = "APPROVED";
        await societyRequest.save();

        notifySocietyRequestStatus(
            societyRequest.user_id.toString(),
            societyRequest.society_name,
            'APPROVED'
        );

        return sendResponse(res, 200, "Society request approved", {
            request: societyRequest,
            ...(societyRequest.request_type === "REGISTER" && { society: "Society Created" })
        });

});



export const getAllSocietiesAdmin = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
        const skip = (page - 1) * limit;

        const query = { status: { $ne: "DELETED" } };

        const [societies, total] = await Promise.all([
            Society.find(query)
                .select("name description category logo registration_fee created_by status renewal_approved")
                .populate("created_by", "name email phone")
                .populate("groups", "name")
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Society.countDocuments(query)
        ]);

        const societyIds = societies.map(s => s._id);
        const memberCounts = await SocietyUserRole.aggregate([
            { $match: { society_id: { $in: societyIds } } },
            { $group: { _id: "$society_id", count: { $sum: 1 } } }
        ]);

        const presidentRoles = await SocietyUserRole.find({
            society_id: { $in: societyIds },
            role: "PRESIDENT"
        }).populate("user_id", "name email phone").lean();

        const facultyAdvisorRoles = await SocietyUserRole.find({
            society_id: { $in: societyIds },
            role: "FACULTY ADVISOR"
        }).populate("user_id", "name email phone").lean();

        const countMap = new Map(memberCounts.map((mc: any) => [mc._id.toString(), mc.count]));
        const presidentMap = new Map(presidentRoles.map(pr => [pr.society_id.toString(), pr]));
        const advisorMap = new Map(facultyAdvisorRoles.map(fa => [fa.society_id.toString(), fa]));

        const societiesWithCounts = societies.map(society => {
            return {
                ...society,
                membersCount: countMap.get(society._id.toString()) ?? 0,
                president: presidentMap.get(society._id.toString())?.user_id ?? null,
                faculty_advisor: advisorMap.get(society._id.toString())?.user_id ?? null
            };
        });

        return sendResponse(res, 200, "Admin societies fetched successfully", {
            societies: societiesWithCounts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

});

export const getAllSocieties = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
        const skip = (page - 1) * limit;

        const query = { status: "ACTIVE", renewal_approved: true };

        const [societies, total] = await Promise.all([
            Society.find(query)
                .select("name description category logo registration_fee created_by status")
                .populate("created_by", "name email phone")
                .populate("groups", "name")
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Society.countDocuments(query)
        ]);

        const societyIds = societies.map(s => s._id);
        const memberCounts = await SocietyUserRole.aggregate([
            { $match: { society_id: { $in: societyIds } } },
            { $group: { _id: "$society_id", count: { $sum: 1 } } }
        ]);

        const countMap = new Map(memberCounts.map((mc: any) => [mc._id.toString(), mc.count]));

        const societiesWithCounts = societies.map(society => {
            return {
                ...society,
                membersCount: countMap.get(society._id.toString()) ?? 0
            };
        });

        return sendResponse(res, 200, "Societies fetched successfully", {
            societies: societiesWithCounts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

});

export const getFeaturedSocieties = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const query = { status: "ACTIVE", renewal_approved: true };

        const societies = await Society.find(query)
            .select("name description category logo registration_fee created_by status")
            .sort({ created_at: -1 })
            .limit(5)
            .lean();

        const societyIds = societies.map(s => s._id);
        const memberCounts = await SocietyUserRole.aggregate([
            { $match: { society_id: { $in: societyIds } } },
            { $group: { _id: "$society_id", count: { $sum: 1 } } }
        ]);

        const countMap = new Map(memberCounts.map((mc: any) => [mc._id.toString(), mc.count]));

        const societiesWithCounts = societies.map(society => ({
            ...society,
            membersCount: countMap.get(society._id.toString()) ?? 0
        }));

        return sendResponse(res, 200, "Featured societies fetched successfully", societiesWithCounts);
});

export const getMyManageableSocieties = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userRoles = await SocietyUserRole.find({
            user_id: req.user!._id,
            role: { $in: ["PRESIDENT", "FINANCE MANAGER", "EVENT MANAGER", "SPONSOR MANAGER", "FACULTY ADVISOR"] }
        });

        if (!userRoles.length) {
            return sendResponse(res, 200, "No manageable societies found", []);
        }

        const societyIds = userRoles.map(ur => ur.society_id as mongoose.Types.ObjectId);

        const societies = await Society.find({
            _id: { $in: societyIds },
            status: { $ne: "DELETED" }
        })
        .populate("created_by", "name email phone")
        .populate("groups", "name")
        .sort({ created_at: -1 });

        return sendResponse(res, 200, "Manageable societies fetched successfully", societies);

});



export const getSocietyById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const society = await Society.findById(id)
            .populate("created_by", "name email phone")
            .populate("groups", "name");

        if (!society || society.status === "DELETED") {
            return sendError(res, 404, "Society not found");
        }

        if (society.status === "SUSPENDED") {
            return sendError(res, 403, "This society has been temporarily suspended by the administrator.");
        }

        // Fetch members of this society
        const members = await SocietyUserRole.find({ society_id: id })
            .populate("user_id", "name email")
            .populate("assigned_by", "name email")
            .populate("group_id", "name");

        // Fetch actual group memberships for these users in this society
        const groupMemberships = await GroupMemberModel.find({ 
            society_id: id 
        }).populate("group_id", "name");

        // Map group info to members if missing in SocietyUserRole
        const membersWithGroups = members.map(member => {
            const memberObj = member.toObject();
            if (!memberObj.group_id) {
                const groupMembership = groupMemberships.find(
                    gm => gm.user_id.toString() === (member.user_id as any)._id.toString()
                );
                if (groupMembership) {
                    (memberObj as any).group_id = groupMembership.group_id;
                    // Also useful to know their group role
                    (memberObj as any).group_role = groupMembership.role;
                }
            }
            return memberObj;
        });

        return sendResponse(res, 200, "Society fetched successfully", {
            society,
            members: membersWithGroups
        });

});

export const getAllPlatformMembers = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
        const skip = (page - 1) * limit;

        const [members, total] = await Promise.all([
            SocietyUserRole.find()
                .populate('user_id', 'name email phone')
                .populate('society_id', 'name')
                .populate('group_id', 'name')
                .sort({ assigned_at: -1 })
                .skip(skip)
                .limit(limit),
            SocietyUserRole.countDocuments(),
        ]);

        return sendResponse(res, 200, 'All platform members fetched successfully', {
            members,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
});

// ─── Member Management Endpoints ─────────────────────────────────────────────

/**
 * GET /api/society/:id/members
 * Returns paginated list of society members with user details.
 * Query: ?page=1&limit=10&search=term
 */
export const getSocietyMembers = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id: society_id } = req.params;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
        const search = (req.query.search as string || '').trim();
        const skip = (page - 1) * limit;

        // Build the base query for this society
        const baseQuery: any = { society_id };

        // If searching, first find matching user IDs, then filter roles
        let userIdFilter: mongoose.Types.ObjectId[] | null = null;
        if (search) {
            const matchingUsers = await User.find(
                { $text: { $search: search } },
                { score: { $meta: 'textScore' } }
            ).select('_id').sort({ score: { $meta: 'textScore' } });
            userIdFilter = matchingUsers.map(u => u._id);
            baseQuery.user_id = { $in: userIdFilter };
        }

        const total = await SocietyUserRole.countDocuments(baseQuery);

        const members = await SocietyUserRole.find(baseQuery)
            .populate('user_id', 'name email phone')
            .sort({ assigned_at: -1 })
            .skip(skip)
            .limit(limit);

        return sendResponse(res, 200, 'Society members fetched successfully', {
            members,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        });
});

/**
 * POST /api/society/:id/members
 * Assigns a user to a society with a specific role.
 * Body: { user_id, role, name?, group_id? }
 */
export const addMember = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
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

});


export const updateMemberRole = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id: society_id, userId: user_id } = req.params;
        const { role, group_id } = req.body;

        if (!user_id || typeof user_id !== 'string' || !mongoose.Types.ObjectId.isValid(user_id)) {
             return sendError(res, 400, "Invalid user ID");
        }

        if (!role) {
            return sendError(res, 400, "Role is required");
        }

        const validRoles = ["PRESIDENT", "LEAD", "CO-LEAD", "SPONSOR MANAGER", "MEMBER", "FINANCE MANAGER", "EVENT MANAGER"];
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

});



export const removeMember = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id: society_id, userId: user_id } = req.params;

        const memberRole = await SocietyUserRole.findOneAndDelete({ user_id, society_id });
        if (!memberRole) {
            return sendError(res, 404, "Member not found in this society");
        }

        return sendResponse(res, 200, "Member removed from society successfully");

});

export const updateSociety = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { name, description } = req.body;

        let teams = req.body.teams;
        let custom_fields = req.body.custom_fields;
        let content_sections = req.body.content_sections;
        let why_join_us = req.body.why_join_us;
        let faqs = req.body.faqs;
        let contact_info = req.body.contact_info;
        let payment_info = req.body.payment_info;

        // Helper for parsing JSON from FormData
        const safeParse = (data: any, label: string) => {
            if (typeof data === 'string') {
                try {
                    return JSON.parse(data);
                } catch {
                    return [];
                    return [];
                }
            }
            return data;
        };

        const safeParseObj = (data: any, label: string) => {
            if (typeof data === 'string') {
                try {
                    return JSON.parse(data);
                } catch {
                    return {};
                    return {};
                }
            }
            return data;
        };

        teams = safeParse(teams, 'teams');
        custom_fields = safeParse(custom_fields, 'custom_fields');
        content_sections = safeParse(content_sections, 'content_sections');
        why_join_us = safeParse(why_join_us, 'why_join_us');
        faqs = safeParse(faqs, 'faqs');
        contact_info = safeParseObj(contact_info, 'contact_info');
        payment_info = safeParseObj(payment_info, 'payment_info');

        const society = await Society.findById(id);
        if (!society) {
            return sendError(res, 404, "Society not found");
        }

        // Handle Image Upload
        if (req.file) {
            const uploadResponse = await uploadOnCloudinary(req.file.path);
            if (uploadResponse) {
                society.logo = uploadResponse.secure_url;
            }
        }

        if (name) {
            const existing = await Society.findOne({ name, _id: { $ne: new mongoose.Types.ObjectId(id as string) } });
            if (existing) {
                return sendError(res, 400, "Society name already taken");
            }
            society.name = name;
        }
        if (description) society.description = description;
        if (req.body.registration_fee !== undefined) society.registration_fee = Number(req.body.registration_fee);
        if (req.body.category) society.category = req.body.category;
        if (custom_fields) society.custom_fields = custom_fields;
        if (content_sections) society.content_sections = content_sections;
        if (why_join_us) society.why_join_us = why_join_us;
        if (faqs) society.faqs = faqs;
        if (contact_info) society.contact_info = contact_info;
        if (payment_info) society.payment_info = payment_info;
        if (req.body.is_setup !== undefined) society.is_setup = req.body.is_setup === 'true' || req.body.is_setup === true;
        
        if (req.body.registration_start_date !== undefined) society.registration_start_date = req.body.registration_start_date;
        if (req.body.registration_end_date !== undefined) society.registration_end_date = req.body.registration_end_date;

        // Handle discounts
        let discounts = req.body.discounts;
        if (discounts !== undefined) {
            discounts = safeParse(discounts, 'discounts');
            society.discounts = discounts || [];
        }

        // Handle Team Sync
        if (teams && Array.isArray(teams)) {
            const newTeams = teams; // Array of strings
            const existingGroups = await Group.find({ society_id: id });
            const existingTeamNames = existingGroups.map(g => g.name);

            // Teams to delete (in DB but not in new list)
            const teamsToDelete = existingGroups.filter(g => !newTeams.includes(g.name));

            // Teams to add (in new list but not in DB)
            const teamsToAdd = newTeams.filter((t: string) => !existingTeamNames.includes(t));

            // Delete removed teams
            if (teamsToDelete.length > 0) {
                await Group.deleteMany({ _id: { $in: teamsToDelete.map(g => g._id) } });
            }

            // Create new teams
            if (teamsToAdd.length > 0) {
                const newGroupDocs = teamsToAdd.map((name: string) => ({
                    society_id: id,
                    name,
                    created_by: req.user!._id
                }));
                await Group.create(newGroupDocs);
            }
        }

        society.updated_at = new Date();
        await society.save();

        return sendResponse(res, 200, "Society updated successfully", society);

});

export const changePresident = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { new_president_id } = req.body;

        if (!new_president_id) {
            return sendError(res, 400, "New president ID is required");
        }

        const newPresident = await User.findById(new_president_id).session(session);
        if (!newPresident) {
            return sendError(res, 404, "New president user not found");
        }

        const society = await Society.findById(id).session(session);
        if (!society) {
            return sendError(res, 404, "Society not found");
        }

        const currentPresidentRole = await SocietyUserRole.findOne({
            society_id: id,
            role: "PRESIDENT"
        }).session(session);

        if (currentPresidentRole) {
            currentPresidentRole.role = "MEMBER";
            currentPresidentRole.updated_at = new Date();
            await currentPresidentRole.save({ session });
        }

        const newPresidentRole = await SocietyUserRole.findOne({
            society_id: id,
            user_id: new_president_id
        }).session(session);

        if (newPresidentRole) {
            newPresidentRole.role = "PRESIDENT";
            newPresidentRole.updated_at = new Date();
            await newPresidentRole.save({ session });
        } else {
            await SocietyUserRole.create([{
                name: newPresident.name,
                user_id: new_president_id,
                society_id: id,
                role: "PRESIDENT",
                assigned_by: req.user!._id
            }], { session });
        }

        await session.commitTransaction();
        return sendResponse(res, 200, "President changed successfully");

    } catch (error: any) {
        await session.abortTransaction();
        return next(error);
    } finally {
        session.endSession();
    }
};

export const changeFacultyAdvisor = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { new_advisor_id } = req.body;

        if (!new_advisor_id) {
            return sendError(res, 400, "New advisor ID is required");
        }

        const newAdvisor = await User.findById(new_advisor_id).session(session);
        if (!newAdvisor) {
            return sendError(res, 404, "New advisor user not found");
        }

        const society = await Society.findById(id).session(session);
        if (!society) {
            return sendError(res, 404, "Society not found");
        }

        const currentAdvisorRole = await SocietyUserRole.findOne({
            society_id: id,
            role: "FACULTY ADVISOR"
        }).session(session);

        if (currentAdvisorRole) {
            currentAdvisorRole.role = "MEMBER";
            currentAdvisorRole.updated_at = new Date();
            await currentAdvisorRole.save({ session });
        }

        const newAdvisorRole = await SocietyUserRole.findOne({
            society_id: id,
            user_id: new_advisor_id
        }).session(session);

        if (newAdvisorRole) {
            newAdvisorRole.role = "FACULTY ADVISOR";
            newAdvisorRole.updated_at = new Date();
            await newAdvisorRole.save({ session });
        } else {
            await SocietyUserRole.create([{
                name: newAdvisor.name,
                user_id: new_advisor_id,
                society_id: id,
                role: "FACULTY ADVISOR",
                assigned_by: req.user!._id
            }], { session });
        }

        await session.commitTransaction();
        return sendResponse(res, 200, "Faculty Advisor changed successfully");

    } catch (error: any) {
        await session.abortTransaction();
        return next(error);
    } finally {
        session.endSession();
    }
};

export const updatePresidentDetails = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { phone, name } = req.body;

        if (!phone) {
            return sendError(res, 400, "Phone number is required");
        }
        
        if (!name) {
            return sendError(res, 400, "President name is required");
        }

        const society = await Society.findById(id);
        if (!society) {
            return sendError(res, 404, "Society not found");
        }

        const presidentRole = await SocietyUserRole.findOne({
            society_id: id,
            role: "PRESIDENT"
        });

        if (!presidentRole) {
            return sendError(res, 404, "President not found for this society");
        }

        const president = await User.findById(presidentRole.user_id);
        if (!president) {
            return sendError(res, 404, "President user not found");
        }

        president.phone = phone;
        president.name = name;
        await president.save();
        
        presidentRole.name = name;
        presidentRole.updated_at = new Date();
        await presidentRole.save();

        return sendResponse(res, 200, "President details updated successfully");

});


export const suspendSociety = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const society = await Society.findById(id);
        if (!society) return sendError(res, 404, "Society not found");

        if (society.status === "SUSPENDED") return sendError(res, 400, "Society is already suspended");

        const updated = await Society.findByIdAndUpdate(
            id,
            { $set: { status: "SUSPENDED", updated_at: new Date() } },
            { returnDocument: 'after' }
        );

        return sendResponse(res, 200, "Society suspended successfully", updated);

});

export const reactivateSociety = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const society = await Society.findById(id);
        if (!society) return sendError(res, 404, "Society not found");

        if (society.status === "ACTIVE") return sendError(res, 400, "Society is already active");

        const updated = await Society.findByIdAndUpdate(
            id,
            { $set: { status: "ACTIVE", updated_at: new Date() } },
            { returnDocument: 'after' }
        );

        return sendResponse(res, 200, "Society reactivated successfully", updated);

});

export const deleteSociety = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        return next(error);
    } finally {
        session.endSession();
    }
};

export const askForRenewal = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        await SocietyRequest.deleteMany({ request_type: "RENEWAL" });
        await Society.updateMany(
            { status: { $ne: "DELETED" } },
            { $set: { renewal_approved: false, updated_at: new Date() } }
        );
        return sendResponse(res, 200, "Renewal cycle reset. All societies must re-submit renewal requests.");
});

export const createPresident = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id: society_id } = req.params;
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return sendError(res, 400, "Name, email, phone, and password are required");
        }

        const society = await Society.findById(society_id).session(session);
        if (!society) {
            await session.abortTransaction();
            return sendError(res, 404, "Society not found");
        }

        const existingPresident = await SocietyUserRole.findOne({ society_id, role: "PRESIDENT" }).session(session);
        if (existingPresident) {
            await session.abortTransaction();
            return sendError(res, 400, "This society already has a president. Use change president instead.");
        }

        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            return sendError(res, 400, "A user with this email already exists");
        }

        const newUser = new User({
            name,
            email,
            phone,
            password,
            status: "ACTIVE",
            email_verified: true,
            password_reset_required: true
        });
        await newUser.save({ session });

        await SocietyUserRole.create([{
            name,
            user_id: newUser._id,
            society_id,
            role: "PRESIDENT",
            assigned_by: req.user!._id
        }], { session });

        await session.commitTransaction();

        return sendResponse(res, 201, "President account created and linked to society successfully", {
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error: any) {
        await session.abortTransaction();
        return next(error);
    } finally {
        session.endSession();
    }
};


export const compareSocietyRequest = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const societyRequest = await SocietyRequest.findById(id);
        if (!societyRequest) {
            return sendError(res, 404, "Society request not found");
        }

        if (societyRequest.request_type !== "REGISTER") {
            return sendError(res, 400, "Comparison is only available for new registration requests");
        }

        const comparisonResult = await compareSocietyWithExisting(
            societyRequest.form_data,
            societyRequest.society_name,
            societyRequest.description
        );

        return sendResponse(res, 200, "Comparison report generated successfully", comparisonResult);
});
