import express from 'express';
import { protect } from '../middleware/authmiddleware';
import { optionalProtect } from '../middleware/optionalProtect';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/multer.middleware';
import {
    createEventForm,
    getEventFormsBySociety,
    getEventFormById,
    updateEventForm,
    deleteEventForm
} from '../controllers/eventFormController';
import {
    createEvent,
    getEventsBySociety,
    getPublicEventsBySociety,
    getAllPublicEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    submitEventRegistration,
    getEventRegistrations,
    updateRegistrationStatus,
    exportRegistrationsToExcel,
    exportRegistrationsToPdf,
    sendMailToParticipants
} from '../controllers/eventController';

const router = express.Router();

// ─── Event Form CRUD (President) ─────────────────────────────────────────────
router.post(
    '/society/:id/event-forms',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    createEventForm
);
router.get(
    '/society/:id/event-forms',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    getEventFormsBySociety
);
router.get(
    '/society/:id/event-forms/:formId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    getEventFormById
);
router.put(
    '/society/:id/event-forms/:formId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    updateEventForm
);
router.delete(
    '/society/:id/event-forms/:formId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    deleteEventForm
);

// ─── Event CRUD (President) ─────────────────────────────────────────────────
router.post(
    '/society/:id/events',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    upload.single('banner'),
    createEvent
);
router.get(
    '/society/:id/events',
    protect,
    authorize(['PRESIDENT', 'FINANCE MANAGER', 'LEAD', 'CO-LEAD', 'GENERAL SECRETARY'], 'SOCIETY'),
    getEventsBySociety
);
router.get(
    '/society/:id/events/:eventId',
    protect,
    getEventById
);
router.put(
    '/society/:id/events/:eventId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    upload.single('banner'),
    updateEvent
);
router.delete(
    '/society/:id/events/:eventId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    deleteEvent
);

// ─── Public Events ──────────────────────────────────────────────────────────
router.get(
    '/events',
    getAllPublicEvents
);
router.get(
    '/society/:id/public-events',
    getPublicEventsBySociety
);
router.get(
    '/events/:eventId',
    optionalProtect,
    getEventById
);

// ─── Event Registration ─────────────────────────────────────────────────────
router.post(
    '/events/:eventId/register',
    protect,
    upload.any(),
    submitEventRegistration
);

// ─── Registration Management (President) ─────────────────────────────────────
router.get(
    '/society/:id/events/:eventId/registrations',
    protect,
    authorize(['PRESIDENT', 'FINANCE MANAGER'], 'SOCIETY'),
    getEventRegistrations
);
router.put(
    '/society/:id/events/:eventId/registrations/:registrationId',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    updateRegistrationStatus
);

// ─── Export Registrations to Excel / PDF ────────────────────────────────────
router.get(
    '/society/:id/events/:eventId/export',
    protect,
    authorize(['PRESIDENT', 'FINANCE MANAGER'], 'SOCIETY'),
    exportRegistrationsToExcel
);
router.get(
    '/society/:id/events/:eventId/export-pdf',
    protect,
    authorize(['PRESIDENT', 'FINANCE MANAGER'], 'SOCIETY'),
    exportRegistrationsToPdf
);

// ─── Send Mail to Participants ──────────────────────────────────────────────
router.post(
    '/society/:id/events/:eventId/send-mail',
    protect,
    authorize(['PRESIDENT'], 'SOCIETY'),
    sendMailToParticipants
);

export default router;
