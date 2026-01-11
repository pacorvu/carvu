const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getAllDrives, getDriveById, registerForDrive, createDrive, updateDrive } = require('../../controllers/placement/driveController');

router.get('/', authenticateToken, getAllDrives);
router.post('/', authenticateToken, createDrive);
router.put('/:id', authenticateToken, updateDrive);
router.get('/:id', authenticateToken, getDriveById);
router.post('/register', authenticateToken, registerForDrive); // Note: path relative to mount

module.exports = router;
