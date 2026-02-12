const User= require('../controllers/authcontroller')
const becrypt= require('bcrypt')
const token_generate= require('../util/token')
exports.signup = async(req,res)=>{
    try {
        const{name, email , password}= req.body

        // here i will do the validation of the data coming from the frontend
        if(!name || typeof name !== "string"){
            return res.status(400).json({
                msg:"Invalid name"
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


        if(!email || typeof email !== "string"){
            return res.status(400).json({
                msg:"Invalid email"
            })
        }
        if(!emailRegex.test(email)){
            return res.status(400).json({
                msg:"Invalid email"
            })
        }
        // Now password will be verified

        if(!password || typeof password !== "string"){
            return res.status(400).json({
                msg:"Invalid password"
            })
        }
        if(password.length < 6){
            return res.status(400).json({
                msg:"Password must be at least 6 characters long"
            })
        }

        const userFind= await User.findOne({email})

        if(email){
            res.status(400).json({
                msg:"User already exists with this email check another one"
            })
        }

        const hashed_password= await becrypt.hash(password)
        const user = await User.create({name:name, email:email, password:hashed_password})

        return res.status(201).json({
            msg:"User is created"
        })
            
    } catch (error) {
        res.status(500).json({
            msg:"Error in the first try catch block of signup"
        })
    }
}

exports.login= async(req,res)=>{
    try {
        const {email, password} = req.body
         if(!name || typeof name !== "string"){
            return res.status(400).json({
                msg:"Invalid name"
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if(!email || typeof email !== "string"){
            return res.status(400).json({
                msg:"Invalid email"
            })
        }
        if(!emailRegex.test(email)){
            return res.status(400).json({
                msg:"Invalid email"
            })
        }
        // Now password will be verified

        if(!password || typeof password !== "string"){
            return res.status(400).json({
                msg:"Invalid password"
            })
        }
        if(password.length < 6){
            return res.status(400).json({
                msg:"Password must be at least 6 characters long"
            })
        }

        const finduser= await User.findOne({email})

        if(!finduser){
            return res.status(404).json({
                msg:"User does not exist. Signup first and then login"
            })
        }
        const password_match= 



    } catch (error) {
        res.status(500).json({
            msg:"Error in the try catch block of login"
        })
    }
}