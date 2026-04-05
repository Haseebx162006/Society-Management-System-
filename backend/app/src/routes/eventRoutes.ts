import express from 'express';
import { protect, adminOnly } from '../middleware/authmiddleware';
import { optionalProtect } from '../middleware/optionalProtect';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/multer.middleware';
import { eventRegistrationLimiter, exportLimiter } from '../middleware/rateLimiters';
import { cacheMiddleware } from '../middleware/cache';
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
    sendMailToParticipants,
    getMyRegistration,
    getAllEventsAdmin,
    getEventRegistrationsAdmin,
    getFeaturedEvents
} from '../controllers/eventController';

const router = express.Router();

router.post(
    '/society/:id/event-forms',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
    createEventForm
);
router.get(
    '/society/:id/event-forms',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
    cacheMiddleware(120),
    getEventFormsBySociety
);
router.get(
    '/society/:id/event-forms/:formId',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
    cacheMiddleware(120),
    getEventFormById
);
router.put(
    '/society/:id/event-forms/:formId',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
    updateEventForm
);
router.delete(
    '/society/:id/event-forms/:formId',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
    deleteEventForm
);

router.post(
    '/society/:id/events',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
    upload.single('banner'),
    createEvent
);
router.get(
    '/society/:id/events',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER', 'FINANCE MANAGER', 'LEAD', 'CO-LEAD', 'SPONSOR MANAGER'], 'SOCIETY'),
    cacheMiddleware(120),
    getEventsBySociety
);
router.get(
    '/society/:id/events/:eventId',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER', 'FINANCE MANAGER', 'LEAD', 'CO-LEAD', 'SPONSOR MANAGER'], 'SOCIETY'),
    cacheMiddleware(120),
    getEventById
);
router.put(
    '/society/:id/events/:eventId',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
    upload.single('banner'),
    updateEvent
);
router.delete(
    '/society/:id/events/:eventId',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
    deleteEvent
);

router.get(
    '/events/featured',
    cacheMiddleware(120),
    getFeaturedEvents
);
router.get(
    '/events',
    cacheMiddleware(120),
    getAllPublicEvents
);
router.get(
    '/society/:id/public-events',
    cacheMiddleware(120),
    getPublicEventsBySociety
);
router.get(
    '/events/:eventId',
    optionalProtect,
    cacheMiddleware(120),
    getEventById
);

// Admin Routes
router.get(
    '/events/admin/all',
    protect,
    adminOnly,
    getAllEventsAdmin
);

router.get(
    '/events/admin/:eventId/registrations',
    protect,
    adminOnly,
    getEventRegistrationsAdmin
);

router.post(
    '/events/:eventId/register',
    protect,
    eventRegistrationLimiter,  // ✅ RATE LIMIT: Prevent spam registrations
    upload.any(),
    submitEventRegistration
);

router.get(
    '/events/:eventId/my-registration',
    protect,
    getMyRegistration
);

router.get(
    '/society/:id/events/:eventId/registrations',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER', 'FINANCE MANAGER'], 'SOCIETY'),
    getEventRegistrations
);
router.put(
    '/society/:id/events/:eventId/registrations/:registrationId',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
    updateRegistrationStatus
);

router.get(
    '/society/:id/events/:eventId/export',
    protect,
    exportLimiter,  // ✅ RATE LIMIT: Prevent resource exhaustion
    authorize(['PRESIDENT', 'EVENT MANAGER', 'FINANCE MANAGER'], 'SOCIETY'),
    exportRegistrationsToExcel
);
router.get(
    '/society/:id/events/:eventId/export-pdf',
    protect,
    exportLimiter,  // ✅ RATE LIMIT: Prevent resource exhaustion
    authorize(['PRESIDENT', 'EVENT MANAGER', 'FINANCE MANAGER'], 'SOCIETY'),
    exportRegistrationsToPdf
);

router.post(
    '/society/:id/events/:eventId/send-mail',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
    sendMailToParticipants
);

export default router;
