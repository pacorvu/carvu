const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getAllUsers } = require('../../controllers/placement/userController');

router.get('/', authenticateToken, getAllUsers);

module.exports = router;
