import { z } from 'zod';

// Create Group/Team validation
export const createGroupSchema = z.object({
    body: z.object({
        name: z
            .string({ message: 'Group name is required' })
            .min(2, 'Group name must be at least 2 characters')
            .max(100, 'Group name must not exceed 100 characters')
            .trim(),
        description: z
            .string()
            .min(5, 'Description must be at least 5 characters')
            .max(1000, 'Description must not exceed 1000 characters')
            .trim()
            .optional(),
    }),
    params: z.object({
        id: z.string().min(24).max(24), // Society ID
    }),
});

// Update Group validation
export const updateGroupSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2).max(100)
            .trim()
            .optional(),
        description: z
            .string()
            .min(5).max(1000)
            .trim()
            .optional(),
    }),
    params: z.object({
        id: z.string().min(24).max(24), // Group ID
    }),
});

// Add member to group
export const addGroupMemberSchema = z.object({
    body: z.object({
        user_id: z
            .string()
            .min(24).max(24),
        role: z
            .enum(['MEMBER', 'LEAD', 'CO-LEAD'])
            .default('MEMBER'),
    }),
    params: z.object({
        id: z.string().min(24).max(24), // Group ID
    }),
});
