import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import PreviousMember from '../models/PreviousMember';
import User from '../models/User';
import { sendResponse, sendError } from '../util/response';
import * as XLSX from 'xlsx';
import fs from 'fs';

// ─── Upload Excel of Previous Member Emails ──────────────────────────────────
// President uploads an .xlsx/.xls file. The first column should contain emails.

export const uploadPreviousMembers = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;
        const file = req.file;

        if (!file) {
            return sendError(res, 400, 'Please upload an Excel file');
        }

        // 1. Read the Excel file
        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // 2. Scan ALL rows and ALL columns for email addresses
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailSet = new Set<string>();

        for (const row of rows) {
            if (!Array.isArray(row)) continue;
            for (const cell of row) {
                if (cell && typeof cell === 'string' && emailRegex.test(cell.trim())) {
                    emailSet.add(cell.trim().toLowerCase());
                }
            }
        }

        const emails = Array.from(emailSet);

        if (emails.length === 0) {
            fs.unlinkSync(file.path);
            return sendError(res, 400, 'No valid emails found in the Excel file.');
        }

        // 3. Check which emails have registered accounts
        const existingUsers = await User.find(
            { email: { $in: emails } },
            { email: 1 }
        );
        const registeredEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));

        // 4. Build documents with has_account flag
        const docs = emails.map(email => ({
            society_id,
            email,
            has_account: registeredEmails.has(email),
            uploaded_by: req.user!._id
        }));

        // insertMany with ordered:false continues past duplicates
        const result = await PreviousMember.insertMany(docs, { ordered: false }).catch(err => {
            if (err.code === 11000 && err.insertedDocs) {
                return err.insertedDocs;
            }
            if (err.code === 11000) {
                return [];
            }
            throw err;
        });

        // 5. Clean up uploaded file
        fs.unlinkSync(file.path);

        const insertedCount = Array.isArray(result) ? result.length : 0;
        const withAccount = emails.filter(e => registeredEmails.has(e));
        const withoutAccount = emails.filter(e => !registeredEmails.has(e));

        return sendResponse(res, 201, `${insertedCount} email(s) added. ${withAccount.length} have accounts, ${withoutAccount.length} do not.`, {
            total_in_file: emails.length,
            newly_added: insertedCount,
            duplicates_skipped: emails.length - insertedCount,
            with_account: withAccount.length,
            without_account: withoutAccount.length,
            unregistered_emails: withoutAccount
        });

    } catch (error: any) {
        return sendError(res, 500, 'Failed to process Excel file', error);
    }
};

// ─── Get All Previous Member Emails for a Society ────────────────────────────

export const getPreviousMembers = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;

        const members = await PreviousMember.find({ society_id })
            .select('email has_account created_at')
            .sort({ created_at: -1 });

        // Re-check account status for all emails (users may have signed up since upload)
        const emails = members.map(m => m.email);
        const existingUsers = await User.find(
            { email: { $in: emails } },
            { email: 1 }
        );
        const registeredEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));

        // Update any stale has_account flags in the background
        const bulkOps = members
            .filter(m => m.has_account !== registeredEmails.has(m.email))
            .map(m => ({
                updateOne: {
                    filter: { _id: m._id },
                    update: { has_account: registeredEmails.has(m.email) }
                }
            }));
        if (bulkOps.length > 0) {
            await PreviousMember.bulkWrite(bulkOps);
        }

        // Return fresh data
        const result = members.map(m => ({
            _id: m._id,
            email: m.email,
            has_account: registeredEmails.has(m.email),
            created_at: m.created_at
        }));

        return sendResponse(res, 200, 'Previous members fetched', result);

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Delete a Single Previous Member Email ───────────────────────────────────

export const deletePreviousMember = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id, memberId } = req.params;

        const deleted = await PreviousMember.findOneAndDelete({
            _id: memberId,
            society_id
        });

        if (!deleted) {
            return sendError(res, 404, 'Previous member not found');
        }

        return sendResponse(res, 200, 'Previous member email removed', deleted);

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Clear All Previous Members for a Society ────────────────────────────────

export const clearPreviousMembers = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;

        const result = await PreviousMember.deleteMany({ society_id });

        return sendResponse(res, 200, `${result.deletedCount} previous member(s) removed`);

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Export Unregistered Emails as Excel ─────────────────────────────────────

export const exportUnregisteredMembers = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;

        // Get all previous members without accounts
        const members = await PreviousMember.find({ society_id }).select('email');
        const emails = members.map(m => m.email);

        // Re-check against User collection for fresh status
        const existingUsers = await User.find(
            { email: { $in: emails } },
            { email: 1 }
        );
        const registeredEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));

        const unregistered = emails.filter(e => !registeredEmails.has(e));

        if (unregistered.length === 0) {
            return sendError(res, 404, 'All previous members have registered accounts');
        }

        // Build Excel
        const data = [['Email'], ...unregistered.map(e => [e])];
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Unregistered Members');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=unregistered_members.xlsx');
        return res.send(buffer);

    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};
