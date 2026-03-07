import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ISociety } from './Society';

export interface IDocumentation extends Document {
    title: string;
    description?: string;
    fileUrl: string;
    societyId: mongoose.Types.ObjectId | ISociety;
    uploadedBy: mongoose.Types.ObjectId | IUser;
    uploadedAt: Date;
}

const documentationSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model<IDocumentation>('Documentation', documentationSchema);
