const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getExtraCurricular, updateExtraCurricular } = require('../../controllers/student/extraCurricularController');

router.get('/:usn/extra-curricular', authenticateToken, getExtraCurricular);
router.post('/:usn/extra-curricular', authenticateToken, updateExtraCurricular);

module.exports = router;
