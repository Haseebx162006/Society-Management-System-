import { catchAsync } from '../util/catchAsync';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import JoinForm from '../models/JoinForm';
import Society from '../models/Society';
import Group from '../models/Group';
import { sendResponse, sendError } from '../util/response';

// ─── Create Form 

export const createJoinForm = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id: society_id } = req.params;
        const { title, description, fields, is_public } = req.body;

        if (!title || !fields || !Array.isArray(fields) || fields.length === 0) {
            return sendError(res, 400, 'Title and at least one field are required');
        }

        // Verify society exists
        const society = await Society.findById(society_id);
        if (!society || society.status !== 'ACTIVE') {
            return sendError(res, 404, 'Active society not found');
        }

        // Add order to fields if not provided
        const orderedFields = fields.map((f: any, i: number) => ({
            ...f,
            order: f.order ?? i
        }));

        const form = await JoinForm.create({
            society_id,
            title,
            description,
            fields: orderedFields,
            is_public: is_public || false,
            created_by: req.user!._id
        });

        return sendResponse(res, 201, 'Join form created successfully', form);

});

// ─── Get All Forms for a Society 

export const getJoinFormsBySociety = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id: society_id } = req.params;

        const forms = await JoinForm.find({ society_id })
            .sort({ created_at: -1 });

        return sendResponse(res, 200, 'Join forms fetched successfully', forms);

});

// ─── Get Public Active Forms for a Society (anyone can access) ───────────────

export const getPublicJoinFormsBySociety = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id: society_id } = req.params;

        const forms = await JoinForm.find({
            society_id,
            is_active: true
        })
            .select('title description fields is_active is_public created_at')
            .sort({ created_at: -1 });

        return sendResponse(res, 200, 'Public join forms fetched successfully', forms);

});

// ─── Get Single Form (President) 

export const getJoinFormById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { formId } = req.params;

        const form = await JoinForm.findById(formId);
        if (!form) return sendError(res, 404, 'Form not found');

        return sendResponse(res, 200, 'Form fetched successfully', form);

});

// ─── Update Form 

export const updateJoinForm = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { formId } = req.params;
        const { title, description, fields, is_active, is_public } = req.body;

        const form = await JoinForm.findById(formId);
        if (!form) return sendError(res, 404, 'Form not found');

        if (title) form.title = title;
        if (description !== undefined) form.description = description;
        if (fields && Array.isArray(fields)) form.fields = fields;
        if (is_active !== undefined) form.is_active = is_active;
        if (is_public !== undefined) form.is_public = is_public;
        form.updated_at = new Date();

        await form.save();

        return sendResponse(res, 200, 'Form updated successfully', form);

});

// ─── Delete (Deactivate) Form

export const deleteJoinForm = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { formId } = req.params;

        const form = await JoinForm.findById(formId);
        if (!form) return sendError(res, 404, 'Form not found');

        form.is_active = false;
        form.updated_at = new Date();
        await form.save();

        return sendResponse(res, 200, 'Form deactivated successfully');

});

// ─── Get Form for Filling (Public / User endpoint) 

export const getJoinFormPublic = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { formId } = req.params;

        const form = await JoinForm.findById(formId)
            .populate('society_id', 'name description registration_fee payment_info discounts');

        if (!form || !form.is_active) {
            return sendError(res, 404, 'Form not found or no longer active');
        }

        // If form is NOT public, require authentication
        /* if (!form.is_public && !req.user) {
            return sendError(res, 401, 'Authentication required to access this form');
        } */

        // Also fetch available teams for the society so user can pick one
        const teams = await Group.find({ society_id: form.society_id })
            .select('name description')
            .sort({ name: 1 });

        return sendResponse(res, 200, 'Form fetched successfully', {
            form,
            teams
        });

});
