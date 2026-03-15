import { z } from 'zod';

// Comprehensive validation schemas for Society endpoints
export const createSocietySchema = z.object({
    body: z.object({
        name: z
            .string({ message: 'Society name is required' })
            .min(3, 'Name must be at least 3 characters')
            .max(100, 'Name must not exceed 100 characters')
            .trim(),
        description: z
            .string({ message: 'Description is required' })
            .min(10, 'Description must be at least 10 characters')
            .max(5000, 'Description must not exceed 5000 characters')
            .trim(),
        category: z
            .enum(['Technology', 'Arts', 'Engineering', 'Sports', 'Religious', 'Social', 'Entrepreneurship', 'Others'])
            .default('Others'),
        registration_fee: z
            .number()
            .min(0, 'Registration fee must be non-negative')
            .max(100000, 'Registration fee exceeds maximum')
            .optional()
            .default(0),
        registration_start_date: z.string().datetime().optional(),
        registration_end_date: z.string().datetime().optional(),
        teams: z.array(z.string().max(50)).optional().default([]),
        custom_fields: z.array(z.object({
            label: z.string().max(100),
            type: z.enum(['text', 'number', 'date', 'select']),
            required: z.boolean().default(false),
            options: z.array(z.string()).optional(),
        })).optional().default([]),
    }),
});

export const updateSocietySchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(3).max(100)
            .trim()
            .optional(),
        description: z
            .string()
            .min(10).max(5000)
            .trim()
            .optional(),
        category: z
            .enum(['Technology', 'Arts', 'Engineering', 'Sports', 'Religious', 'Social', 'Entrepreneurship', 'Others'])
            .optional(),
        registration_fee: z
            .number()
            .min(0).max(100000)
            .optional(),
    }),
    params: z.object({
        id: z.string().min(24).max(24),  // MongoDB ObjectId length
    }),
});

export const createSocietyRequestSchema = z.object({
    body: z.object({
        society_name: z
            .string()
            .min(3).max(100)
            .trim(),
        description: z
            .string()
            .min(10).max(5000)
            .trim(),
        request_type: z
            .enum(['REGISTER', 'RENEWAL'])
            .default('REGISTER'),
        form_data: z.record(z.string(), z.any()).optional().default({}),
    }),
});
