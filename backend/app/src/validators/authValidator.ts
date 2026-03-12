import { z } from 'zod';

export const signupSchema = z.object({
    body: z.object({
        name: z.string({
            message: "Name is required",
        }).min(2, "Name must be at least 2 characters")
          .max(50, "Name must not exceed 50 characters"),
        email: z.string({
            message: "Email is required",
        }).email("Invalid email format")
          .toLowerCase(),
        password: z.string({
            message: "Password is required",
        }).min(8, "Password must be at least 8 characters")
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
                 "Password must include uppercase, lowercase, number and special character"),
        phone: z.string().optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string({
            message: "Email is required",
        }).email("Invalid email format")
          .toLowerCase(),
        password: z.string({
            message: "Password is required",
        }),
    }),
});

export const verifyOTPSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        otp: z.string().length(6, "OTP must be exactly 6 digits"),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        otp: z.string().length(6, "OTP must be 6 digits"),
        newPassword: z.string().min(8, "Password must be at least 8 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                   "Password must include uppercase, lowercase, number and special character"),
    }),
});
