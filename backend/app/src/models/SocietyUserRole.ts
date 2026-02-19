import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ISociety } from './Society';

export interface ISocietyUserRole extends Document {
    name: string;
    user_id: mongoose.Types.ObjectId | IUser;
    society_id: mongoose.Types.ObjectId | ISociety;
    role: "PRESIDENT" | "LEAD" | "CO-LEAD" | "GENERAL SECRETARY" | "MEMBER" | "FINANCE MANAGER" | "EVENT MANAGER";
    group_id?: mongoose.Types.ObjectId;
    assigned_by: mongoose.Types.ObjectId | IUser;
    assigned_at: Date;
    updated_at: Date;
}

const societyUserRolesSchema: Schema = new Schema({
    name: {
        type: String,
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
    role: {
        type: String,
        enum: ["PRESIDENT", "LEAD", "CO-LEAD", "GENERAL SECRETARY", "MEMBER", "FINANCE MANAGER", "EVENT MANAGER"],
        default: "MEMBER"
    },
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    assigned_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },

    assigned_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model<ISocietyUserRole>("SocietyUserRole", societyUserRolesSchema);
