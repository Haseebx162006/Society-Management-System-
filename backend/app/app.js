const express = require('express');
const app= express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.get("/",function(req,res){
    return res.send("Hello How are you")
})

module.exports= app