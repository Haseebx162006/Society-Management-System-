import { Response, NextFunction } from 'express';
import { catchAsync } from '../util/catchAsync';
import { AuthRequest } from '../middleware/authmiddleware';
import EventRegistration from '../models/EventRegistration';

export const validateQR = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { qr_token } = req.body;

    const registration = await EventRegistration.findOne({ qr_token })
        .populate<{ user_id: { name: string; email: string; phone?: string } }>('user_id', 'name email phone')
        .populate<{ event_id: { title: string } }>('event_id', 'title');

    if (!registration || registration.status !== 'APPROVED') {
        return res.status(404).json({ status: 'INVALID_QR' });
    }

    const user = registration.user_id as unknown as { name: string; email: string; phone?: string };
    const event = registration.event_id as unknown as { title: string };

    if (registration.entry_status === 'ENTERED') {
        return res.status(200).json({
            status: 'ALREADY_ENTERED',
            entry_confirmed_at: registration.entry_confirmed_at,
            student: {
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });
    }

    return res.status(200).json({
        status: 'VALID',
        student: {
            name: user.name,
            email: user.email,
            phone: user.phone,
        },
        event: {
            title: event.title,
        },
        entry_status: 'NOT_ENTERED',
    });
});

export const confirmEntry = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { qr_token } = req.body;

    const result = await EventRegistration.findOneAndUpdate(
        { qr_token, entry_status: 'NOT_ENTERED', status: 'APPROVED' },
        {
            entry_status: 'ENTERED',
            entry_confirmed_by: req.user!._id,
            entry_confirmed_at: new Date(),
        },
        { new: true }
    );

    if (!result) {
        return res.status(409).json({ status: 'ALREADY_ENTERED' });
    }

    return res.status(200).json({
        status: 'CONFIRMED',
        entry_confirmed_at: result.entry_confirmed_at,
    });
});
