import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import EventForm from '../models/EventForm';
import Society from '../models/Society';
import { sendResponse, sendError } from '../util/response';

// ─── Create Event Form ──────────────────────────────────────────────────────

export const createEventForm = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;
        const { title, description, fields } = req.body;

        if (!title || !fields || !Array.isArray(fields) || fields.length === 0) {
            return sendError(res, 400, 'Title and at least one field are required');
        }

        const society = await Society.findById(society_id);
        if (!society || society.status !== 'ACTIVE') {
            return sendError(res, 404, 'Active society not found');
        }

        const orderedFields = fields.map((f: any, i: number) => ({
            ...f,
            order: f.order ?? i
        }));

        const form = await EventForm.create({
            society_id,
            title,
            description,
            fields: orderedFields,
            created_by: req.user!._id
        });

        return sendResponse(res, 201, 'Event form created successfully', form);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get All Event Forms for a Society ───────────────────────────────────────

export const getEventFormsBySociety = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;

        const forms = await EventForm.find({ society_id })
            .sort({ created_at: -1 });

        return sendResponse(res, 200, 'Event forms fetched successfully', forms);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get Single Event Form ──────────────────────────────────────────────────

export const getEventFormById = async (req: AuthRequest, res: Response) => {
    try {
        const { formId } = req.params;

        const form = await EventForm.findById(formId);
        if (!form) return sendError(res, 404, 'Event form not found');

        return sendResponse(res, 200, 'Event form fetched successfully', form);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Update Event Form ──────────────────────────────────────────────────────

export const updateEventForm = async (req: AuthRequest, res: Response) => {
    try {
        const { formId } = req.params;
        const { title, description, fields, is_active } = req.body;

        const form = await EventForm.findById(formId);
        if (!form) return sendError(res, 404, 'Event form not found');

        if (title) form.title = title;
        if (description !== undefined) form.description = description;
        if (fields && Array.isArray(fields)) form.fields = fields;
        if (is_active !== undefined) form.is_active = is_active;
        form.updated_at = new Date();

        await form.save();

        return sendResponse(res, 200, 'Event form updated successfully', form);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Delete (Deactivate) Event Form ─────────────────────────────────────────

export const deleteEventForm = async (req: AuthRequest, res: Response) => {
    try {
        const { formId } = req.params;

        const form = await EventForm.findById(formId);
        if (!form) return sendError(res, 404, 'Event form not found');

        form.is_active = false;
        form.updated_at = new Date();
        await form.save();

        return sendResponse(res, 200, 'Event form deactivated successfully');
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};
