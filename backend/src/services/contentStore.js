const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SKILLS_FILE = path.join(DATA_DIR, 'skills.json');

function ensure(file, fallback) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
}

function read(file, fallback = []) {
  ensure(file, fallback);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function write(file, data) {
  ensure(file, []);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ---------- Projects ---------- */
function getProjects() {
  return read(PROJECTS_FILE, []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function getProject(id) {
  return getProjects().find((p) => p.id === id) || null;
}

function createProject(data) {
  const list = read(PROJECTS_FILE, []);
  const project = {
    id: uuidv4(),
    title: data.title || 'Untitled',
    description: data.description || '',
    category: data.category || 'web',
    tech: Array.isArray(data.tech) ? data.tech : (data.tech || '').split(',').map((t) => t.trim()).filter(Boolean),
    image: data.image || null,
    video: data.video || null,
    github: data.github || null,
    live: data.live || null,
    featured: !!data.featured,
    order: list.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.push(project);
  write(PROJECTS_FILE, list);
  return project;
}

function updateProject(id, data) {
  const list = read(PROJECTS_FILE, []);
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const allowed = ['title', 'description', 'category', 'tech', 'image', 'video', 'github', 'live', 'featured', 'order'];
  allowed.forEach((k) => {
    if (data[k] !== undefined) {
      if (k === 'tech' && typeof data[k] === 'string') {
        list[idx][k] = data[k].split(',').map((t) => t.trim()).filter(Boolean);
      } else {
        list[idx][k] = data[k];
      }
    }
  });
  list[idx].updatedAt = new Date().toISOString();
  write(PROJECTS_FILE, list);
  return list[idx];
}

function deleteProject(id) {
  const list = read(PROJECTS_FILE, []);
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  write(PROJECTS_FILE, next);
  return true;
}

function reorderProjects(ids) {
  const list = read(PROJECTS_FILE, []);
  ids.forEach((id, i) => {
    const p = list.find((x) => x.id === id);
    if (p) p.order = i;
  });
  write(PROJECTS_FILE, list);
  return getProjects();
}

/* ---------- Skills ---------- */
function getSkills() {
  return read(SKILLS_FILE, []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function getSkill(id) {
  return getSkills().find((s) => s.id === id) || null;
}

function createSkill(data) {
  const list = read(SKILLS_FILE, []);
  const skill = {
    id: uuidv4(),
    name: data.name || 'Skill',
    category: data.category || 'Other',
    description: data.description || '',
    icon: data.icon || null,
    tags: Array.isArray(data.tags) ? data.tags : (data.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    order: list.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.push(skill);
  write(SKILLS_FILE, list);
  return skill;
}

function updateSkill(id, data) {
  const list = read(SKILLS_FILE, []);
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const allowed = ['name', 'category', 'description', 'icon', 'tags', 'order'];
  allowed.forEach((k) => {
    if (data[k] !== undefined) {
      if (k === 'tags' && typeof data[k] === 'string') {
        list[idx][k] = data[k].split(',').map((t) => t.trim()).filter(Boolean);
      } else {
        list[idx][k] = data[k];
      }
    }
  });
  list[idx].updatedAt = new Date().toISOString();
  write(SKILLS_FILE, list);
  return list[idx];
}

function deleteSkill(id) {
  const list = read(SKILLS_FILE, []);
  const next = list.filter((s) => s.id !== id);
  if (next.length === list.length) return false;
  write(SKILLS_FILE, next);
  return true;
}


const TESTIMONIALS_FILE = path.join(DATA_DIR, 'testimonials.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

/* ---------- Testimonials ---------- */
function getTestimonials() {
  return read(TESTIMONIALS_FILE, []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
function getTestimonial(id) {
  return getTestimonials().find((t) => t.id === id) || null;
}
function createTestimonial(data) {
  const list = read(TESTIMONIALS_FILE, []);
  const item = {
    id: uuidv4(),
    name: data.name || 'Anonymous',
    role: data.role || '',
    company: data.company || '',
    quote: data.quote || '',
    avatar: data.avatar || null,
    status: data.status || 'pending', // pending | approved | rejected
    order: list.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.push(item);
  write(TESTIMONIALS_FILE, list);
  return item;
}
function updateTestimonial(id, data) {
  const list = read(TESTIMONIALS_FILE, []);
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  ['name','role','company','quote','avatar','status','order'].forEach((k) => {
    if (data[k] !== undefined) list[idx][k] = data[k];
  });
  list[idx].updatedAt = new Date().toISOString();
  write(TESTIMONIALS_FILE, list);
  return list[idx];
}
function deleteTestimonial(id) {
  const list = read(TESTIMONIALS_FILE, []);
  const next = list.filter((t) => t.id !== id);
  if (next.length === list.length) return false;
  write(TESTIMONIALS_FILE, next);
  return true;
}

/* ---------- Blog posts ---------- */
function getPosts({ status } = {}) {
  let list = read(POSTS_FILE, []);
  if (status) list = list.filter((p) => p.status === status);
  return list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}
function getPost(id) {
  return read(POSTS_FILE, []).find((p) => p.id === id) || null;
}
function createPost(data) {
  const list = read(POSTS_FILE, []);
  const now = new Date().toISOString();
  const post = {
    id: uuidv4(),
    title: data.title || 'Untitled',
    slug: data.slug || (data.title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    excerpt: data.excerpt || '',
    content: data.content || '',
    coverImage: data.coverImage || null,
    status: data.status || 'draft', // draft | published | scheduled
    scheduledAt: data.scheduledAt || null,
    tags: Array.isArray(data.tags) ? data.tags : (data.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    createdAt: now,
    updatedAt: now,
    publishedAt: data.status === 'published' ? now : null,
  };
  list.push(post);
  write(POSTS_FILE, list);
  return post;
}
function updatePost(id, data) {
  const list = read(POSTS_FILE, []);
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const allowed = ['title','slug','excerpt','content','coverImage','status','scheduledAt','tags'];
  allowed.forEach((k) => {
    if (data[k] !== undefined) {
      if (k === 'tags' && typeof data[k] === 'string') {
        list[idx][k] = data[k].split(',').map((t) => t.trim()).filter(Boolean);
      } else {
        list[idx][k] = data[k];
      }
    }
  });
  list[idx].updatedAt = new Date().toISOString();
  if (data.status === 'published' && !list[idx].publishedAt) {
    list[idx].publishedAt = new Date().toISOString();
  }
  write(POSTS_FILE, list);
  return list[idx];
}
function deletePost(id) {
  const list = read(POSTS_FILE, []);
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  write(POSTS_FILE, next);
  return true;
}

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
