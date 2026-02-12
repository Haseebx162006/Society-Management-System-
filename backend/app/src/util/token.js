const jwt = require ('jsonwebtoken')
const token_generate= async(id)=>{
    try {
        return jwt.sign(id,process.env.PRIVATE_KEY),{
            expiresIn:"7d"
        }
    } catch (error) {
        console.error("Error in the creation of token")
    }
}

module.exports=token_generate