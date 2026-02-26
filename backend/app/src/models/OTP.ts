import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
    email: string;
    otp: string;
    type: 'SIGNUP' | 'PASSWORD_RESET';
    expires_at: Date;
    verified: boolean;
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
    created_at: {
        type: Date,
        default: Date.now,
    },
});

// Auto-delete expired OTPs
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Index for quick lookups
otpSchema.index({ email: 1, type: 1 });

export default mongoose.model<IOTP>('OTP', otpSchema);
