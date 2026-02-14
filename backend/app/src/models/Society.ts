import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ISociety extends Document {
    name: string;
    description: string;
    status: "ACTIVE" | "SUSPENDED" | "DELETED";
    created_by: mongoose.Types.ObjectId | IUser;
    created_at: Date;
    updated_at: Date;
}

const societySchema: Schema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "SUSPENDED", "DELETED"],
        default: "ACTIVE"
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<ISociety>("Society", societySchema);
