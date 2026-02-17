import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ISociety extends Document {
    name: string;
    description: string;
    registration_fee: number;
    custom_fields: Array<{
        label: string;
        type: "text" | "number" | "date" | "select";
        options?: string[];
        required: boolean;
    }>;
    content_sections: Array<{
        title: string;
        content: string;
    }>;
    joining_verification_required: boolean;
    status: "ACTIVE" | "SUSPENDED" | "DELETED";
    created_by: mongoose.Types.ObjectId | IUser;
    is_setup: boolean;
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
    registration_fee: {
        type: Number,
        default: 0
    },
    custom_fields: [{
        label: String,
        type: { type: String, enum: ["text", "number", "date", "select"] },
        options: [String],
        required: { type: Boolean, default: false }
    }],
    content_sections: [{
        title: { type: String, required: true },
        content: { type: String, required: true }
    }],
    joining_verification_required: {
        type: Boolean,
        default: true
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
    is_setup: {
        type: Boolean,
        default: false
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
