const mongoose= require('mongoose')

const societyUserRolesSchema= mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    society_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Society',
        required:true
    },
    role:{
        type:String,
        enum:["PRESIDENT","LEAD","CO-LEAD","GENERAL SECRETARY","MEMBER"],
        default:"MEMBER"
    },
    group_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Group',
        default:null
    },
    assigned_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true

    },

    assigned_at:{
        type:Date,
        default:Date.now()
    },
    updated_at:{
        type:Date,
        default:Date.now()
    }
    
})