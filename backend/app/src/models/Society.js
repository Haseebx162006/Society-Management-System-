const mongoose= require('mongoose')
const societySchema= mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["ACTIVE","SUSPENDED","DELETED"]
    },
    created_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
})