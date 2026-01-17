const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getAllAlumni, addAlumni, getAlumniByUsn, promoteStudents } = require('../../controllers/placement/alumniController');

router.get('/', authenticateToken, getAllAlumni);
router.post('/', authenticateToken, addAlumni);
router.post('/promote', authenticateToken, promoteStudents);
router.get('/:usn', authenticateToken, getAlumniByUsn);

module.exports = router;
