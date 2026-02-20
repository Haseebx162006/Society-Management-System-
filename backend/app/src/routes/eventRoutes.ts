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
    getEventFormsBySociety
);
router.get(
    '/society/:id/event-forms/:formId',
    protect,
    authorize(['PRESIDENT', 'EVENT MANAGER'], 'SOCIETY'),
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
    authorize(['PRESIDENT', 'EVENT MANAGER', 'FINANCE MANAGER', 'LEAD', 'CO-LEAD', 'GENERAL SECRETARY'], 'SOCIETY'),
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

router.post(
    '/events/:eventId/register',
    protect,
    upload.any(),
    submitEventRegistration
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
    authorize(['PRESIDENT', 'EVENT MANAGER', 'FINANCE MANAGER'], 'SOCIETY'),
    exportRegistrationsToExcel
);
router.get(
    '/society/:id/events/:eventId/export-pdf',
    protect,
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
