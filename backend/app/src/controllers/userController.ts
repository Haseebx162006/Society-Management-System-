import { Response, NextFunction } from 'express';
import { catchAsync } from '../util/catchAsync';
import { AuthRequest } from '../middleware/authmiddleware';
import SocietyUserRole from '../models/SocietyUserRole';
import SocietyRequest from '../models/SocietyRequest';
import User from '../models/User';
import { sendResponse, sendError } from '../util/response';
import { maskUserData, maskUsersData } from '../util/stringUtils';
import bcrypt from 'bcrypt';

export const getMySocieties = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const roles = await SocietyUserRole.find({ user_id: req.user!._id })
        .populate('society_id', 'name description status logo');
    
    return sendResponse(res, 200, "User societies fetched successfully", roles);
});

export const getMyRequests = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const requests = await SocietyRequest.find({ user_id: req.user!._id })
        .sort({ created_at: -1 });

    return sendResponse(res, 200, "User requests fetched successfully", requests);
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { name, phone } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user) {
        return sendError(res, 404, "User not found");
    }

    // FIX: Validate and trim input strings to prevent XSS and data bloat
    if (name) {
        const trimmed = name.trim();
        if (trimmed.length < 2 || trimmed.length > 100) {
            return sendError(res, 400, "Name must be between 2 and 100 characters");
        }
        user.name = trimmed;
    }
    
    if (phone) {
        const trimmed = phone.trim();
        if (trimmed.length < 5 || trimmed.length > 20) {
            return sendError(res, 400, "Phone must be between 5 and 20 characters");
        }
        user.phone = trimmed;
    }

    await user.save();

    return sendResponse(res, 200, "Profile updated successfully", {
        id: user._id,
        name: user.name,
        email: user.email,
        is_super_admin: user.is_super_admin,
        status: user.status
    });
});

export const getProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!._id);

    if (!user) {
        return sendError(res, 404, "User not found");
    }

    return sendResponse(res, 200, "User profile fetched successfully", {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        is_super_admin: user.is_super_admin,
        status: user.status
    });
});

export const changePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user) {
        return sendError(res, 404, "User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return sendError(res, 400, "Incorrect current password");
    }

    user.password = newPassword;
    user.password_reset_required = false;

    await user.save();

    return sendResponse(res, 200, "Password changed successfully");
});
export const getAllUsers = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const users = await User.find({ status: "ACTIVE" }).select("-password").sort({ name: 1 });
    // FIX: Mask sensitive user data before returning
    const maskedUsers = maskUsersData(users);
    return sendResponse(res, 200, "Users fetched successfully", maskedUsers);
});
