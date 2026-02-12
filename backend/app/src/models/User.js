const mongoose= require('mongoose')
const bcrypt= require('bcrypt')
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
userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return
    }
    const salt= await bcrypt.genSalt(10)
    this.password= await bcrypt.hash(this.password,salt)

})
userSchema.methods.matchpassword= async function (enterpassword) {
    return await bcrypt.compare(enterpassword,this.password)
}

module.exports= mongoose.model("User",userSchema)