const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getContact, updateContact } = require('../../controllers/student/contactController');

router.get('/:usn/contact', authenticateToken, getContact);
router.post('/:usn/contact', authenticateToken, updateContact);

module.exports = router;
