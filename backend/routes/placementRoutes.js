const express = require('express');
const router = express.Router();

const companyRoutes = require('./placement/companyRoutes');
const driveRoutes = require('./placement/driveRoutes');
const jobOfferRoutes = require('./placement/jobOfferRoutes');
const studentRoutes = require('./placement/studentRoutes');
const userRoutes = require('./placement/userRoutes');
const alumniRoutes = require('./placement/alumniRoutes');
const policyRoutes = require('./placement/policyRoutes');
const projectRoutes = require('./placement/projectRoutes');

// Mount routes
// Note: The main server.js mounts this file at /placement
router.use('/companies', companyRoutes); // /placement/companies
router.use('/drives', driveRoutes); // /placement/drives
router.use('/students', studentRoutes); // /placement/students
router.use('/users', userRoutes); // /placement/users
router.use('/alumni', alumniRoutes); // /placement/alumni
router.use('/policies', policyRoutes); // /placement/policies
router.use('/projects', projectRoutes); // /placement/projects

// Job Offers and Student Process/Offers routes were mixed in the root or specific paths
// jobOfferRoutes handles:
// /job-offers -> /placement/job-offers
// /process/:usn -> /placement/process/:usn
// /offers/:usn -> /placement/offers/:usn
router.use('/', jobOfferRoutes); 

// Note: /placement/register was in placementRoutes.js. 
// In driveRoutes.js it is /register.
// But driveRoutes is mounted at /placement/drives.
// So now it is /placement/drives/register.
// THIS BREAKS FRONTEND if frontend uses /placement/register.
// I should verify where /register is mounted.
// In driveRoutes.js I put router.post('/register', ...)
// If I mount driveRoutes at /drives, it becomes /placement/drives/register.
// To keep /placement/register, I should perhaps mount it differently or add it here.

// Re-evaluating driveRoutes:
// It has getAllDrives ('/') -> /placement/drives
// getDriveById ('/:id') -> /placement/drives/:id
// registerForDrive ('/register') -> /placement/drives/register
// The original was /placement/register.
// To preserve /placement/register:
const { registerForDrive } = require('../controllers/placement/driveController');
const { authenticateToken } = require('../middleware/authMiddleware');
router.post('/register', authenticateToken, registerForDrive);

module.exports = router;
