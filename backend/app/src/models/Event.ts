import mongoose, { Document, Schema } from 'mongoose';

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
    tags: [{ type: String }],
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
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

eventSchema.index({ society_id: 1, status: 1 });
eventSchema.index({ event_date: 1 });

export default mongoose.model<IEvent>('Event', eventSchema);
