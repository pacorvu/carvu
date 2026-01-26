const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = path.join(__dirname, '..', '..', 'public', 'uploads');
    const folder = (req.body.folder || req.query.folder || '').toString().trim();
    const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '');
    const targetDir = safeFolder ? path.join(baseDir, safeFolder) : baseDir;
    fs.mkdirSync(targetDir, { recursive: true });
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const rawUsn = (req.params.usn || '').toString().trim().toUpperCase();
    const safeUsn = rawUsn.replace(/[^A-Z0-9]/g, '') || 'UNKNOWN';
    const folder = (req.body.folder || req.query.folder || '').toString().trim().toLowerCase();
    const safeType = (folder || 'file').replace(/[^a-z0-9_-]/g, '') || 'file';
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const name = `${safeUsn}-${safeType}-${timestamp}-${random}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post('/:usn/files/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    const tokenUsn = (req.user?.usn || '').toString().trim().toUpperCase();
    const paramUsn = (req.params.usn || '').toString().trim().toUpperCase();
    const isOwner = tokenUsn && tokenUsn === paramUsn;
    const rawRole = req.user?.role_name || req.user?.role;
    const role = (rawRole || '').toString().toLowerCase().trim();
    const allowedRoles = [
      'admin',
      'superadmin',
      'sudo_admin',
      'placement_director',
      'placement_officers',
      'placement_officer',
      'placement officer'
    ];
    const isAdmin = allowedRoles.includes(role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized file upload' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const folder = (req.body.folder || req.query.folder || '').toString().trim();
    const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '');
    const folderSegment = safeFolder ? `/${safeFolder}` : '';
    const urlPath = `/uploads${folderSegment}/${req.file.filename}`.replace(/\\/g, '/');
    const fullUrl = `${req.protocol}://${req.get('host')}${urlPath}`;
    return res.json({
      url: fullUrl,
      path: urlPath,
      fileName: req.file.filename
    });
  } catch (e) {
    console.error('File upload error:', e);
    return res.status(500).json({ error: 'File upload failed' });
  }
});

module.exports = router;
