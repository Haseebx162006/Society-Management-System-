import { z } from 'zod';

// Submit join request validation
export const submitJoinRequestSchema = z.object({
    body: z.object({
        society_id: z
            .string()
            .min(24).max(24),
        form_data: z
            .record(z.string(), z.any())
            .optional()
            .default({}),
    }),
});

// Approve/Reject join request
export const updateJoinRequestSchema = z.object({
    body: z.object({
        status: z
            .enum(['APPROVED', 'REJECTED'])
            .describe('New status for the join request'),
        reason: z
            .string()
            .max(500, 'Reason must not exceed 500 characters')
            .optional(),
    }),
    params: z.object({
        id: z.string().min(24).max(24), // Join request ID
    }),
});

// Submit join form (for form data)
export const submitJoinFormSchema = z.object({
    body: z.object({
        society_id: z
            .string()
            .min(24).max(24),
        form_data: z
            .record(z.string(), z.any())
            .refine(data => Object.keys(data).length > 0, 'At least one form field is required'),
    }),
});

// Create/Update join form structure
export const createJoinFormSchema = z.object({
    body: z.object({
        society_id: z
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
                type: z.enum(['text', 'email', 'number', 'date', 'select', 'checkbox', 'textarea']),
                required: z.boolean().default(true),
                placeholder: z.string().max(200).optional(),
                options: z.array(z.string()).optional(),
            }))
            .min(1, 'Form must have at least one field')
            .max(50, 'Form cannot have more than 50 fields'),
    }),
});
