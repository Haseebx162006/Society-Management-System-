import mongoose, { Document, Schema } from 'mongoose';



export interface IFormField {
    label: string;
    field_type: 'TEXT' | 'EMAIL' | 'NUMBER' | 'DROPDOWN' | 'CHECKBOX' | 'FILE';
    is_required: boolean;
    options?: string[];       // only used for DROPDOWN
    order: number;
}

const formFieldSchema = new Schema<IFormField>({
    label: { type: String, required: true },
    field_type: { type: String, enum: ['TEXT', 'EMAIL', 'NUMBER', 'DROPDOWN', 'CHECKBOX', 'FILE'], required: true },
    is_required: { type: Boolean, default: false },
    options: [{ type: String }],
    order: { type: Number, default: 0 }
}, { _id: true });

// ─── Main document: the form itself 

export interface IJoinForm extends Document {
    society_id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    fields: IFormField[];
    is_active: boolean;
    is_public: boolean;
    created_by: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}

const joinFormSchema = new Schema<IJoinForm>({
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
    fields: [formFieldSchema],
    is_active: {
        type: Boolean,
        default: true
    },
    is_public: {
        type: Boolean,
        default: false
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});


joinFormSchema.index({ society_id: 1, is_active: 1 });

export default mongoose.model<IJoinForm>('JoinForm', joinFormSchema);
