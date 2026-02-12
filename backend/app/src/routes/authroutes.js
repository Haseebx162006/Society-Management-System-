const express = require('express')
const router = express.Router()
const { signup, login } = require('../controllers/authcontroller')

const { protect, adminOnly } = require('../middleware/authmiddleware')


router.post('/login', login)
router.post('/signup', signup)

module.exports = router