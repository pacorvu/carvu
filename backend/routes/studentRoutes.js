const express = require('express');
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:usn/:section', authenticateToken, studentController.getSection);
router.post('/:usn/:section', authenticateToken, studentController.saveSection);

module.exports = router;
