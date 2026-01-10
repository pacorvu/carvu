const express = require('express');
const router = express.Router();
const { getMajors, getMinors, getSpecializations } = require('../../controllers/student/metaController');

// Public meta endpoints
router.get('/meta/majors', getMajors);
router.get('/meta/minors', getMinors);
router.get('/meta/specializations', getSpecializations);

// Alias for public prefix
router.get('/public/meta/majors', getMajors);
router.get('/public/meta/minors', getMinors);
router.get('/public/meta/specializations', getSpecializations);

module.exports = router;
