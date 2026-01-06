const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  getAllDrives,
  getDriveById,
  getStudentProcess,
  registerForDrive,
  getStudentOffers,
  getAllStudents,
  getAllUsers
} = require('../controllers/placementController');
const { authenticateToken } = require('../middleware/authMiddleware');

// User Management
router.get('/users', authenticateToken, getAllUsers);

// Company routes
router.get('/companies', authenticateToken, getAllCompanies);
router.get('/companies/:id', authenticateToken, getCompanyById);

// Drive routes
router.get('/drives', authenticateToken, getAllDrives);
router.get('/drives/:id', authenticateToken, getDriveById);
router.post('/register', authenticateToken, registerForDrive);

// Student Process & Offers
router.get('/students', authenticateToken, getAllStudents);
router.get('/process/:usn', authenticateToken, getStudentProcess);
router.get('/offers/:usn', authenticateToken, getStudentOffers);

module.exports = router;
