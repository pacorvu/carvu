const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getCareer, updateCareer } = require('../../controllers/student/careerController');

router.get('/:usn/career', authenticateToken, getCareer);
router.post('/:usn/career', authenticateToken, updateCareer);

module.exports = router;
