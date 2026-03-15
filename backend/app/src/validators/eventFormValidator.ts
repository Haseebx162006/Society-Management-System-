import { z } from 'zod';

// Create Event Form validation
export const createEventFormSchema = z.object({
    body: z.object({
        event_id: z
            .string()
            .min(24).max(24),
        title: z
            .string()
            .min(3).max(200)
            .trim(),
        description: z
            .string()
            .min(5).max(2000)
            .trim()
            .optional(),
        fields: z
            .array(z.object({
                label: z.string().max(100),
                type: z.enum(['text', 'email', 'number', 'date', 'select', 'checkbox', 'textarea', 'file']),
                required: z.boolean().default(true),
                placeholder: z.string().max(200).optional(),
                options: z.array(z.string()).optional(),
            }))
            .min(1, 'Form must have at least one field')
            .max(50, 'Form cannot have more than 50 fields'),
    }),
});

// Update Event Form validation
export const updateEventFormSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(3).max(200)
            .trim()
            .optional(),
        description: z
            .string()
            .min(5).max(2000)
            .trim()
            .optional(),
        fields: z
            .array(z.object({
                label: z.string().max(100),
                type: z.enum(['text', 'email', 'number', 'date', 'select', 'checkbox', 'textarea', 'file']),
                required: z.boolean().default(true),
                placeholder: z.string().max(200).optional(),
                options: z.array(z.string()).optional(),
            }))
            .min(1, 'Form must have at least one field')
            .max(50, 'Form cannot have more than 50 fields')
            .optional(),
    }),
    params: z.object({
        id: z.string().min(24).max(24), // Form ID
    }),
});

// Register for Event validation
export const registerEventSchema = z.object({
    body: z.object({
        event_id: z
            .string()
            .min(24).max(24),
        form_data: z
            .record(z.string(), z.any())
            .optional()
            .default({}),
    }),
});

// Create Event Registration (admin)
export const createEventRegistrationSchema = z.object({
    body: z.object({
        event_id: z
            .string()
            .min(24).max(24),
        user_id: z
            .string()
            .min(24).max(24),
        status: z
            .enum(['REGISTERED', 'CHECKED_IN', 'NO_SHOW', 'CANCELLED'])
            .default('REGISTERED'),
        form_data: z
            .record(z.string(), z.any())
            .optional()
            .default({}),
    }),
});

// Update Event Registration
export const updateEventRegistrationSchema = z.object({
    body: z.object({
        status: z
            .enum(['REGISTERED', 'CHECKED_IN', 'NO_SHOW', 'CANCELLED'])
            .optional(),
        form_data: z
            .record(z.string(), z.any())
            .optional(),
    }),
    params: z.object({
        id: z.string().min(24).max(24), // Registration ID
    }),
});

// Bulk check-in
export const bulkCheckInSchema = z.object({
    body: z.object({
        event_id: z
            .string()
            .min(24).max(24),
        registration_ids: z
            .array(z.string().min(24).max(24))
            .min(1, 'At least one registration is required')
            .max(1000, 'Bulk size limited to 1000'),
    }),
});
