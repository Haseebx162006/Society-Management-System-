import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ISociety } from './Society';

export interface IGroup extends Document {
    user_id: mongoose.Types.ObjectId | IUser;
    society_id: mongoose.Types.ObjectId | ISociety;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

const groupSchema: Schema = new Schema({
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
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
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

export default mongoose.model<IGroup>("Group", groupSchema);
