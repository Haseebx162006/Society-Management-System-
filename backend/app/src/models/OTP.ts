import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
    email: string;
    otp: string;
    type: 'SIGNUP' | 'PASSWORD_RESET';
    expires_at: Date;
    verified: boolean;
    attempts: number;
    created_at: Date;
}

const otpSchema: Schema<IOTP> = new Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['SIGNUP', 'PASSWORD_RESET'],
        required: true,
    },
    expires_at: {
        type: Date,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Compound index for optimal querying in auth controller
otpSchema.index({ email: 1, type: 1, verified: 1, created_at: -1 });

// Additional indexes for performance
otpSchema.index({ email: 1, type: 1 });  // Find OTP by email and type
otpSchema.index({ token: 1 }, { unique: true, sparse: true });  // Prevent duplicate tokens

export default mongoose.model<IOTP>('OTP', otpSchema);
