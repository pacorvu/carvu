const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getAllAlumni, addAlumni, getAlumniByUsn, promoteStudents, getEligibleForPromotion, generateRegistrationCode, getRegistrationCodes, deleteRegistrationCode } = require('../../controllers/placement/alumniController');

router.get('/codes', authenticateToken, getRegistrationCodes);
router.post('/codes', authenticateToken, generateRegistrationCode);
router.delete('/codes/:id', authenticateToken, deleteRegistrationCode);

router.get('/', authenticateToken, getAllAlumni);
router.get('/eligible', authenticateToken, getEligibleForPromotion);
router.post('/', authenticateToken, addAlumni);
router.post('/promote', authenticateToken, promoteStudents);
router.get('/:usn', authenticateToken, getAlumniByUsn);

module.exports = router;
