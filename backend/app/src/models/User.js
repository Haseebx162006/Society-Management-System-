const mongoose= require('mongoose')

const userSchema= mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["ACTIVE", "INACTIVE", "SUSPENDED", "IMPORTED"],
        default:"ACTIVE"
    },
    email_verified:{
        type:Boolean,
        default:false
    },
    is_active:{
        type:Boolean,
        default:true
    },
    password_reset_required:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum:["SuperAdmin","President","Lead","Co-Lead","Member"],
        default:"Member"
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

module.exports= mongoose.Model("User",userSchema)