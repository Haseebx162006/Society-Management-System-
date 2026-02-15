import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import SocietyUserRole from '../models/SocietyUserRole';
import SocietyRequest from '../models/SocietyRequest';
import User from '../models/User';
import { sendResponse, sendError } from '../util/response';

export const getMySocieties = async (req: AuthRequest, res: Response) => {
    try {
        const roles = await SocietyUserRole.find({ user_id: req.user!._id })
            .populate('society_id', 'name description status logo');
        
        return sendResponse(res, 200, "User societies fetched successfully", roles);
    } catch (error: any) {
        return sendError(res, 500, "Internal server error fetching societies", error);
    }
};

export const getMyRequests = async (req: AuthRequest, res: Response) => {
    try {
        const requests = await SocietyRequest.find({ user_id: req.user!._id })
            .sort({ created_at: -1 });

        return sendResponse(res, 200, "User requests fetched successfully", requests);
    } catch (error: any) {
        return sendError(res, 500, "Internal server error fetching requests", error);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findById(req.user!._id);

        if (!user) {
            return sendError(res, 404, "User not found");
        }

        if (name) user.name = name;
        if (phone) {
             // Basic phone validation could go here
             user.phone = phone;
        }

        await user.save();

        return sendResponse(res, 200, "Profile updated successfully", {
            id: user._id, // match frontend User interface
            name: user.name,
            email: user.email,
            phone: user.phone,
            is_super_admin: user.is_super_admin,
            status: user.status
        });
    } catch (error: any) {
        return sendError(res, 500, "Internal server error updating profile", error);
    }
};
