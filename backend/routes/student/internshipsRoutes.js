const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getInternships, updateInternships } = require('../../controllers/student/internshipsController');

router.get('/:usn/internships', authenticateToken, getInternships);
router.post('/:usn/internships', authenticateToken, updateInternships);

module.exports = router;
