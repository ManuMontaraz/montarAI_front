const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', authController.logout)
router.post('/logout-all-devices', authController.logoutAllDevices)
router.get('/me', authController.getMe)

module.exports = router
