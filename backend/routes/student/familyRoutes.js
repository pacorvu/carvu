const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getFamily, updateFamily } = require('../../controllers/student/familyController');

router.get('/:usn/family', authenticateToken, getFamily);
router.post('/:usn/family', authenticateToken, updateFamily);

module.exports = router;
