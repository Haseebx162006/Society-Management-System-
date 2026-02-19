import { Response, NextFunction } from 'express';
import { AuthRequest } from './authmiddleware';
import { sendError } from '../util/response';
import SocietyUserRole from '../models/SocietyUserRole';
import Group from '../models/Group';
import mongoose from 'mongoose';

/**
 * RBAC Middleware
 * @param allowedRoles List of roles allowed to access the route
 * @param context 'SOCIETY' | 'GROUP' - Defaults to 'SOCIETY'. 
 *                If 'GROUP', it attempts to resolve society_id from the group first.
 */
export const authorize = (allowedRoles: string[], context: 'SOCIETY' | 'GROUP' = 'SOCIETY') => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            // 1. Bypass for SuperAdmin
            if (req.user && req.user.is_super_admin) {
                return next();
            }

            if (!req.user) {
                return sendError(res, 401, "Not authorized");
            }

            let societyId: string | mongoose.Types.ObjectId | undefined;
            let groupId: string | mongoose.Types.ObjectId | undefined;

            // 2. Resolve Context IDs
            if (context === 'SOCIETY') {
                societyId = req.params.id || req.params.society_id || req.body.society_id;
                
                if (!societyId) {
                    return sendError(res, 400, "Society ID required for authorization");
                }
                
                if (!mongoose.Types.ObjectId.isValid(societyId)) {
                    return sendError(res, 400, "Invalid Society ID");
                }

            } else if (context === 'GROUP') {
                groupId = req.params.id || req.params.group_id || req.body.group_id;

                if (!groupId) {
                 return sendError(res, 400, "Group ID required for authorization");
                }

                if (!mongoose.Types.ObjectId.isValid(groupId)) {
                    return sendError(res, 400, "Invalid Group ID");
                }

                const group = await Group.findById(groupId);
                if (!group) {
                    return sendError(res, 404, "Group not found");
                }
                societyId = group.society_id as mongoose.Types.ObjectId;
            }

            // 3. Query User Role
            const query: any = {
                user_id: req.user._id,
                society_id: societyId
            };
             const userRoles = await SocietyUserRole.find(query);

            if (!userRoles || userRoles.length === 0) {
                 return sendError(res, 403, "Access denied. You are not a member of this society.");
            }

            // 4. Check Permissions
            const hasPermission = userRoles.some(userRole => {
                if (userRole.role === 'PRESIDENT') return true;

                if (context === 'SOCIETY') {
                     return allowedRoles.includes(userRole.role);
                } else {
                     if (!allowedRoles.includes(userRole.role)) return false;

                     if (['LEAD', 'CO-LEAD'].includes(userRole.role)) {
                         return userRole.group_id?.toString() === groupId?.toString();
                     }
                     
                     return true;
                }
            });

            if (!hasPermission) {
                return sendError(res, 403, `Access denied. Requires one of: ${allowedRoles.join(', ')}`);
            }

            return next();

        } catch (error: any) {
            console.error("Authorization Error:", error);
            return sendError(res, 500, "Authorization failed", error);
        }
    };
};
