import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IRefreshToken extends Document {
    token: string;
    user: mongoose.Types.ObjectId | IUser;
    expires_at: Date;
    created_at: Date;
    revoked: boolean;
    replaced_by_token?: string;
}

const refreshTokenSchema: Schema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    expires_at: {
        type: Date,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    revoked: {
        type: Boolean,
        default: false
    },
    replaced_by_token: {
        type: String
    }
});

// TTL index to automatically delete expired refresh tokens from MongoDB
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1, revoked: 1 });

export default mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
