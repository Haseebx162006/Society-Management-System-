import { z } from 'zod';

export const validateQRSchema = z.object({
    body: z.object({
        qr_token: z.string().min(1),
        society_id: z.string().min(1),
    })
});

export const confirmEntrySchema = z.object({
    body: z.object({
        qr_token: z.string().min(1),
        society_id: z.string().min(1),
    })
});
