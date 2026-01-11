const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { 
  getStudentProcess, 
  getStudentOffers, 
  getAllJobOffers, 
  addJobOffer 
} = require('../../controllers/placement/jobOfferController');

// Be careful with route ordering
router.get('/job-offers', authenticateToken, getAllJobOffers);
router.post('/job-offers', authenticateToken, addJobOffer);
router.get('/process/:usn', authenticateToken, getStudentProcess);
router.get('/offers/:usn', authenticateToken, getStudentOffers);

module.exports = router;
