const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getOtherExperiences, updateOtherExperiences } = require('../../controllers/student/otherExperiencesController');

router.get('/:usn/otherExperiences', authenticateToken, getOtherExperiences);
router.post('/:usn/otherExperiences', authenticateToken, updateOtherExperiences);

module.exports = router;
