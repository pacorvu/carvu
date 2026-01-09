const express = require('express');
const cookieParser = require('cookie-parser');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(cookieParser());

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/verify-usn', authController.verifyUsn);
router.post('/register-student', authController.registerStudent);
router.post('/register/send-otp', authController.sendRegistrationOtp);
router.post('/register/verify-otp', authController.verifyRegistrationOtp);
router.post('/register/send-personal-otp', authController.sendPersonalOtp);
router.post('/register/verify-personal-otp', authController.verifyPersonalOtp);

module.exports = router;
