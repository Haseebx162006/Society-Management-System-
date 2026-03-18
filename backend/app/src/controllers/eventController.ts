import crypto from 'crypto';
import { catchAsync } from '../util/catchAsync';
import { Response, NextFunction } from 'express';
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
import { createSafeRegex, validateString, validateNumber } from '../util/stringUtils';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

const safeParse = (data: any, fallback: any = []) => {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch {
            return fallback;
        }
    }
    return data;
};

export const createEvent = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id: society_id } = req.params;
        const {
            title, description, event_date, event_end_date,
            venue, event_type, max_participants,
            registration_start_date, registration_deadline,
            registration_form, content_sections, tags, is_public, status, price,
            payment_info, discounts
        } = req.body;

        if (!title || !description || !event_date || !venue) {
            return sendError(res, 400, 'Title, description, event date and venue are required');
        }

        const society = await Society.findById(society_id);
        if (!society || society.status !== 'ACTIVE') {
            return sendError(res, 404, 'Active society not found');
        }

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

        const parsedContentSections = safeParse(content_sections, []);
        const parsedTags = safeParse(tags, []);
        const parsedPaymentInfo = safeParse(payment_info, undefined);
        const parsedDiscounts = safeParse(discounts, []);

        const event = await Event.create({
            society_id,
            title,
            description,
            event_date,
            event_end_date: event_end_date || undefined,
            venue,
            event_type: event_type || 'OTHER',
            banner: bannerUrl,
            max_participants: max_participants ? Number(max_participants) : undefined,
            registration_start_date: registration_start_date || undefined,
            registration_deadline: registration_deadline || undefined,
            registration_form: registration_form || undefined,
            content_sections: parsedContentSections,
            tags: parsedTags,
            is_public: is_public === 'true' || is_public === true,
            status: status ? String(status).toUpperCase() : 'DRAFT',
            created_by: req.user!._id,
            price: Number(price) || 0,
            discounts: parsedDiscounts,
            payment_info: parsedPaymentInfo
        });

        return sendResponse(res, 201, 'Event created successfully', event);
});

export const getEventsBySociety = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id: society_id } = req.params;
        const events = await Event.find({ society_id })
            .populate('registration_form', 'title fields')
            .sort({ event_date: -1 })
            .lean();  // ✅ PERF: No Mongoose overhead for read-only query
        return sendResponse(res, 200, 'Events fetched successfully', events);
});

export const getAllEventsAdmin = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const events = await Event.find()
            .populate('society_id', 'name description logo category')
            .populate('registration_form', 'title fields description')
            .sort({ event_date: -1 })
            .lean();  // ✅ PERF: Prevent N+1 Mongoose hydration
        return sendResponse(res, 200, 'All events fetched successfully', events);
});

export const getAllPublicEvents = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { search, type, society, page = '1', limit = '12' } = req.query;
        
        // Validate pagination parameters
        const pageNum = Math.max(1, validateNumber(page, 1, 1000, 'page'));
        const limitNum = Math.min(100, Math.max(1, validateNumber(limit, 1, 100, 'limit')));
        const skip = (pageNum - 1) * limitNum;

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

        // FIX: Use MongoDB text search instead of unescaped regex to prevent ReDoS
        if (search) {
            try {
                const searchStr = validateString(search, 100, 'search');
                // Use MongoDB text index for better performance and security
                query.$text = { $search: searchStr };
            } catch (error) {
                return sendError(res, 400, 'Invalid search query');
            }
        }

        const [events, total] = await Promise.all([
            Event.find(query)
                .populate({
                    path: 'society_id',
                    select: 'name logo category',
                })
                .populate({
                    path: 'registration_form',
                    select: 'title fields description',
                })
                .sort(search ? { score: { $meta: 'textScore' } } : { event_date: 1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),  // FIX: Return plain JS objects for better performance
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
});

export const getPublicEventsBySociety = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id: society_id } = req.params;
        const events = await Event.find({
            society_id,
            is_public: true,
            status: { $in: ['PUBLISHED', 'ONGOING'] }
        }).populate('registration_form', 'title fields description').sort({ event_date: -1 });
        return sendResponse(res, 200, 'Public events fetched successfully', events);
});

export const getEventById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { eventId } = req.params;
        const event = await Event.findById(eventId).populate('registration_form').populate('society_id', 'name description logo');
        if (!event) return sendError(res, 404, 'Event not found');
        return sendResponse(res, 200, 'Event fetched successfully', event);
});

export const updateEvent = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { eventId } = req.params;
        const {
            title, description, event_date, event_end_date,
            venue, event_type, max_participants,
            registration_start_date, registration_deadline,
            registration_form, content_sections, tags, is_public, status, price,
            payment_info, discounts
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
        if (is_public !== undefined) event.is_public = is_public === 'true' || is_public === true;
        if (status) event.status = String(status).toUpperCase() as any;
        if (price !== undefined) event.price = Number(price);
        if (payment_info !== undefined) event.payment_info = safeParse(payment_info, undefined);
        if (discounts !== undefined) event.discounts = safeParse(discounts, []);
        if (content_sections !== undefined) event.content_sections = safeParse(content_sections, []);
        if (tags !== undefined) event.tags = safeParse(tags, []);
        if (req.file) {
            const result = await uploadOnCloudinary(req.file.path);
            if (result) event.banner = result.secure_url;
        }
        event.updated_at = new Date();
        await event.save();
        return sendResponse(res, 200, 'Event updated successfully', event);
});

export const deleteEvent = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);
        if (!event) return sendError(res, 404, 'Event not found');
        event.status = 'CANCELLED';
        event.updated_at = new Date();
        await event.save();
        return sendResponse(res, 200, 'Event cancelled successfully');
});

export const submitEventRegistration = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { eventId } = req.params;
        const { form_id, responses } = req.body;
        const event = await Event.findById(eventId);
        if (!event) return sendError(res, 404, 'Event not found');
        if (!['PUBLISHED', 'ONGOING'].includes(event.status)) return sendError(res, 400, 'Event is not currently accepting registrations');
        if (!event.is_public) {
            const isMember = await SocietyUserRole.findOne({ society_id: event.society_id, user_id: req.user!._id });
            if (!isMember) return sendError(res, 403, 'This event is private. Only society members can register.');
        }
        if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) return sendError(res, 400, 'Registration deadline has passed');
        if (event.max_participants) {
            const currentCount = await EventRegistration.countDocuments({ event_id: eventId, status: { $in: ['PENDING', 'APPROVED'] } });
            if (currentCount >= event.max_participants) return sendError(res, 400, 'Maximum participant limit reached');
        }
        const existing = await EventRegistration.findOne({ event_id: eventId, user_id: req.user!._id, status: { $in: ['PENDING', 'APPROVED'] } });
        if (existing) return sendError(res, 400, 'You have already registered for this event');
        let parsedResponses = responses;
        if (typeof responses === 'string') { try { parsedResponses = JSON.parse(responses); } catch { parsedResponses = []; } }
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const result = await uploadOnCloudinary(file.path);
                if (result) {
                    const fieldName = file.fieldname;
                    const responseIndex = parsedResponses.findIndex((r: any) => r.field_label === fieldName);
                    if (responseIndex >= 0) parsedResponses[responseIndex].value = result.secure_url;
                    else parsedResponses.push({ field_label: fieldName, field_type: 'FILE', value: result.secure_url });
                }
            }
        }
        const registration = await EventRegistration.create({ event_id: eventId, user_id: req.user!._id, form_id: form_id || event.registration_form, responses: parsedResponses });
        return sendResponse(res, 201, 'Event registration submitted successfully', registration);
});

export const getMyRegistration = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { eventId } = req.params;
        const registration = await EventRegistration.findOne({ event_id: eventId, user_id: req.user!._id }).populate('form_id', 'title fields');
        if (!registration) return sendResponse(res, 200, 'Not registered', null);
        return sendResponse(res, 200, 'My registration fetched successfully', registration);
});

export const getEventRegistrations = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { eventId } = req.params;
        const { status } = req.query;
        const query: any = { event_id: eventId };
        if (status) query.status = status;
        const registrations = await EventRegistration.find(query).populate('user_id', 'name email phone').populate('form_id', 'title fields').sort({ created_at: -1 });
        return sendResponse(res, 200, 'Event registrations fetched successfully', registrations);
});

export const getEventRegistrationsAdmin = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { eventId } = req.params;
        const registrations = await EventRegistration.find({ event_id: eventId }).populate('user_id', 'name email phone').populate('form_id', 'title fields').sort({ created_at: -1 });
        return sendResponse(res, 200, 'Event registrations (Admin) fetched successfully', registrations);
});

// Generate a 6-character alphanumeric token (lowercase + numbers)
const generateShortToken = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

export const updateRegistrationStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { registrationId } = req.params;
        const { status, rejection_reason } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) return sendError(res, 400, 'Status must be APPROVED or REJECTED');
        const registration = await EventRegistration.findById(registrationId).populate('user_id', 'name email phone');
        if (!registration) return sendError(res, 404, 'Registration not found');
        registration.status = status;
        if (status === 'APPROVED' && !registration.qr_token) {
            // Generate unique 6-char token, retry if collision
            let token = generateShortToken();
            let attempts = 0;
            while (attempts < 10) {
                const existing = await EventRegistration.findOne({ qr_token: token });
                if (!existing) break;
                token = generateShortToken();
                attempts++;
            }
            console.log('Generated QR token:', token);
            console.log('Token length:', token.length);
            registration.qr_token = token;
            registration.entry_status = 'NOT_ENTERED';
        }
        if (status === 'REJECTED' && rejection_reason) registration.rejection_reason = rejection_reason;
        registration.reviewed_by = req.user!._id;
        registration.reviewed_at = new Date();
        await registration.save();
        console.log('Saved registration with qr_token:', registration.qr_token);
        return sendResponse(res, 200, `Registration ${status.toLowerCase()} successfully`, registration);
});

export const sendMailToParticipants = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { eventId } = req.params;
        const { subject, message } = req.body;
        if (!subject || !message) return sendError(res, 400, 'Subject and message are required');
        const event = await Event.findById(eventId).populate('society_id', 'name logo');
        if (!event) return sendError(res, 404, 'Event not found');
        const registrations = await EventRegistration.find({ event_id: eventId, status: 'APPROVED' }).populate('user_id', 'name email');
        if (registrations.length === 0) return sendError(res, 400, 'No approved participants to send mail to');
        const societyName = typeof event.society_id === 'object' && 'name' in event.society_id ? (event.society_id as any).name : 'Society';
        let successCount = 0; let failCount = 0;
        for (const reg of registrations) {
            const user = reg.user_id as any;
            if (!user || !user.email) { failCount++; continue; }
            try {
                const html = emailTemplates.eventNotification(user.name || 'Participant', event.title, societyName, message, event.event_date ? new Date(event.event_date).toLocaleDateString() : undefined, event.venue);
                await sendEmail(user.email, subject, html);
                successCount++;
            } catch (err) { failCount++; }
        }
        return sendResponse(res, 200, `Emails sent: ${successCount} successful, ${failCount} failed`, { total: registrations.length, successCount, failCount });
});

export const exportRegistrationsToExcel = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return sendError(res, 404, 'Event not found');
    const registrations = await EventRegistration.find({ event_id: eventId, status: 'APPROVED' }).populate('user_id', 'name email phone').populate('form_id', 'title fields');
    const rows: any[] = [];
    registrations.forEach((reg: any, index: number) => {
        const row: any = { 'S.No': index + 1, 'Name': reg.user_id?.name || 'N/A', 'Email': reg.user_id?.email || 'N/A', 'Phone': reg.user_id?.phone || 'N/A', 'Registration Date': new Date(reg.created_at).toLocaleDateString(), 'Status': reg.status };
        if (reg.responses && reg.responses.length > 0) { reg.responses.forEach((resp: any) => { row[resp.field_label] = resp.value; }); }
        rows.push(row);
    });
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${event.title}_registrations.xlsx"`);
    return res.send(buffer);
});

export const exportRegistrationsToPdf = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).populate('society_id', 'name');
    if (!event) return sendError(res, 404, 'Event not found');
    const registrations = await EventRegistration.find({ event_id: eventId, status: 'APPROVED' }).populate('user_id', 'name email phone').populate('form_id', 'title fields');
    const societyName = typeof event.society_id === 'object' && 'name' in event.society_id ? (event.society_id as any).name : 'Society';
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${event.title}_registrations.pdf"`);
    doc.pipe(res);
    const logoPath = path.join(__dirname, '../../../../frontend/public/logo.png');
    try { if (fs.existsSync(logoPath)) { doc.image(logoPath, 50, 45, { width: 60 }); } } catch (err) {}
    doc.fontSize(10).fillColor('#666666').text('COMSATS University Islamabad, Lahore Campus', 400, 50, { align: 'right' });
    doc.moveDown(4);
    doc.fontSize(20).fillColor('#000000').text('Event Registration List', { align: 'center' });
    doc.fontSize(12).text(`Event: ${event.title}`, { align: 'center' }).text(`Society: ${societyName}`, { align: 'center' });
    doc.moveDown();
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.8);
    const dynamicLabels: string[] = [];
    if (registrations.length > 0 && registrations[0].responses) { registrations[0].responses.forEach((r: any) => { if (r.field_type !== 'FILE') dynamicLabels.push(r.field_label); }); }
    const baseHeaders = ['#', 'Name', 'Email', 'Phone'];
    const allHeaders = [...baseHeaders, ...dynamicLabels];
    const pageWidth = 515; const numWidth = 25; const remainingWidth = pageWidth - numWidth;
    const colCount = allHeaders.length - 1; const colWidth = Math.floor(remainingWidth / colCount);
    const drawTableHeader = () => {
        const y = doc.y; doc.rect(40, y, pageWidth, 22).fill('#2563eb');
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
        let x = 40; doc.text('#', x + 4, y + 6, { width: numWidth, align: 'center' }); x += numWidth;
        for (let i = 1; i < allHeaders.length; i++) { doc.text(allHeaders[i], x + 4, y + 6, { width: colWidth - 8 }); x += colWidth; }
        doc.fillColor('#333333').font('Helvetica'); doc.y = y + 26;
    };
    drawTableHeader();
    registrations.forEach((reg: any, index: number) => {
        if (doc.y > 720) { doc.addPage(); drawTableHeader(); }
        const y = doc.y; const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(40, y, pageWidth, 20).fill(bgColor);
        doc.fillColor('#333333').fontSize(7.5).font('Helvetica');
        let x = 40; doc.text(String(index + 1), x + 4, y + 5, { width: numWidth, align: 'center' }); x += numWidth;
        doc.text(reg.user_id?.name || 'N/A', x + 4, y + 5, { width: colWidth - 8 }); x += colWidth;
        doc.text(reg.user_id?.email || 'N/A', x + 4, y + 5, { width: colWidth - 8 }); x += colWidth;
        doc.text(reg.user_id?.phone || 'N/A', x + 4, y + 5, { width: colWidth - 8 }); x += colWidth;
        dynamicLabels.forEach((label) => {
            const resp = reg.responses?.find((r: any) => r.field_label === label);
            const val = resp ? String(resp.value).substring(0, 30) : '-';
            doc.text(val, x + 4, y + 5, { width: colWidth - 8 }); x += colWidth;
        });
        doc.y = y + 22;
    });
    doc.moveDown(1.5);
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text(`Total Approved Participants: ${registrations.length}`, { align: 'right' });
    doc.end();
});
