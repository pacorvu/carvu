const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getTrainings, updateTrainings } = require('../../controllers/student/trainingsController');

router.get('/:usn/trainings', authenticateToken, getTrainings);
router.post('/:usn/trainings', authenticateToken, updateTrainings);

module.exports = router;
