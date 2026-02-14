const mongoose = require('mongoose')

exports.groupSchema= mongoose.Schema({
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
    name:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    created_at:{
        type:Date,
        default:Date.now()
    },
    updated_at:{
        type:Date,
        default:Date.now()
    }
})