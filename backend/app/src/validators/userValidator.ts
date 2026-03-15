import { z } from 'zod';

// User profile update validation
export const updateProfileSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must not exceed 100 characters')
            .trim()
            .optional(),
        phone: z
            .string()
            .min(5, 'Phone must be at least 5 characters')
            .max(20, 'Phone must not exceed 20 characters')
            .trim()
            .optional(),
    })
    .refine(data => Object.keys(data).length > 0, 'At least one field is required'),
});

// Change password validation
export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z
            .string({ message: 'Current password is required' })
            .min(1, 'Current password is required'),
        newPassword: z
            .string({ message: 'New password is required' })
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
                   'Password must include uppercase, lowercase, number and special character'),
    })
    .refine(data => data.currentPassword !== data.newPassword, 'New password must be different from current password'),
});
