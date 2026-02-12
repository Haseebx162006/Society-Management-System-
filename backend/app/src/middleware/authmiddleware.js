// This is auth middleware function which verifies the token
const jwt= require('jsonwebtoken')
const User= require('../models/User')
exports.protect= async(req,res,next)=>{
    let token;
    try {
        token_header= req.headers.authorization
        if(!token_header || !token_header.startsWith("Bearer ")){
             return res.status(401).json({
             msg:"Error in header of the token"
        })
        }
        token= token_header.split(" ")[1]
        const decode= jwt.verify(token,process.env.PRIVATE_KEY)
        req.user= await User.findById(decode.id).select("-password")
        return next()
    } catch (error) {
        return res.status(401).json({
            msg:"Error in verifiying the token"
        })
    }
}
exports.adminOnly= async(req,res,next)=>{
    try {
        if(req.user && req.user.role==="admin"){
            return next()
        }
        else{
             return res.status(403).json({
            msg:"You cant access admin roles"
        })
        }
    } catch (error) {
        return res.status(403).json({
            msg:"You cant access admin roles"
        })
    }
}