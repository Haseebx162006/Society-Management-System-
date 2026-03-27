import mongoose, { Document, Schema } from 'mongoose';

export interface IEventDiscount {
    discount_percentage: number;
    start_date: Date;
    end_date: Date;
    label: string;
}

export interface IEvent extends Document {
    society_id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    event_date: Date;
    event_end_date?: Date;
    venue: string;
    event_type: 'WORKSHOP' | 'SEMINAR' | 'COMPETITION' | 'MEETUP' | 'CULTURAL' | 'SPORTS' | 'OTHER';
    banner?: string;
    max_participants?: number;
    registration_start_date?: Date;
    registration_deadline?: Date;
    registration_form?: mongoose.Types.ObjectId;   // references EventForm
    content_sections: Array<{
        title: string;
        content: string;
    }>;
    tags: string[];
    is_public: boolean;
    status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    created_by: mongoose.Types.ObjectId;
    price: number;
    discounts: IEventDiscount[];
    payment_info?: {
        acc_num: string;
        acc_holder_name: string;
        acc_destination: string;
    };
    created_at: Date;
    updated_at: Date;
}

const eventSchema = new Schema<IEvent>({
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
        type: String,
        required: true
    },
    event_date: {
        type: Date,
        required: true
    },
    event_end_date: {
        type: Date
    },
    venue: {
        type: String,
        required: true
    },
    event_type: {
        type: String,
        enum: ['WORKSHOP', 'SEMINAR', 'COMPETITION', 'MEETUP', 'CULTURAL', 'SPORTS', 'OTHER'],
        default: 'OTHER'
    },
    banner: {
        type: String
    },
    max_participants: {
        type: Number
    },
    registration_start_date: {
        type: Date
    },
    registration_deadline: {
        type: Date
    },
    registration_form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventForm'
    },
    content_sections: [{
        title: { type: String, required: true },
        content: { type: String, required: true }
    }],
    tags: [{ type: String, default: [] }],
    is_public: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
        default: 'DRAFT'
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    discounts: [{
        discount_percentage: { type: Number, required: true, min: 0, max: 100 },
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true },
        label: { type: String, required: true }
    }],
    payment_info: {
        acc_num: String,
        acc_holder_name: String,
        acc_destination: String
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// ✅ CRITICAL INDEXES FOR PRODUCTION PERFORMANCE
// Primary indexes for common queries
eventSchema.index({ event_date: 1, status: 1 });           // Event listing by date
eventSchema.index({ society_id: 1, status: 1 });           // Society events
eventSchema.index({ status: 1, is_public: 1 });            // Public events filter
eventSchema.index({ created_by: 1, created_at: -1 });      // User's events
eventSchema.index({ is_public: 1, status: 1, event_date: -1 });  // Homepage feed

// Text search index (prevents ReDoS attacks)
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Compound index for common queries
eventSchema.index({
    is_public: 1,
    status: 1,
    event_type: 1,
    event_date: -1
});

import { invalidateCache } from '../util/cache';

eventSchema.post('save', function() {
  invalidateCache('events');
});
eventSchema.post('findOneAndUpdate', function() {
  invalidateCache('events');
});
eventSchema.post('findOneAndDelete', function() {
  invalidateCache('events');
});
eventSchema.post('updateOne', function() {
  invalidateCache('events');
});
eventSchema.post('deleteOne', function() {
  invalidateCache('events');
});

export default mongoose.model<IEvent>('Event', eventSchema);
