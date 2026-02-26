import { sendEmail } from './emailService';
import User from '../models/User';
import Society from '../models/Society';
import SocietyUserRole from '../models/SocietyUserRole';
import { emailTemplates } from '../utils/emailTemplates';

/**
 * Notify the President that a new join request was submitted.
 * Fails silently — notifications should never block the main flow.
 */
export const notifyNewJoinRequest = async (
    societyId: string,
    applicantName: string
) => {
    try {
        const society = await Society.findById(societyId);
        const presidentRole = await SocietyUserRole.findOne({
            society_id: societyId,
            role: 'PRESIDENT'
        });
        if (!presidentRole || !society) return;

        const president = await User.findById(presidentRole.user_id);
        if (!president) return;

        await sendEmail(
            president.email,
            `New Join Request — ${society.name}`,
            `<p><strong>${applicantName}</strong> submitted a join request for <strong>${society.name}</strong>.</p>
             <p>Log in to review and approve/reject the request.</p>`
        );
    } catch (error) {
        console.error('Notification error (join request):', error);
    }
};

/**
 * Notify the user about their membership request status change.
 * Uses styled email templates.
 */
export const notifyRequestStatusChange = async (
    userId: string,
    societyName: string,
    status: 'APPROVED' | 'REJECTED',
    reason?: string
) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const subject = status === 'APPROVED'
            ? `🎉 Welcome to ${societyName}!`
            : `Join Request Update — ${societyName}`;

        const body = status === 'APPROVED'
            ? emailTemplates.membershipApproved(user.name, societyName)
            : emailTemplates.membershipRejected(user.name, societyName, reason);

        await sendEmail(user.email, subject, body);
    } catch (error) {
        console.error('Notification error (status change):', error);
    }
};

/**
 * Notify all super admins about a new society creation request.
 * Fails silently.
 */
export const notifySocietyRequest = async (
    userName: string,
    societyName: string
) => {
    try {
        const admins = await User.find({ is_super_admin: true });
        if (!admins || admins.length === 0) return;

        for (const admin of admins) {
            await sendEmail(
                admin.email,
                `New Society Request — ${societyName}`,
                emailTemplates.societyRequestNotification(admin.name, userName, societyName)
            );
        }
    } catch (error) {
        console.error('Notification error (society request):', error);
    }
};

/**
 * Notify the user about their society request being approved or rejected.
 * Fails silently.
 */
export const notifySocietyRequestStatus = async (
    userId: string,
    societyName: string,
    status: 'APPROVED' | 'REJECTED',
    reason?: string
) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const subject = status === 'APPROVED'
            ? `🎉 Society "${societyName}" Approved!`
            : `Society Request Update — ${societyName}`;

        const body = status === 'APPROVED'
            ? emailTemplates.societyRequestApproved(user.name, societyName)
            : emailTemplates.societyRequestRejected(user.name, societyName, reason || 'No reason provided');

        await sendEmail(user.email, subject, body);
    } catch (error) {
        console.error('Notification error (society request status):', error);
    }
};
