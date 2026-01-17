const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getAcademics, updateAcademics } = require('../../controllers/student/academicsController');

router.get('/:usn/academics', authenticateToken, getAcademics);
router.post('/:usn/academics', authenticateToken, updateAcademics);

module.exports = router;
