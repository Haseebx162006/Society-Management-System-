import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ISocietyRequest extends Document {
    user_id: mongoose.Types.ObjectId | IUser;
    society_name: string;
    description?: string;
    status: "APPROVED" | "PENDING" | "REJECTED";
    rejection_reason?: string;
    reviewed_by?: mongoose.Types.ObjectId | IUser;
    reviewed_at?: Date;
    created_at: Date;
}

const societyRequestSchema: Schema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    society_name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["APPROVED", "PENDING", "REJECTED"],
        default: "PENDING"
    },
    rejection_reason: {
        type: String
    },
    reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewed_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<ISocietyRequest>("SocietyRequest", societyRequestSchema);
