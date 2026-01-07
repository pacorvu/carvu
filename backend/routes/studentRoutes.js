const express = require('express');
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getMajors, getMinors, getSpecializations } = require('../controllers/studentController');

const router = express.Router();

// Public meta endpoints for registration
router.get('/meta/majors', getMajors);
router.get('/meta/minors', getMinors);
router.get('/meta/specializations', getSpecializations);
// Additional explicit public path to avoid any param-route collisions
router.get('/public/meta/majors', getMajors);
router.get('/public/meta/minors', getMinors);
router.get('/public/meta/specializations', getSpecializations);

router.get('/:usn/:section', authenticateToken, studentController.getSection);
router.post('/:usn/:section', authenticateToken, studentController.saveSection);

module.exports = router;
