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
        enum:["ACTIVE","SUSPENDED","DELETED"],
        default:"ACTIVE"
    },
    created_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    created_at:{
        type:Date,
        default:Date.now(),
    },
    updated_at:{
        type:Date,
        default:Date.now()
    }
})
module.exports= mongoose.model("Society",societySchema)