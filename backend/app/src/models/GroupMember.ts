import mongoose, { Document, Schema } from 'mongoose';
import { IGroup } from './Group';
import { IUser } from './User';
import { ISociety } from './Society';

export interface IGroupMember extends Document {
    group_id: mongoose.Types.ObjectId | IGroup;
    user_id: mongoose.Types.ObjectId | IUser;
    society_id: mongoose.Types.ObjectId | ISociety;
    joined_at: Date;
}

const groupMemberSchema: Schema = new Schema({
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
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
    joined_at: {
        type: Date,
        default: Date.now
    }
});

groupMemberSchema.index({ group_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model<IGroupMember>("GroupMember", groupMemberSchema);
