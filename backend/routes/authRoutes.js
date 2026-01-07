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

module.exports = router;
