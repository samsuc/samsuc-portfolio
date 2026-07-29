const {
  getProjects, getProject, createProject, updateProject, deleteProject, reorderProjects,
  getSkills, getSkill, createSkill, updateSkill, deleteSkill,
  getTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial,
  getPosts, getPost, createPost, updatePost, deletePost,
} = require('../services/contentStore');

/* Projects */
function listProjects(req, res) {
  res.json({ success: true, projects: getProjects() });
}
function getOneProject(req, res) {
  const p = getProject(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, project: p });
}
function addProject(req, res) {
  res.status(201).json({ success: true, project: createProject(req.body || {}) });
}
function editProject(req, res) {
  const project = updateProject(req.params.id, req.body || {});
  if (!project) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, project });
}
function removeProject(req, res) {
  if (!deleteProject(req.params.id)) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true });
}
function reorder(req, res) {
  const ids = req.body.ids;
  if (!Array.isArray(ids)) return res.status(400).json({ success: false, message: 'ids array required' });
  res.json({ success: true, projects: reorderProjects(ids) });
}

/* Skills */
function listSkills(req, res) {
  res.json({ success: true, skills: getSkills() });
}
function getOneSkill(req, res) {
  const s = getSkill(req.params.id);
  if (!s) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, skill: s });
}
function addSkill(req, res) {
  res.status(201).json({ success: true, skill: createSkill(req.body || {}) });
}
function editSkill(req, res) {
  const skill = updateSkill(req.params.id, req.body || {});
  if (!skill) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, skill });
}
function removeSkill(req, res) {
  if (!deleteSkill(req.params.id)) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true });
}

/* Testimonials */
function listTestimonials(req, res) {
  const status = req.query.status;
  let list = getTestimonials();
  if (status) list = list.filter((t) => t.status === status);
  // Public only sees approved
  if (!req.user) list = list.filter((t) => t.status === 'approved');
  res.json({ success: true, testimonials: list });
}
function addTestimonial(req, res) {
  res.status(201).json({ success: true, testimonial: createTestimonial(req.body || {}) });
}
function editTestimonial(req, res) {
  const t = updateTestimonial(req.params.id, req.body || {});
  if (!t) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, testimonial: t });
}
function removeTestimonial(req, res) {
  if (!deleteTestimonial(req.params.id)) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true });
}

/* Blog */
function listPosts(req, res) {
  const status = req.query.status;
  // Public: only published (and scheduled that are due)
  if (!req.user) {
    const now = new Date();
    const list = getPosts().filter((p) => {
      if (p.status === 'published') return true;
      if (p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt) <= now) return true;
      return false;
    });
    return res.json({ success: true, posts: list });
  }
  res.json({ success: true, posts: getPosts({ status }) });
}
function getOnePost(req, res) {
  const post = getPost(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Not found' });
  if (!req.user && post.status !== 'published') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  res.json({ success: true, post });
}
function addPost(req, res) {
  res.status(201).json({ success: true, post: createPost(req.body || {}) });
}
function editPost(req, res) {
  const post = updatePost(req.params.id, req.body || {});
  if (!post) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, post });
}
function removePost(req, res) {
  if (!deletePost(req.params.id)) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true });
}

/* Upload */
function uploadFile(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: '/uploads/' + req.file.filename, filename: req.file.filename });
}

module.exports = {
  listProjects, getOneProject, addProject, editProject, removeProject, reorder,
  listSkills, getOneSkill, addSkill, editSkill, removeSkill,
  listTestimonials, addTestimonial, editTestimonial, removeTestimonial,
  listPosts, getOnePost, addPost, editPost, removePost,
  uploadFile,
};
