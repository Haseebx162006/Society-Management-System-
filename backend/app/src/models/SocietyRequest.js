const mongoose= require('mongoose')

const societyRequestSchema= mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    society_name:{
        type:String,
        required:true,
        unqiue:true
    },
    status:{
        type:String,
        enum:["APPROVED","PENDING","REJECTED"],
        default:"PENDING"
    },
    rejection_reason:{
        type:String,

    },
    created_at: {
        type:Date,
        default:Date.now()
    }

})

module.exports= mongoose.model("SocietyRequest",societyRequestSchema)