import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ISociety } from './Society';

export interface IGroup extends Document {
    society_id: mongoose.Types.ObjectId | ISociety;
    name: string;
    description?: string;
    created_by: mongoose.Types.ObjectId | IUser;
    created_at: Date;
    updated_at: Date;
}

const groupSchema: Schema = new Schema({
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
});

groupSchema.index({ society_id: 1, name: 1 }, { unique: true, background: true });export default mongoose.model<IGroup>("Group", groupSchema);
