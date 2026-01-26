
const express = require('express');
const router = express.Router();
const { getAllPolicies, upsertPolicy, applyPolicyToStudents, syncPolicies } = require('../../controllers/placement/policyController');
const { authenticateToken, authorizeRole } = require('../../middleware/authMiddleware');

// Only admins/placement team should access this
// Assuming roles are checked by string matching or similar in authorizeRole
// Adjust roles as per project convention (e.g., 'admin', 'placement_officer')
const allowedRoles = ['admin', 'superadmin', 'sudo_admin', 'placement_director', 'placement_officers', 'placement_officer'];

router.get('/', authenticateToken, authorizeRole(allowedRoles), getAllPolicies);
router.post('/', authenticateToken, authorizeRole(allowedRoles), upsertPolicy);
router.post('/sync', authenticateToken, authorizeRole(allowedRoles), syncPolicies);
router.post('/:id/apply', authenticateToken, authorizeRole(allowedRoles), applyPolicyToStudents);

module.exports = router;
