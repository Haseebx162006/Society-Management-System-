const express = require('express');
const app= express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

const auth_routs= require('./src/routes/authroutes')

app.get("/",function(req,res){
    return res.send("Hello How are you")
})

app.use('/api/auth',auth_routs)

module.exports= app