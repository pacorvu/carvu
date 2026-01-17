const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getFullProfile } = require('../../controllers/student/resumeController');

router.get('/:usn/full', authenticateToken, getFullProfile);

module.exports = router;
