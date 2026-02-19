import mongoose, { Document, Schema } from 'mongoose';

// ─── Sub-document: a single answer ───────────────────────────────────────────

export interface IFormResponse {
    field_label: string;           // copied from form field at submission time
    field_type: string;
    value: string | number | boolean;
}

const formResponseSchema = new Schema<IFormResponse>({
    field_label: { type: String, required: true },
    field_type: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

// ─── Main document: the join request ─────────────────────────────────────────

export interface IJoinRequest extends Document {
    user_id: mongoose.Types.ObjectId;
    society_id: mongoose.Types.ObjectId;
    form_id: mongoose.Types.ObjectId;
    selected_teams?: mongoose.Types.ObjectId[];
    responses: IFormResponse[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
    reviewed_by?: mongoose.Types.ObjectId;
    reviewed_at?: Date;
    created_at: Date;
}

const joinRequestSchema = new Schema<IJoinRequest>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    society_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true
    },
    form_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JoinForm',
        required: true
    },
    selected_teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],
    responses: [formResponseSchema],
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    rejection_reason: { type: String },
    reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewed_at: { type: Date },
    created_at: { type: Date, default: Date.now }
});

// Prevent duplicate pending requests from same user to same society
joinRequestSchema.index(
    { user_id: 1, society_id: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'PENDING' }
    }
);

export default mongoose.model<IJoinRequest>('JoinRequest', joinRequestSchema);
