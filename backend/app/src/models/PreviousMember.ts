import mongoose, { Document, Schema } from 'mongoose';

// ─── Previous Member: stores emails of past society members ──────────────────
// When a user submits a join form with a matching email, they are auto-approved.

export interface IPreviousMember extends Document {
    society_id: mongoose.Types.ObjectId;
    email: string;
    has_account: boolean;
    uploaded_by: mongoose.Types.ObjectId;
    created_at: Date;
}

const previousMemberSchema = new Schema<IPreviousMember>({
    society_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    has_account: {
        type: Boolean,
        default: false
    },
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// One email per society — prevent duplicates
previousMemberSchema.index({ society_id: 1, email: 1 }, { unique: true });

export default mongoose.model<IPreviousMember>('PreviousMember', previousMemberSchema);
