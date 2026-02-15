import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import JoinForm from '../models/JoinForm';
import Society from '../models/Society';
import Group from '../models/Group';
import { sendResponse, sendError } from '../util/response';

// ─── Create Form 

export const createJoinForm = async (req: AuthRequest, res: Response) => {
    try {
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

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get All Forms for a Society 

export const getJoinFormsBySociety = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;

        const forms = await JoinForm.find({ society_id })
            .sort({ created_at: -1 });

        return sendResponse(res, 200, 'Join forms fetched successfully', forms);

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get Single Form (President) 

export const getJoinFormById = async (req: AuthRequest, res: Response) => {
    try {
        const { formId } = req.params;

        const form = await JoinForm.findById(formId);
        if (!form) return sendError(res, 404, 'Form not found');

        return sendResponse(res, 200, 'Form fetched successfully', form);

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Update Form 

export const updateJoinForm = async (req: AuthRequest, res: Response) => {
    try {
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

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Delete (Deactivate) Form

export const deleteJoinForm = async (req: AuthRequest, res: Response) => {
    try {
        const { formId } = req.params;

        const form = await JoinForm.findById(formId);
        if (!form) return sendError(res, 404, 'Form not found');

        form.is_active = false;
        form.updated_at = new Date();
        await form.save();

        return sendResponse(res, 200, 'Form deactivated successfully');

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get Form for Filling (Public / User endpoint) 

export const getJoinFormPublic = async (req: AuthRequest, res: Response) => {
    try {
        const { formId } = req.params;

        const form = await JoinForm.findById(formId)
            .populate('society_id', 'name description');

        if (!form || !form.is_active) {
            return sendError(res, 404, 'Form not found or no longer active');
        }

        // If form is NOT public, require authentication
        if (!form.is_public && !req.user) {
            return sendError(res, 401, 'Authentication required to access this form');
        }

        // Also fetch available teams for the society so user can pick one
        const teams = await Group.find({ society_id: form.society_id })
            .select('name description')
            .sort({ name: 1 });

        return sendResponse(res, 200, 'Form fetched successfully', {
            form,
            teams
        });

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};
