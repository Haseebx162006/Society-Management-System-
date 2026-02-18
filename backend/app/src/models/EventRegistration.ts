import mongoose, { Document, Schema } from 'mongoose';

// ─── Sub-document: a single answer ───────────────────────────────────────────

export interface IEventFormResponse {
    field_label: string;
    field_type: string;
    value: string | number | boolean;
}

const eventFormResponseSchema = new Schema<IEventFormResponse>({
    field_label: { type: String, required: true },
    field_type: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

// ─── Main document: the event registration ──────────────────────────────────

export interface IEventRegistration extends Document {
    event_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    form_id: mongoose.Types.ObjectId;
    responses: IEventFormResponse[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
    reviewed_by?: mongoose.Types.ObjectId;
    reviewed_at?: Date;
    created_at: Date;
}

const eventRegistrationSchema = new Schema<IEventRegistration>({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    form_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventForm',
        required: true
    },
    responses: [eventFormResponseSchema],
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

// Prevent duplicate pending registrations from same user to same event
eventRegistrationSchema.index(
    { user_id: 1, event_id: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'PENDING' }
    }
);

export default mongoose.model<IEventRegistration>('EventRegistration', eventRegistrationSchema);
