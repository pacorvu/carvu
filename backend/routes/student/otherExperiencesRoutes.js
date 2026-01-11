const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getOtherExperiences, updateOtherExperiences } = require('../../controllers/student/otherExperiencesController');

router.get('/:usn/other-experiences', authenticateToken, getOtherExperiences);
router.post('/:usn/other-experiences', authenticateToken, updateOtherExperiences);

module.exports = router;
