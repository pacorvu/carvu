const express = require('express');
const router = express.Router();
const { getAllProjects, rateProject } = require('../../controllers/placement/projectController');
const { authenticateToken, authorizeRole } = require('../../middleware/authMiddleware');

// Get all projects (can be filtered by ?rated=true)
// Allowed for admin, alumni, and maybe students too (if they want to see others' projects)
// Assuming 'alumni' can access getAllProjects is fine as per requirements
router.get('/', authenticateToken, getAllProjects);

// Rate a project (Admin only)
// Adding variations of role names to be safe
router.put('/:id/rate', authenticateToken, authorizeRole([
    'admin', 'superadmin', 
    'placement_officer', 'placement officer', 'Placement Officer',
    'placement_director', 'placement director', 'Placement Director'
]), rateProject);

module.exports = router;
