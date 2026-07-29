const express = require('express');
const path = require('path');
const multer = require('multer');
const { adminAuth } = require('../middleware/adminAuth');
const c = require('../controllers/contentController');
const profile = require('../controllers/profileController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads'),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, Date.now() + '-' + safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^(image|video)\//.test(file.mimetype) || file.mimetype === 'application/pdf';
    cb(ok ? null : new Error('Only images and videos allowed'), ok);
  },
});

// Optional auth: attach user if token present (for public vs admin filtering)
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return next();
  try {
    const { verifyToken } = require('../utils/tokens');
    const { findById } = require('../services/userStore');
    const payload = verifyToken(token);
    if (payload?.sub) {
      const user = findById(payload.sub);
      if (user) req.user = { id: user.id, email: user.email, role: user.role };
    }
  } catch (_) {}
  next();
}

// Public + admin read
router.get('/projects', c.listProjects);
router.get('/skills', c.listSkills);
router.get('/testimonials', optionalAuth, c.listTestimonials);
router.get('/posts', optionalAuth, c.listPosts);
router.get('/profile', profile.readProfile);
router.get('/posts/:id', optionalAuth, c.getOnePost);

// Admin write
router.post('/projects', adminAuth, c.addProject);
router.get('/projects/:id', adminAuth, c.getOneProject);
router.patch('/projects/:id', adminAuth, c.editProject);
router.delete('/projects/:id', adminAuth, c.removeProject);
router.post('/projects/reorder', adminAuth, c.reorder);

router.post('/skills', adminAuth, c.addSkill);
router.get('/skills/:id', adminAuth, c.getOneSkill);
router.patch('/skills/:id', adminAuth, c.editSkill);
router.delete('/skills/:id', adminAuth, c.removeSkill);

router.post('/testimonials', adminAuth, c.addTestimonial);
router.patch('/testimonials/:id', adminAuth, c.editTestimonial);
router.delete('/testimonials/:id', adminAuth, c.removeTestimonial);

router.post('/posts', adminAuth, c.addPost);
router.patch('/posts/:id', adminAuth, c.editPost);
router.delete('/posts/:id', adminAuth, c.removePost);

router.post('/upload', adminAuth, upload.single('file'), c.uploadFile);

router.patch('/profile', adminAuth, profile.saveProfile);
router.post('/profile/portrait', adminAuth, upload.single('file'), profile.uploadPortrait);
router.post('/profile/cv', adminAuth, upload.single('file'), profile.uploadCv);

module.exports = router;
