import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ISocietyRequest extends Document {
    user_id: mongoose.Types.ObjectId | IUser;
    society_name: string;
    status: "APPROVED" | "PENDING" | "REJECTED";
    rejection_reason?: string;
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
    status: {
        type: String,
        enum: ["APPROVED", "PENDING", "REJECTED"],
        default: "PENDING"
    },
    rejection_reason: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<ISocietyRequest>("SocietyRequest", societyRequestSchema);
