import mongoose, { Document, Schema } from 'mongoose';

export interface ISponsor extends Document {
    society_id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    contact: string;
    email: string;
    phone?: string;
    active: boolean;
    logo_url?: string;
    amount?: number;
    created_by: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}

const sponsorSchema: Schema = new Schema({
    society_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    contact: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    logo_url: {
        type: String
    },
    amount: {
        type: Number
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
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<ISponsor>("Sponsor", sponsorSchema);
