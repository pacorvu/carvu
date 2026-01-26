const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getProjects, updateProjects, incrementProjectStats } = require('../../controllers/student/projectsController');

router.get('/:usn/projects', authenticateToken, getProjects);
router.post('/:usn/projects', authenticateToken, updateProjects);
router.post('/projects/:projectId/stats', authenticateToken, incrementProjectStats);

module.exports = router;
