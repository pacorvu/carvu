const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getCertifications, updateCertifications } = require('../../controllers/student/certificationsController');

router.get('/:usn/certifications', authenticateToken, getCertifications);
router.post('/:usn/certifications', authenticateToken, updateCertifications);

module.exports = router;
