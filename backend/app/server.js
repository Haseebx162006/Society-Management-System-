// doing this import env constants in system
require("dotenv").config()
const app= require('./app')
const db= require('./src/db/db')

db()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


