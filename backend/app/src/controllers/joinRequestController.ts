import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import JoinForm from '../models/JoinForm';
import JoinRequest from '../models/JoinRequest';
import SocietyUserRole from '../models/SocietyUserRole';
import GroupMember from '../models/GroupMember';
import Group from '../models/Group';
import Society from '../models/Society';
import User from '../models/User';
import { sendResponse, sendError } from '../util/response';
import { validateResponses } from '../util/formValidator';
import { notifyNewJoinRequest, notifyRequestStatusChange } from '../services/notificationService';
import { uploadOnCloudinary } from '../utils/cloudinary';

// ─── Submit Join Request ─────────────────────────────────────────────────────

export const submitJoinRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { formId } = req.params;

        // When using multipart/form-data, responses arrives as a JSON string
        let responses: any[] = [];
        if (typeof req.body.responses === 'string') {
            try {
                responses = JSON.parse(req.body.responses);
            } catch {
                return sendError(res, 400, 'Invalid responses format');
            }
        } else {
            responses = req.body.responses || [];
        }

        const selected_team = req.body.selected_team;

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

        // 4. Upload files to Cloudinary for FILE-type fields
        const uploadedFiles = req.files as Express.Multer.File[] | undefined;
        console.log('[JoinRequest] Files received by multer:', uploadedFiles?.length || 0);
        if (uploadedFiles && uploadedFiles.length > 0) {
            for (const file of uploadedFiles) {
                const fieldLabel = file.fieldname;
                console.log(`[JoinRequest] Uploading file "${file.originalname}" for field "${fieldLabel}" from path: ${file.path}`);

                const uploadResult = await uploadOnCloudinary(file.path);

                if (uploadResult) {
                    console.log(`[JoinRequest] Cloudinary upload success: ${uploadResult.secure_url}`);
                    // Find the matching response and set the Cloudinary URL
                    const matchingResponse = responses.find(
                        (r: any) => r.field_label === fieldLabel
                    );
                    if (matchingResponse) {
                        matchingResponse.value = uploadResult.secure_url;
                    } else {
                        responses.push({
                            field_label: fieldLabel,
                            field_type: 'FILE',
                            value: uploadResult.secure_url
                        });
                    }
                } else {
                    console.error(`[JoinRequest] Cloudinary upload FAILED for file "${file.originalname}". Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars.`);
                    return sendError(res, 500, `File upload failed for "${fieldLabel}". Please try again.`);
                }
            }
        } else {
            // Check if there are FILE-type fields that should have had uploads
            const fileFields = form.fields.filter(f => f.field_type === 'FILE');
            const requiredFileFields = fileFields.filter(f => f.is_required);
            if (requiredFileFields.length > 0) {
                console.warn('[JoinRequest] Expected file uploads but none received. FILE fields:', requiredFileFields.map(f => f.label));
            }
        }

        // 5. Validate responses against form fields
        const errors = validateResponses(form.fields, responses);
        if (errors.length > 0) {
            return sendError(res, 400, 'Validation failed', errors);
        }

        // 6. Validate selected_team if provided
        if (selected_team) {
            const team = await Group.findOne({
                _id: selected_team,
                society_id: form.society_id
            });
            if (!team) {
                return sendError(res, 400, 'Selected team does not belong to this society');
            }
        }

        // 7. Build denormalized response array
        const formattedResponses = responses.map((r: any) => {
            const field = form.fields.find(f => f.label === r.field_label);
            return {
                field_label: r.field_label,
                field_type: field?.field_type || r.field_type,
                value: r.value
            };
        });

        // 8. Create the request
        const joinRequest = await JoinRequest.create({
            user_id: req.user!._id,
            society_id: form.society_id,
            form_id: form._id,
            selected_team: selected_team || null,
            responses: formattedResponses
        });

        // 9. Notify President (fire-and-forget)
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
    try {
        const { id: society_id, requestId } = req.params;
        const { status, rejection_reason, assign_team } = req.body;

        // 1. Validate input
        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            return sendError(res, 400, "Status must be 'APPROVED' or 'REJECTED'");
        }

        // 2. Find the request
        const joinRequest = await JoinRequest.findById(requestId);
        if (!joinRequest) {
            return sendError(res, 404, 'Join request not found');
        }

        if (joinRequest.status !== 'PENDING') {
            return sendError(res, 400, 'This request has already been processed');
        }

        // ── REJECTED ─────────────────────────────────────────────────
        if (status === 'REJECTED') {
            joinRequest.status = 'REJECTED';
            joinRequest.rejection_reason = rejection_reason || undefined;
            joinRequest.reviewed_by = req.user!._id;
            joinRequest.reviewed_at = new Date();
            await joinRequest.save();

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
        const user = await User.findById(joinRequest.user_id);

        await SocietyUserRole.create([{
            name: user?.name || 'Member',
            user_id: joinRequest.user_id,
            society_id,
            role: 'MEMBER',
            assigned_by: req.user!._id
        }]);

        // 4. Assign team — prefer President's override, fallback to user's selection
        const teamId = assign_team || joinRequest.selected_team;
        if (teamId) {
            const team = await Group.findOne({
                _id: teamId,
                society_id
            });

            if (team) {
                await GroupMember.create([{
                    group_id: teamId,
                    user_id: joinRequest.user_id,
                    society_id
                }]);
            }
        }

        // 5. Update request status
        joinRequest.status = 'APPROVED';
        joinRequest.reviewed_by = req.user!._id;
        joinRequest.reviewed_at = new Date();
        await joinRequest.save();

        // Notify user (fire-and-forget)
        const society = await Society.findById(society_id);
        notifyRequestStatusChange(
            joinRequest.user_id.toString(),
            society?.name || 'Society',
            'APPROVED'
        );

        return sendResponse(res, 200, 'Join request approved', joinRequest);

    } catch (error: any) {
        console.error('[JoinRequest] updateStatus error:', error);
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
