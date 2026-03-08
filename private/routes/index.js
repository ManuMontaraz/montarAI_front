const express = require('express')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const router = express.Router()
const path = require('path')

const authRoutes = require('./auth')
const pageRoutes = require('./pages')

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas peticiones, por favor intente de nuevo más tarde.'
})

router.use(limiter)
router.use(cookieParser())
router.use('/', pageRoutes)
router.use('/api/auth', authRoutes)
router.use(express.static(path.join(__dirname, '..', '..', 'public')))

module.exports = router
