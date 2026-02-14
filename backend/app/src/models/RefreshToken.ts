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

export default mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
