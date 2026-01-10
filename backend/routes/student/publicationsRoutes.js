const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getPublications, updatePublications } = require('../../controllers/student/publicationsController');

router.get('/:usn/publications', authenticateToken, getPublications);
router.post('/:usn/publications', authenticateToken, updatePublications);

module.exports = router;
