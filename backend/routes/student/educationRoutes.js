const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getEducation, updateEducation } = require('../../controllers/student/educationController');

router.get('/:usn/education', authenticateToken, getEducation);
router.post('/:usn/education', authenticateToken, updateEducation);

module.exports = router;
