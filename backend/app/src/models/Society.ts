import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ISociety extends Document {
    name: string;
    description: string;
    registration_fee: number;
    discounts: Array<{
        discount_percentage: number;
        start_date: Date;
        end_date: Date;
        label: string;
    }>;
    category: "Technology" | "Arts" | "Engineering" | "Sports" | "Religious" | "Social" | "Entrepreneurship" | "Others";
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
    why_join_us: string[];
    faqs: Array<{
        question: string;
        answer: string;
    }>;
    contact_info?: {
        email?: string;
        phone?: string;
        website?: string;
        social_links?: {
            facebook?: string;
            instagram?: string;
            twitter?: string;
            linkedin?: string;
        };
    };
    logo?: string;
    joining_verification_required: boolean;
    status: "ACTIVE" | "SUSPENDED" | "DELETED";
    renewal_approved: boolean;
    created_by: mongoose.Types.ObjectId | IUser;
    is_setup: boolean;
    created_at: Date;
    updated_at: Date;
    registration_start_date?: Date;
    registration_end_date?: Date;
    payment_info?: {
        acc_num: string;
        acc_holder_name: string;
        acc_destination: string;
    };
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
    discounts: [{
        discount_percentage: { type: Number, required: true, min: 0, max: 100 },
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true },
        label: { type: String, required: true }
    }],
    category: {
        type: String,
        enum: ["Technology", "Arts", "Engineering", "Sports", "Religious", "Social", "Entrepreneurship", "Others"],
        required: true,
        default: "Others"
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
    why_join_us: [String],
    faqs: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }],
    contact_info: {
        email: String,
        phone: String,
        website: String,
        social_links: {
            facebook: String,
            instagram: String,
            twitter: String,
            linkedin: String
        }
    },
    logo: {
        type: String, 
        required: false
    },
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
    renewal_approved: {
        type: Boolean,
        default: false
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
    },
    registration_start_date: {
        type: Date
    },
    registration_end_date: {
        type: Date
    },
    payment_info: {
        acc_num: String,
        acc_holder_name: String,
        acc_destination: String
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

societySchema.virtual('groups', {
    ref: 'Group',
    localField: '_id',
    foreignField: 'society_id'
});

// Add performance indexes
societySchema.index({ name: 1 }, { unique: true });  // Lookup by name
societySchema.index({ status: 1, created_at: -1 });  // List active societies
societySchema.index({ created_by: 1 });  // User's societies
societySchema.index({ category: 1, status: 1 });  // Filter by category
// Text index for search
societySchema.index({ name: 'text', description: 'text' });

export default mongoose.model<ISociety>("Society", societySchema);
