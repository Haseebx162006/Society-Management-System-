import { IUser } from '../models/User';
import SocietyUserRole from '../models/SocietyUserRole';
import mongoose from 'mongoose';

export const isPresident = async (userId: string | mongoose.Types.ObjectId, societyId: string | mongoose.Types.ObjectId): Promise<boolean> => {
    const role = await SocietyUserRole.findOne({
        user_id: userId,
        society_id: societyId,
        role: "PRESIDENT"
    });
    return !!role;
};
