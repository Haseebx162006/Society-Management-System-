import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import Documentation from '../models/Documentation';
import Society from '../models/Society';
import { sendResponse, sendError } from '../util/response';
import { uploadOnCloudinary } from '../utils/cloudinary';

// ─── Upload Documentation ───────────────────────────────────────────────

export const uploadDocumentation = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;
        const { title, description } = req.body;

        if (!title) {
            return sendError(res, 400, 'Title is required');
        }

        const society = await Society.findById(society_id);
        if (!society || society.status !== 'ACTIVE') {
            return sendError(res, 404, 'Active society not found');
        }

        if (!req.file) {
            return sendError(res, 400, 'File is required');
        }

        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (!uploadResult) {
            return sendError(res, 500, 'Failed to upload file to Cloudinary');
        }

        const documentation = await Documentation.create({
            title,
            description,
            fileUrl: uploadResult.secure_url,
            societyId: society_id,
            uploadedBy: req.user!._id
        });

        return sendResponse(res, 201, 'Documentation uploaded successfully', documentation);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get Society Documentations ─────────────────────────────────────────

export const getSocietyDocumentations = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;

        // Optionally, check if the society exists, or rely on route middlewares

        const documentations = await Documentation.find({ societyId: society_id })
            .populate('uploadedBy', 'name email')
            .sort({ uploadedAt: -1 });

        return sendResponse(res, 200, 'Documentations fetched successfully', documentations);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Delete Documentation ───────────────────────────────────────────────

export const deleteDocumentation = async (req: AuthRequest, res: Response) => {
    try {
        const { docId } = req.params;

        const documentation = await Documentation.findByIdAndDelete(docId);
        
        if (!documentation) {
            return sendError(res, 404, 'Documentation not found');
        }

        // We could also delete the file from Cloudinary here if desired, 
        // but for now just removing from DB.

        return sendResponse(res, 200, 'Documentation deleted successfully');
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};
