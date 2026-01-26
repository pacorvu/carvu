const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getAllStudents, promoteStudents, updateStudentEligibility } = require('../../controllers/placement/studentController');
const { getPlacementOverview } = require('../../controllers/placement/overviewController');

router.get('/', authenticateToken, getAllStudents);
router.get('/overview', authenticateToken, getPlacementOverview);
router.post('/promote', authenticateToken, promoteStudents);
router.put('/:usn/eligibility', authenticateToken, updateStudentEligibility);

module.exports = router;
