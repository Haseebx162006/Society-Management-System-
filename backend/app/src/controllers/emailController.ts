import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import Group from '../models/Group';
import GroupMember from '../models/GroupMember';
import SocietyUserRole from '../models/SocietyUserRole';
import User from '../models/User';
import Society from '../models/Society';
import mongoose from 'mongoose';
import { sendResponse, sendError } from '../util/response';
import { sendBulkSESEmail } from '../services/sesEmailService';
import { bulkEmailTemplate } from '../utils/emailTemplates';

/**
 * Send email to society members
 * Can target: all members, specific groups, or multiple groups
 * Allowed roles: PRESIDENT, GENERAL SECRETARY, EVENT MANAGER, LEAD, CO-LEAD
 */
export const sendBulkEmail = async (req: AuthRequest, res: Response) => {
    try {
        const societyId = req.params.society_id as string;
        const { subject, message, targetType, groupIds } = req.body;

        // Validate required fields
        if (!subject || !message) {
            return sendError(res, 400, "Subject and message are required");
        }

        if (!societyId || !mongoose.Types.ObjectId.isValid(societyId)) {
            return sendError(res, 400, "Valid Society ID is required");
        }

        // Validate targetType
        if (!targetType || !['all', 'groups'].includes(targetType)) {
            return sendError(res, 400, "targetType must be 'all' or 'groups'");
        }

        if (targetType === 'groups' && (!groupIds || !Array.isArray(groupIds) || groupIds.length === 0)) {
            return sendError(res, 400, "At least one group must be selected when targeting groups");
        }

        // Get society details for the email template
        const society = await Society.findById(societyId);
        if (!society) {
            return sendError(res, 404, "Society not found");
        }

        // Get sender details
        const senderRole = await SocietyUserRole.findOne({
            user_id: req.user!._id,
            society_id: societyId,
        });

        const senderName = req.user!.name;
        const senderRoleTitle = senderRole?.role || 'Member';

        let recipientEmails: string[] = [];

        if (targetType === 'all') {
            // Get all members of the society
            const allRoles = await SocietyUserRole.find({ society_id: societyId })
                .populate('user_id', 'email name status');

            recipientEmails = allRoles
                .filter((r: any) => r.user_id && r.user_id.email && r.user_id.status === 'ACTIVE')
                .map((r: any) => r.user_id.email);
        } else {
            // Get members from specific groups
            const groupMembers = await GroupMember.find({
                group_id: { $in: groupIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
                society_id: new mongoose.Types.ObjectId(societyId),
            }).populate('user_id', 'email name status');

            recipientEmails = groupMembers
                .filter((m: any) => m.user_id && m.user_id.email && m.user_id.status === 'ACTIVE')
                .map((m: any) => m.user_id.email);
        }

        // Remove duplicates
        recipientEmails = [...new Set(recipientEmails)];

        if (recipientEmails.length === 0) {
            return sendError(res, 400, "No active members found in the selected target");
        }

        // Get group names for context
        let targetLabel = 'All Members';
        if (targetType === 'groups' && groupIds) {
            const groups = await Group.find({ _id: { $in: groupIds } });
            targetLabel = groups.map(g => g.name).join(', ');
        }

        // Build the email HTML
        const htmlBody = bulkEmailTemplate(
            society.name,
            subject,
            message,
            senderName,
            senderRoleTitle,
            targetLabel
        );

        // Send emails via AWS SES
        await sendBulkSESEmail(recipientEmails, subject, htmlBody);

        return sendResponse(res, 200, `Email sent successfully to ${recipientEmails.length} member(s)`, {
            recipientCount: recipientEmails.length,
            target: targetLabel,
        });

    } catch (error: any) {
        console.error('Bulk email error:', error);
        return sendError(res, 500, "Failed to send email", error);
    }
};

/**
 * Get available groups for email targeting (used in frontend dropdown)
 */
export const getEmailTargets = async (req: AuthRequest, res: Response) => {
    try {
        const societyId = req.params.society_id as string;

        if (!societyId || !mongoose.Types.ObjectId.isValid(societyId)) {
            return sendError(res, 400, "Valid Society ID is required");
        }

        // Get all groups in the society
        const groups = await Group.find({ society_id: societyId });

        // Get member counts per group
        const groupsWithCounts = await Promise.all(
            groups.map(async (group) => {
                const memberCount = await GroupMember.countDocuments({ group_id: group._id });
                return {
                    _id: group._id,
                    name: group.name,
                    memberCount,
                };
            })
        );

        // Get total society member count
        const totalMembers = await SocietyUserRole.countDocuments({ society_id: societyId });

        return sendResponse(res, 200, "Email targets fetched", {
            totalMembers,
            groups: groupsWithCounts,
        });
    } catch (error: any) {
        return sendError(res, 500, "Failed to fetch email targets", error);
    }
};
