import { z } from 'zod';

// Comprehensive validation schemas for Event endpoints
export const createEventSchema = z.object({
    body: z.object({
        title: z
            .string({ message: 'Event title is required' })
            .min(3, 'Title must be at least 3 characters')
            .max(200, 'Title must not exceed 200 characters')
            .trim(),
        description: z
            .string({ message: 'Description is required' })
            .min(10, 'Description must be at least 10 characters')
            .max(5000, 'Description must not exceed 5000 characters')
            .trim(),
        event_date: z
            .string()
            .datetime({ message: 'Invalid event date format' }),
        event_end_date: z
            .string()
            .datetime()
            .optional(),
        venue: z
            .string()
            .min(3).max(200)
            .trim(),
        event_type: z
            .enum(['WORKSHOP', 'SEMINAR', 'COMPETITION', 'MEETUP', 'CULTURAL', 'SPORTS', 'OTHER'])
            .default('OTHER'),
        max_participants: z
            .number()
            .min(1).max(10000)
            .optional(),
        price: z
            .number()
            .min(0).max(100000)
            .optional()
            .default(0),
        is_public: z
            .boolean()
            .optional()
            .default(true),
        status: z
            .enum(['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'])
            .optional()
            .default('DRAFT'),
        tags: z
            .array(z.string().max(50))
            .optional()
            .default([]),
    }),
    params: z.object({
        id: z.string().min(24).max(24),  // Society ID
    }),
});

export const updateEventSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(200).trim().optional(),
        description: z.string().min(10).max(5000).trim().optional(),
        event_date: z.string().datetime().optional(),
        event_end_date: z.string().datetime().optional(),
        venue: z.string().min(3).max(200).trim().optional(),
        event_type: z.enum(['WORKSHOP', 'SEMINAR', 'COMPETITION', 'MEETUP', 'CULTURAL', 'SPORTS', 'OTHER']).optional(),
        max_participants: z.number().min(1).max(10000).optional(),
        price: z.number().min(0).max(100000).optional(),
        is_public: z.boolean().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
        tags: z.array(z.string().max(50)).optional(),
    }),
    params: z.object({
        eventId: z.string().min(24).max(24),
    }),
});

export const searchEventSchema = z.object({
    query: z.object({
        search: z
            .string()
            .max(100, 'Search query must not exceed 100 characters')
            .optional(),
        type: z
            .enum(['WORKSHOP', 'SEMINAR', 'COMPETITION', 'MEETUP', 'CULTURAL', 'SPORTS', 'OTHER', 'All'])
            .optional(),
        society: z
            .string()
            .min(24).max(24)
            .optional(),
        page: z
            .string()
            .refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, 'Invalid page number')
            .optional()
            .default('1'),
        limit: z
            .string()
            .refine(val => {
                const num = parseInt(val);
                return !isNaN(num) && num > 0 && num <= 100;
            }, 'Limit must be between 1 and 100')
            .optional()
            .default('12'),
    }),
});
