const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getAllStudents } = require('../../controllers/placement/studentController');

router.get('/', authenticateToken, getAllStudents);

module.exports = router;
