const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getAllCompanies, getCompanyById } = require('../../controllers/placement/companyController');

router.get('/', authenticateToken, getAllCompanies);
router.get('/:id', authenticateToken, getCompanyById);

module.exports = router;
