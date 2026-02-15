import { sendEmail } from './emailService';
import User from '../models/User';
import Society from '../models/Society';
import SocietyUserRole from '../models/SocietyUserRole';

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
 * Notify the user about their request status change.
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
            ? `Welcome to ${societyName}!`
            : `Join Request Update — ${societyName}`;

        const body = status === 'APPROVED'
            ? `<p>Your request to join <strong>${societyName}</strong> has been <strong>approved</strong>. Welcome aboard!</p>`
            : `<p>Your request to join <strong>${societyName}</strong> has been <strong>rejected</strong>.</p>
               ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}`;

        await sendEmail(user.email, subject, body);
    } catch (error) {
        console.error('Notification error (status change):', error);
    }
};
