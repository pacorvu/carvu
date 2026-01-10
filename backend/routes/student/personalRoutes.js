const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getPersonal, updatePersonal } = require('../../controllers/student/personalController');

router.get('/:usn/personal', authenticateToken, getPersonal);
router.post('/:usn/personal', authenticateToken, updatePersonal);

module.exports = router;
