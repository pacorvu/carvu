const express = require('express');
const router = express.Router();

const metaRoutes = require('./student/metaRoutes');
const personalRoutes = require('./student/personalRoutes');
const contactRoutes = require('./student/contactRoutes');
const familyRoutes = require('./student/familyRoutes');
const careerRoutes = require('./student/careerRoutes');
const educationRoutes = require('./student/educationRoutes');
const academicsRoutes = require('./student/academicsRoutes');
const projectsRoutes = require('./student/projectsRoutes');
const internshipsRoutes = require('./student/internshipsRoutes');
const trainingsRoutes = require('./student/trainingsRoutes');
const publicationsRoutes = require('./student/publicationsRoutes');
const otherExperiencesRoutes = require('./student/otherExperiencesRoutes');
const certificationsRoutes = require('./student/certificationsRoutes');
const extraCurricularRoutes = require('./student/extraCurricularRoutes');
const resumeRoutes = require('./student/resumeRoutes');

// Mount all routers
router.use('/', metaRoutes);
router.use('/', personalRoutes);
router.use('/', contactRoutes);
router.use('/', familyRoutes);
router.use('/', careerRoutes);
router.use('/', educationRoutes);
router.use('/', academicsRoutes);
router.use('/', projectsRoutes);
router.use('/', internshipsRoutes);
router.use('/', trainingsRoutes);
router.use('/', publicationsRoutes);
router.use('/', otherExperiencesRoutes);
router.use('/', certificationsRoutes);
router.use('/', extraCurricularRoutes);
router.use('/', resumeRoutes);

module.exports = router;
