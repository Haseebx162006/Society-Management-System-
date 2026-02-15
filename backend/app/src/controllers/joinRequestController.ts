import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import JoinForm from '../models/JoinForm';
import JoinRequest from '../models/JoinRequest';
import SocietyUserRole from '../models/SocietyUserRole';
import GroupMember from '../models/GroupMember';
import Group from '../models/Group';
import Society from '../models/Society';
import User from '../models/User';
import mongoose from 'mongoose';
import { sendResponse, sendError } from '../util/response';
import { validateResponses } from '../util/formValidator';
import { notifyNewJoinRequest, notifyRequestStatusChange } from '../services/notificationService';

// ─── Submit Join Request ─────────────────────────────────────────────────────

export const submitJoinRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { formId } = req.params;
        const { responses, selected_team } = req.body;

        // 1. Find the form
        const form = await JoinForm.findById(formId);
        if (!form || !form.is_active) {
            return sendError(res, 404, 'Form not found or no longer active');
        }

        // 2. Check if user is already a member of this society
        const existingRole = await SocietyUserRole.findOne({
            user_id: req.user!._id,
            society_id: form.society_id
        });
        if (existingRole) {
            return sendError(res, 400, 'You are already a member of this society');
        }

        // 3. Check for duplicate pending request
        const existingRequest = await JoinRequest.findOne({
            user_id: req.user!._id,
            society_id: form.society_id,
            status: 'PENDING'
        });
        if (existingRequest) {
            return sendError(res, 400, 'You already have a pending request for this society');
        }

        // 4. Validate responses against form fields
        const errors = validateResponses(form.fields, responses || []);
        if (errors.length > 0) {
            return sendError(res, 400, 'Validation failed', errors);
        }

        // 5. Validate selected_team if provided
        if (selected_team) {
            const team = await Group.findOne({
                _id: selected_team,
                society_id: form.society_id
            });
            if (!team) {
                return sendError(res, 400, 'Selected team does not belong to this society');
            }
        }

        // 6. Build denormalized response array
        const formattedResponses = (responses || []).map((r: any) => {
            const field = form.fields.find(f => f.label === r.field_label);
            return {
                field_label: r.field_label,
                field_type: field?.field_type || r.field_type,
                value: r.value
            };
        });

        // 7. Create the request
        const joinRequest = await JoinRequest.create({
            user_id: req.user!._id,
            society_id: form.society_id,
            form_id: form._id,
            selected_team: selected_team || null,
            responses: formattedResponses
        });

        // 8. Notify President (fire-and-forget)
        notifyNewJoinRequest(
            form.society_id.toString(),
            req.user!.name
        );

        return sendResponse(res, 201, 'Join request submitted successfully', joinRequest);

    } catch (error: any) {
        if (error.code === 11000) {
            return sendError(res, 400, 'You already have a pending request for this society');
        }
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get All Requests for a Society (President) ──────────────────────────────

export const getJoinRequestsForSociety = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;
        const { status } = req.query;

        const filter: any = { society_id };
        if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status as string)) {
            filter.status = status;
        }

        const requests = await JoinRequest.find(filter)
            .populate('user_id', 'name email phone')
            .populate('selected_team', 'name')
            .populate('form_id', 'title')
            .sort({ created_at: -1 });

        return sendResponse(res, 200, 'Join requests fetched successfully', requests);

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get Single Request Detail (President) ───────────────────────────────────

export const getJoinRequestById = async (req: AuthRequest, res: Response) => {
    try {
        const { requestId } = req.params;

        const joinRequest = await JoinRequest.findById(requestId)
            .populate('user_id', 'name email phone')
            .populate('selected_team', 'name description')
            .populate('form_id', 'title fields');

        if (!joinRequest) {
            return sendError(res, 404, 'Join request not found');
        }

        return sendResponse(res, 200, 'Join request fetched successfully', joinRequest);

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Approve or Reject (President) ───────────────────────────────────────────

export const updateJoinRequestStatus = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id: society_id, requestId } = req.params;
        const { status, rejection_reason, assign_team } = req.body;

        // 1. Validate input
        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 400, "Status must be 'APPROVED' or 'REJECTED'");
        }

        // 2. Find the request
        const joinRequest = await JoinRequest.findById(requestId).session(session);
        if (!joinRequest) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 404, 'Join request not found');
        }

        if (joinRequest.status !== 'PENDING') {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 400, 'This request has already been processed');
        }

        // ── REJECTED ─────────────────────────────────────────────────
        if (status === 'REJECTED') {
            joinRequest.status = 'REJECTED';
            joinRequest.rejection_reason = rejection_reason || undefined;
            joinRequest.reviewed_by = req.user!._id;
            joinRequest.reviewed_at = new Date();
            await joinRequest.save({ session });

            await session.commitTransaction();
            session.endSession();

            // Notify user (fire-and-forget)
            const society = await Society.findById(society_id);
            notifyRequestStatusChange(
                joinRequest.user_id.toString(),
                society?.name || 'Society',
                'REJECTED',
                rejection_reason
            );

            return sendResponse(res, 200, 'Join request rejected', joinRequest);
        }

        // ── APPROVED ─────────────────────────────────────────────────

        // 3. Add user as MEMBER to the society
        const user = await User.findById(joinRequest.user_id).session(session);

        await SocietyUserRole.create([{
            name: user?.name || 'Member',
            user_id: joinRequest.user_id,
            society_id,
            role: 'MEMBER',
            assigned_by: req.user!._id
        }], { session });

        // 4. Assign team — prefer President's override, fallback to user's selection
        const teamId = assign_team || joinRequest.selected_team;
        if (teamId) {
            const team = await Group.findOne({
                _id: teamId,
                society_id
            }).session(session);

            if (team) {
                await GroupMember.create([{
                    group_id: teamId,
                    user_id: joinRequest.user_id,
                    society_id
                }], { session });
            }
        }

        // 5. Update request status
        joinRequest.status = 'APPROVED';
        joinRequest.reviewed_by = req.user!._id;
        joinRequest.reviewed_at = new Date();
        await joinRequest.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Notify user (fire-and-forget)
        const society = await Society.findById(society_id);
        notifyRequestStatusChange(
            joinRequest.user_id.toString(),
            society?.name || 'Society',
            'APPROVED'
        );

        return sendResponse(res, 200, 'Join request approved', joinRequest);

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── User: View My Requests ──────────────────────────────────────────────────

export const getMyJoinRequests = async (req: AuthRequest, res: Response) => {
    try {
        const requests = await JoinRequest.find({ user_id: req.user!._id })
            .populate('society_id', 'name')
            .populate('form_id', 'title')
            .populate('selected_team', 'name')
            .sort({ created_at: -1 });

        return sendResponse(res, 200, 'Your join requests', requests);

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};
