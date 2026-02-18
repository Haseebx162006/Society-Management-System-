import mongoose, { Document, Schema } from 'mongoose';

// ─── Sub-document: a single form field ───────────────────────────────────────

export interface IEventFormField {
    label: string;
    field_type: 'TEXT' | 'EMAIL' | 'NUMBER' | 'DROPDOWN' | 'CHECKBOX' | 'FILE' | 'TEXTAREA' | 'DATE' | 'PHONE';
    is_required: boolean;
    options?: string[];       // only used for DROPDOWN
    placeholder?: string;
    order: number;
}

const eventFormFieldSchema = new Schema<IEventFormField>({
    label: { type: String, required: true },
    field_type: {
        type: String,
        enum: ['TEXT', 'EMAIL', 'NUMBER', 'DROPDOWN', 'CHECKBOX', 'FILE', 'TEXTAREA', 'DATE', 'PHONE'],
        required: true
    },
    is_required: { type: Boolean, default: false },
    options: [{ type: String }],
    placeholder: { type: String },
    order: { type: Number, default: 0 }
}, { _id: true });

// ─── Main document: the event registration form ─────────────────────────────

export interface IEventForm extends Document {
    society_id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    fields: IEventFormField[];
    is_active: boolean;
    created_by: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}

const eventFormSchema = new Schema<IEventForm>({
    society_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    fields: [eventFormFieldSchema],
    is_active: {
        type: Boolean,
        default: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

eventFormSchema.index({ society_id: 1, is_active: 1 });

export default mongoose.model<IEventForm>('EventForm', eventFormSchema);
