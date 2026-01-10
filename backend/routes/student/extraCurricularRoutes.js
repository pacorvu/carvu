const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getExtraCurricular, updateExtraCurricular } = require('../../controllers/student/extraCurricularController');

router.get('/:usn/extraCurricular', authenticateToken, getExtraCurricular);
router.post('/:usn/extraCurricular', authenticateToken, updateExtraCurricular);

module.exports = router;
