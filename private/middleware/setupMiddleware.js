const express = require('express')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
const path = require('path')

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas peticiones, por favor intente de nuevo más tarde.'
})

function setupMiddleware(app, trustProxyAddress) {
    app.set('trust proxy', trustProxyAddress)
    app.use(limiter)
    app.use(express.json())
    app.use(cookieParser())
}

module.exports = { setupMiddleware }
