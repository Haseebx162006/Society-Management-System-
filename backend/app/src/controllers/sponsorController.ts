import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import Sponsor from '../models/Sponsor';
import SocietyUserRole from '../models/SocietyUserRole';
import mongoose from 'mongoose';
import { sendResponse, sendError } from '../util/response';

const isPresidentOrSponsorManager = async (userId: string | mongoose.Types.ObjectId, societyId: string | mongoose.Types.ObjectId): Promise<boolean> => {
    const role = await SocietyUserRole.findOne({
        user_id: userId,
        society_id: societyId,
        role: { $in: ["PRESIDENT", "SPONSOR MANAGER"] }
    });
    return !!role;
};

export const createSponsor = async (req: AuthRequest, res: Response) => {
    try {
        const { society_id, name, description, contact, email, phone, active, logo_url, amount } = req.body;

        if (!society_id || !name || !contact || !email) {
            return sendError(res, 400, "Society ID, Name, Contact, and Email are required");
        }

        const presidentCheck = await isPresidentOrSponsorManager(req.user!._id, society_id);
        if (!presidentCheck) {
            return sendError(res, 403, "Only the President or Sponsor Manager can perform this action");
        }

        const sponsor = await Sponsor.create({
            society_id,
            name,
            description,
            contact,
            email,
            phone,
            active: active !== undefined ? active : true,
            logo_url,
            amount,
            created_by: req.user!._id
        });

        return sendResponse(res, 201, "Sponsor created successfully", sponsor);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error", error);
    }
};

export const updateSponsor = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, contact, email, phone, active, logo_url, amount } = req.body;

        const sponsor = await Sponsor.findById(id);
        if (!sponsor) {
            return sendError(res, 404, "Sponsor not found");
        }

        const presidentCheck = await isPresidentOrSponsorManager(req.user!._id, sponsor.society_id);
        if (!presidentCheck) {
            return sendError(res, 403, "Only the President or Sponsor Manager can perform this action");
        }

        if (name !== undefined) sponsor.name = name;
        if (description !== undefined) sponsor.description = description;
        if (contact !== undefined) sponsor.contact = contact;
        if (email !== undefined) sponsor.email = email;
        if (phone !== undefined) sponsor.phone = phone;
        if (active !== undefined) sponsor.active = active;
        if (logo_url !== undefined) sponsor.logo_url = logo_url;
        if (amount !== undefined) sponsor.amount = amount;
        sponsor.updated_at = new Date();

        await sponsor.save();

        return sendResponse(res, 200, "Sponsor updated successfully", sponsor);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error", error);
    }
};

export const deleteSponsor = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const sponsor = await Sponsor.findById(id);
        if (!sponsor) {
            return sendError(res, 404, "Sponsor not found");
        }

        const presidentCheck = await isPresidentOrSponsorManager(req.user!._id, sponsor.society_id);
        if (!presidentCheck) {
            return sendError(res, 403, "Only the President or Sponsor Manager can perform this action");
        }

        await Sponsor.findByIdAndDelete(id);

        return sendResponse(res, 200, "Sponsor deleted successfully");

    } catch (error: any) {
        return sendError(res, 500, "Internal server error", error);
    }
};

export const getSponsorsBySocietyId = async (req: AuthRequest, res: Response) => {
    try {
        const { society_id } = req.params;
        const societyIdStr = Array.isArray(society_id) ? society_id[0] : society_id;

        const presidentCheck = await isPresidentOrSponsorManager(req.user!._id, societyIdStr);
        if (!presidentCheck) {
            return sendError(res, 403, "Only the President or Sponsor Manager can perform this action");
        }

        const sponsors = await Sponsor.find({ society_id: societyIdStr }).sort({ created_at: -1 });

        return sendResponse(res, 200, "Sponsors fetched successfully", sponsors);

    } catch (error: any) {
        return sendError(res, 500, "Internal server error", error);
    }
};
