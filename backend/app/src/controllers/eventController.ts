import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import Event from '../models/Event';
import EventForm from '../models/EventForm';
import EventRegistration from '../models/EventRegistration';
import Society from '../models/Society';
import User from '../models/User';
import { sendResponse, sendError } from '../util/response';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { sendEmail } from '../services/emailService';
import { emailTemplates } from '../utils/emailTemplates';
import SocietyUserRole from '../models/SocietyUserRole';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

// ─── Create Event ───────────────────────────────────────────────────────────

export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;
        const {
            title, description, event_date, event_end_date,
            venue, event_type, max_participants,
            registration_start_date, registration_deadline,
            registration_form, content_sections, tags, is_public, status
        } = req.body;

        if (!title || !description || !event_date || !venue) {
            return sendError(res, 400, 'Title, description, event date and venue are required');
        }

        const society = await Society.findById(society_id);
        if (!society || society.status !== 'ACTIVE') {
            return sendError(res, 404, 'Active society not found');
        }

        // If a registration form is referenced, verify it exists
        if (registration_form) {
            const form = await EventForm.findById(registration_form);
            if (!form) {
                return sendError(res, 404, 'Registration form not found');
            }
        }

        let bannerUrl: string | undefined;
        if (req.file) {
            const result = await uploadOnCloudinary(req.file.path);
            if (result) bannerUrl = result.secure_url;
        }

        // Parse content_sections and tags if they come as strings (from FormData)
        let parsedContentSections = content_sections;
        if (typeof content_sections === 'string') {
            try { parsedContentSections = JSON.parse(content_sections); } catch { parsedContentSections = []; }
        }
        let parsedTags = tags;
        if (typeof tags === 'string') {
            try { parsedTags = JSON.parse(tags); } catch { parsedTags = []; }
        }

        const event = await Event.create({
            society_id,
            title,
            description,
            event_date,
            event_end_date,
            venue,
            event_type: event_type || 'OTHER',
            banner: bannerUrl,
            max_participants: max_participants ? Number(max_participants) : undefined,
            registration_start_date,
            registration_deadline,
            registration_form: registration_form || undefined,
            content_sections: parsedContentSections || [],
            tags: parsedTags || [],
            is_public: is_public !== undefined ? is_public : true,
            status: status || 'DRAFT',
            created_by: req.user!._id
        });

        return sendResponse(res, 201, 'Event created successfully', event);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get All Events for a Society ───────────────────────────────────────────

export const getEventsBySociety = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;

        const events = await Event.find({ society_id })
            .populate('registration_form', 'title fields')
            .sort({ event_date: -1 });

        return sendResponse(res, 200, 'Events fetched successfully', events);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get All Public Events (Across All Societies) ──────────────────────────

export const getAllPublicEvents = async (req: AuthRequest, res: Response) => {
    try {
        const { search, type, society, page = '1', limit = '12' } = req.query;

        const query: any = {
            is_public: true,
            status: { $in: ['PUBLISHED', 'ONGOING'] }
        };

        if (type && type !== 'All') {
            query.event_type = type;
        }

        if (society) {
            query.society_id = society;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { venue: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search as string, 'i')] } }
            ];
        }

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        const [events, total] = await Promise.all([
            Event.find(query)
                .populate('society_id', 'name description logo category')
                .populate('registration_form', 'title fields description')
                .sort({ event_date: 1 })
                .skip(skip)
                .limit(limitNum),
            Event.countDocuments(query)
        ]);

        return sendResponse(res, 200, 'Public events fetched successfully', {
            events,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get Public Events for a Society ────────────────────────────────────────

export const getPublicEventsBySociety = async (req: AuthRequest, res: Response) => {
    try {
        const { id: society_id } = req.params;

        const events = await Event.find({
            society_id,
            is_public: true,
            status: { $in: ['PUBLISHED', 'ONGOING'] }
        })
            .populate('registration_form', 'title fields description')
            .sort({ event_date: -1 });

        return sendResponse(res, 200, 'Public events fetched successfully', events);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get Single Event ───────────────────────────────────────────────────────

export const getEventById = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId)
            .populate('registration_form')
            .populate('society_id', 'name description logo');

        if (!event) return sendError(res, 404, 'Event not found');

        return sendResponse(res, 200, 'Event fetched successfully', event);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Update Event ───────────────────────────────────────────────────────────

export const updateEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;
        const {
            title, description, event_date, event_end_date,
            venue, event_type, max_participants,
            registration_start_date, registration_deadline,
            registration_form, content_sections, tags, is_public, status
        } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return sendError(res, 404, 'Event not found');

        if (title) event.title = title;
        if (description) event.description = description;
        if (event_date) event.event_date = event_date;
        if (event_end_date !== undefined) event.event_end_date = event_end_date;
        if (venue) event.venue = venue;
        if (event_type) event.event_type = event_type;
        if (max_participants !== undefined) event.max_participants = max_participants ? Number(max_participants) : undefined;
        if (registration_start_date !== undefined) event.registration_start_date = registration_start_date;
        if (registration_deadline !== undefined) event.registration_deadline = registration_deadline;
        if (registration_form !== undefined) event.registration_form = registration_form || undefined;
        if (is_public !== undefined) event.is_public = is_public;
        if (status) event.status = status;

        // Handle content_sections
        if (content_sections !== undefined) {
            let parsed = content_sections;
            if (typeof content_sections === 'string') {
                try { parsed = JSON.parse(content_sections); } catch { parsed = []; }
            }
            event.content_sections = parsed;
        }
        // Handle tags
        if (tags !== undefined) {
            let parsed = tags;
            if (typeof tags === 'string') {
                try { parsed = JSON.parse(tags); } catch { parsed = []; }
            }
            event.tags = parsed;
        }

        // Handle banner upload
        if (req.file) {
            const result = await uploadOnCloudinary(req.file.path);
            if (result) event.banner = result.secure_url;
        }

        event.updated_at = new Date();
        await event.save();

        return sendResponse(res, 200, 'Event updated successfully', event);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Delete Event ───────────────────────────────────────────────────────────

export const deleteEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) return sendError(res, 404, 'Event not found');

        event.status = 'CANCELLED';
        event.updated_at = new Date();
        await event.save();

        return sendResponse(res, 200, 'Event cancelled successfully');
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Submit Event Registration ──────────────────────────────────────────────

export const submitEventRegistration = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;
        const { form_id, responses } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return sendError(res, 404, 'Event not found');

        if (!['PUBLISHED', 'ONGOING'].includes(event.status)) {
            return sendError(res, 400, 'Event is not currently accepting registrations');
        }

        // Check if event is private and user is a member
        if (!event.is_public) {
            const isMember = await SocietyUserRole.findOne({
                society_id: event.society_id,
                user_id: req.user!._id
            });

            if (!isMember) {
                return sendError(res, 403, 'This event is private. Only society members can register.');
            }
        }

        // Check registration deadline
        if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
            return sendError(res, 400, 'Registration deadline has passed');
        }

        // Check max participants
        if (event.max_participants) {
            const currentCount = await EventRegistration.countDocuments({
                event_id: eventId,
                status: { $in: ['PENDING', 'APPROVED'] }
            });
            if (currentCount >= event.max_participants) {
                return sendError(res, 400, 'Maximum participant limit reached');
            }
        }

        // Check for duplicate registration
        const existing = await EventRegistration.findOne({
            event_id: eventId,
            user_id: req.user!._id,
            status: { $in: ['PENDING', 'APPROVED'] }
        });
        if (existing) {
            return sendError(res, 400, 'You have already registered for this event');
        }

        // Parse responses (may come as string from FormData)
        let parsedResponses = responses;
        if (typeof responses === 'string') {
            try { parsedResponses = JSON.parse(responses); } catch { parsedResponses = []; }
        }

        // Handle file uploads
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const result = await uploadOnCloudinary(file.path);
                if (result) {
                    const fieldName = file.fieldname;
                    const responseIndex = parsedResponses.findIndex(
                        (r: any) => r.field_label === fieldName
                    );
                    if (responseIndex >= 0) {
                        parsedResponses[responseIndex].value = result.secure_url;
                    } else {
                        parsedResponses.push({
                            field_label: fieldName,
                            field_type: 'FILE',
                            value: result.secure_url
                        });
                    }
                }
            }
        }

        const registration = await EventRegistration.create({
            event_id: eventId,
            user_id: req.user!._id,
            form_id: form_id || event.registration_form,
            responses: parsedResponses
        });

        return sendResponse(res, 201, 'Event registration submitted successfully', registration);
    } catch (error: any) {
        if (error.code === 11000) {
            return sendError(res, 400, 'You have already registered for this event');
        }
        return sendError(res, 500, 'Internal server error', error);
    }
};

export const getMyRegistration = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;
        const registration = await EventRegistration.findOne({
            event_id: eventId,
            user_id: req.user!._id
        }).populate('form_id', 'title fields');

        if (!registration) {
            return sendResponse(res, 200, 'Not registered', null);
        }

        return sendResponse(res, 200, 'My registration fetched successfully', registration);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Get Registrations for an Event (President) ─────────────────────────────

export const getEventRegistrations = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;
        const { status } = req.query;

        const query: any = { event_id: eventId };
        if (status) query.status = status;

        const registrations = await EventRegistration.find(query)
            .populate('user_id', 'name email phone')
            .populate('form_id', 'title fields')
            .sort({ created_at: -1 });

        return sendResponse(res, 200, 'Event registrations fetched successfully', registrations);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Update Registration Status (Approve/Reject) ───────────────────────────

export const updateRegistrationStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { registrationId } = req.params;
        const { status, rejection_reason } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return sendError(res, 400, 'Status must be APPROVED or REJECTED');
        }

        const registration = await EventRegistration.findById(registrationId)
            .populate('user_id', 'name email phone');

        if (!registration) return sendError(res, 404, 'Registration not found');

        registration.status = status;
        if (status === 'REJECTED' && rejection_reason) {
            registration.rejection_reason = rejection_reason;
        }
        registration.reviewed_by = req.user!._id;
        registration.reviewed_at = new Date();

        await registration.save();

        return sendResponse(res, 200, `Registration ${status.toLowerCase()} successfully`, registration);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Send Mail to Event Participants ────────────────────────────────────────

export const sendMailToParticipants = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;
        const { subject, message } = req.body;

        if (!subject || !message) {
            return sendError(res, 400, 'Subject and message are required');
        }

        const event = await Event.findById(eventId).populate('society_id', 'name logo');
        if (!event) return sendError(res, 404, 'Event not found');

        const registrations = await EventRegistration.find({
            event_id: eventId,
            status: 'APPROVED'
        }).populate('user_id', 'name email');

        if (registrations.length === 0) {
            return sendError(res, 400, 'No approved participants to send mail to');
        }

        const societyName = typeof event.society_id === 'object' && 'name' in event.society_id
            ? (event.society_id as any).name
            : 'Society';

        let successCount = 0;
        let failCount = 0;

        for (const reg of registrations) {
            const user = reg.user_id as any;
            if (!user || !user.email) {
                failCount++;
                continue;
            }
            try {
                const html = emailTemplates.eventNotification(
                    user.name || 'Participant',
                    event.title,
                    societyName,
                    message,
                    event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    }) : undefined,
                    event.venue
                );
                await sendEmail(user.email, subject, html);
                successCount++;
            } catch (err) {
                console.error(`Failed to send email to ${user.email}:`, err);
                failCount++;
            }
        }

        return sendResponse(res, 200, `Emails sent: ${successCount} successful, ${failCount} failed`, {
            total: registrations.length,
            successCount,
            failCount
        });
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Export Approved Registrations to Excel ─────────────────────────────────

export const exportRegistrationsToExcel = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) return sendError(res, 404, 'Event not found');

        const registrations = await EventRegistration.find({
            event_id: eventId,
            status: 'APPROVED'
        })
            .populate('user_id', 'name email phone')
            .populate('form_id', 'title fields');

        // Build Excel data
        const rows: any[] = [];

        registrations.forEach((reg: any, index: number) => {
            const row: any = {
                'S.No': index + 1,
                'Name': reg.user_id?.name || 'N/A',
                'Email': reg.user_id?.email || 'N/A',
                'Phone': reg.user_id?.phone || 'N/A',
                'Registration Date': new Date(reg.created_at).toLocaleDateString(),
                'Status': reg.status
            };

            // Add dynamic form responses as columns
            if (reg.responses && reg.responses.length > 0) {
                reg.responses.forEach((resp: any) => {
                    row[resp.field_label] = resp.value;
                });
            }

            rows.push(row);
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${event.title}_registrations.xlsx"`);
        return res.send(buffer);
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};

// ─── Export Approved Registrations to PDF ────────────────────────────────────

export const exportRegistrationsToPdf = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId).populate('society_id', 'name');
        if (!event) return sendError(res, 404, 'Event not found');

        const registrations = await EventRegistration.find({
            event_id: eventId,
            status: 'APPROVED'
        })
            .populate('user_id', 'name email phone')
            .populate('form_id', 'title fields');

        const societyName = typeof event.society_id === 'object' && 'name' in event.society_id
            ? (event.society_id as any).name : 'Society';

        // Create PDF document
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${event.title}_registrations.pdf"`);
        doc.pipe(res);

        // ── Header ──
        doc.fontSize(18).font('Helvetica-Bold').text(event.title, { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica').fillColor('#666666')
            .text(`${societyName}  •  Approved Participants`, { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(9).text(`Generated: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}`, { align: 'center' });
        doc.moveDown(1);

        // ── Divider ──
        doc.strokeColor('#e2e8f0').lineWidth(1)
            .moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.8);

        // ── Collect dynamic field labels from first registration ──
        const dynamicLabels: string[] = [];
        if (registrations.length > 0 && registrations[0].responses) {
            registrations[0].responses.forEach((r: any) => {
                if (r.field_type !== 'FILE') dynamicLabels.push(r.field_label);
            });
        }

        // ── Table header columns ──
        const baseHeaders = ['#', 'Name', 'Email', 'Phone'];
        const allHeaders = [...baseHeaders, ...dynamicLabels];

        // Column widths
        const pageWidth = 515;
        const numWidth = 25;
        const remainingWidth = pageWidth - numWidth;
        const colCount = allHeaders.length - 1; // minus the # column
        const colWidth = Math.floor(remainingWidth / colCount);

        const drawTableHeader = () => {
            const y = doc.y;
            doc.rect(40, y, pageWidth, 22).fill('#4f46e5');
            doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');

            let x = 40;
            doc.text('#', x + 4, y + 6, { width: numWidth, align: 'center' });
            x += numWidth;
            for (let i = 1; i < allHeaders.length; i++) {
                doc.text(allHeaders[i], x + 4, y + 6, { width: colWidth - 8 });
                x += colWidth;
            }

            doc.fillColor('#333333').font('Helvetica');
            doc.y = y + 26;
        };

        drawTableHeader();

        // ── Table rows ──
        registrations.forEach((reg: any, index: number) => {
            // Check if we need a new page
            if (doc.y > 720) {
                doc.addPage();
                drawTableHeader();
            }

            const y = doc.y;
            const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
            doc.rect(40, y, pageWidth, 20).fill(bgColor);
            doc.fillColor('#333333').fontSize(7.5).font('Helvetica');

            let x = 40;
            doc.text(String(index + 1), x + 4, y + 5, { width: numWidth, align: 'center' });
            x += numWidth;
            doc.text(reg.user_id?.name || 'N/A', x + 4, y + 5, { width: colWidth - 8 });
            x += colWidth;
            doc.text(reg.user_id?.email || 'N/A', x + 4, y + 5, { width: colWidth - 8 });
            x += colWidth;
            doc.text(reg.user_id?.phone || 'N/A', x + 4, y + 5, { width: colWidth - 8 });
            x += colWidth;

            // Dynamic fields
            dynamicLabels.forEach((label) => {
                const resp = reg.responses?.find((r: any) => r.field_label === label);
                const val = resp ? String(resp.value).substring(0, 30) : '-';
                doc.text(val, x + 4, y + 5, { width: colWidth - 8 });
                x += colWidth;
            });

            doc.y = y + 22;
        });

        // ── Footer summary ──
        doc.moveDown(1.5);
        doc.strokeColor('#e2e8f0').lineWidth(1)
            .moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333')
            .text(`Total Approved Participants: ${registrations.length}`, { align: 'right' });

        doc.end();
    } catch (error: any) {
        return sendError(res, 500, 'Internal server error', error);
    }
};
