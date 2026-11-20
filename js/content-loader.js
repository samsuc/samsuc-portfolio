(function () {
  'use strict';

  const API = '/api/content';
  const colors = ['electric', 'cyan', 'softpurple'];

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function fetchJSON(path) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch(API + path, { signal: ctrl.signal });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  function renderSkills(skills) {
    const grid = document.getElementById('skills-grid');
    if (!grid) return;
    const loading = document.getElementById('skills-loading');
    if (loading) loading.remove();

    if (!skills || !skills.length) {
      grid.innerHTML = '<p class="col-span-full text-white/40 text-sm">Skills will appear here once added in the admin.</p>';
      return;
    }

    const accent = [
      { bg: 'bg-electric/10', border: 'border-electric/20', text: 'text-electric', grad: 'from-electric/10' },
      { bg: 'bg-cyan/10', border: 'border-cyan/20', text: 'text-cyan', grad: 'from-cyan/10' },
      { bg: 'bg-softpurple/10', border: 'border-softpurple/20', text: 'text-softpurple', grad: 'from-softpurple/10' },
    ];
    grid.innerHTML = skills
      .map((s, i) => {
        const a = accent[i % accent.length];
        const tags = (s.tags || [])
          .map((t) => `<span class="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10">${esc(t)}</span>`)
          .join('');
        const icon = s.icon
          ? `<img src="${esc(s.icon)}" alt="" class="w-6 h-6 object-contain" />`
          : `<span class="text-sm font-semibold">${esc((s.name || '?')[0])}</span>`;
        return `
          <div class="skill-card group relative p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-br ${a.grad} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="w-12 h-12 mb-5 rounded-2xl ${a.bg} border ${a.border} flex items-center justify-center ${a.text}">
                ${icon}
              </div>
              <h3 class="font-display text-xl font-semibold mb-2">${esc(s.name)}</h3>
              <p class="text-white/50 text-sm leading-relaxed mb-4">${esc(s.description)}</p>
              <div class="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">${tags}</div>
            </div>
          </div>`;
      })
      .join('');
  }

  function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    const loading = document.getElementById('projects-loading');
    if (loading) loading.remove();

    if (!projects || !projects.length) {
      grid.innerHTML = '<p class="col-span-full text-white/40 text-sm">Projects will appear here once added in the admin.</p>';
      return;
    }

    grid.innerHTML = projects
      .map((p, i) => {
        const num = String(i + 1).padStart(2, '0');
        const tech = (p.tech || [])
          .map((t) => `<span class="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">${esc(t)}</span>`)
          .join('');
        const cat = p.category || 'web';
        const img = p.image
          ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />`
          : `<div class="absolute inset-0 bg-gradient-to-br from-electric/20 via-navy to-softpurple/20"></div>
             <div class="absolute inset-0 flex items-center justify-center">
               <div class="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center">
                 <span class="text-4xl font-display font-bold text-white/20">${num}</span>
               </div>
             </div>`;
        const links = [
          p.live ? `<a href="${esc(p.live)}" class="project-demo magnetic-btn text-sm px-4 py-2 rounded-full border border-white/20 hover:border-electric/50 hover:bg-electric/10 transition-all">Live demo</a>` : '',
          p.github ? `<a href="${esc(p.github)}" class="text-sm px-4 py-2 rounded-full text-white/50 hover:text-white transition-colors">GitHub →</a>` : '',
        ].join('');

        return `
          <article class="project-card group relative rounded-3xl overflow-hidden border border-white/10 bg-navy/40" data-category="${esc(cat)}">
            <div class="aspect-[16/10] overflow-hidden relative">
              ${img}
              <div class="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-80 pointer-events-none"></div>
            </div>
            <div class="p-7">
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="text-[11px] px-2.5 py-1 rounded-full bg-electric/10 text-electric border border-electric/20">${esc(cat)}</span>
                ${tech}
              </div>
              <h3 class="font-display text-2xl font-semibold mb-2 group-hover:text-electric transition-colors">${esc(p.title)}</h3>
              <p class="text-white/50 text-sm leading-relaxed mb-6">${esc(p.description)}</p>
              <div class="flex gap-3 flex-wrap">${links}</div>
            </div>
          </article>`;
      })
      .join('');
  }

  function renderTestimonials(items) {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    const loading = document.getElementById('testimonials-loading');
    if (loading) loading.remove();

    if (!items || !items.length) {
      grid.innerHTML = '<p class="col-span-full text-center text-white/40 text-sm">No testimonials yet.</p>';
      return;
    }

    grid.innerHTML = items
      .map(
        (t) => `
      <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p class="text-white/70 text-sm leading-relaxed mb-6">"${esc(t.quote)}"</p>
        <div class="flex items-center gap-3">
          ${t.avatar ? `<img src="${esc(t.avatar)}" alt="" class="w-10 h-10 rounded-full object-cover" />` : `<div class="w-10 h-10 rounded-full bg-electric/20 flex items-center justify-center text-electric text-sm font-semibold">${esc((t.name || '?')[0])}</div>`}
          <div>
            <div class="font-medium text-sm">${esc(t.name)}</div>
            <div class="text-xs text-white/40">${esc(t.role)}${t.company ? ' · ' + esc(t.company) : ''}</div>
          </div>
        </div>
      </div>`
      )
      .join('');
  }

  function renderPosts(posts) {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;
    const loading = document.getElementById('blog-loading');
    if (loading) loading.remove();

    if (!posts || !posts.length) {
      grid.innerHTML = '<p class="col-span-full text-white/40 text-sm">No posts published yet.</p>';
      return;
    }

    grid.innerHTML = posts
      .slice(0, 6)
      .map((p) => {
        const date = p.publishedAt || p.createdAt;
        const dateStr = date ? new Date(date).toLocaleDateString() : '';
        return `
          <article class="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden group hover:border-electric/30 transition-colors">
            ${p.coverImage ? `<div class="aspect-[16/9] overflow-hidden"><img src="${esc(p.coverImage)}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>` : ''}
            <div class="p-6">
              <div class="text-[10px] text-white/40 uppercase tracking-wider mb-2">${esc(dateStr)}</div>
              <h3 class="font-display text-lg font-semibold mb-2 group-hover:text-electric transition-colors">${esc(p.title)}</h3>
              <p class="text-white/50 text-sm leading-relaxed line-clamp-3">${esc(p.excerpt || (p.content || '').slice(0, 140))}</p>
            </div>
          </article>`;
      })
      .join('');
  }

  async function init() {
    const [skillsRes, projectsRes, testimonialsRes, postsRes] = await Promise.all([
      fetchJSON('/skills'),
      fetchJSON('/projects'),
      fetchJSON('/testimonials'),
      fetchJSON('/posts'),
    ]);

    if (skillsRes?.skills) renderSkills(skillsRes.skills);
    else renderSkills([]);

    if (projectsRes?.projects) renderProjects(projectsRes.projects);
    else renderProjects([]);

    if (testimonialsRes?.testimonials) renderTestimonials(testimonialsRes.testimonials);
    else renderTestimonials([]);

    if (postsRes?.posts) renderPosts(postsRes.posts);
    else renderPosts([]);

    // Keep LINDEN knowledge in sync with CMS
    if (window.LINDEN_RAG && window.LINDEN_RAG.rebuild) {
      window.LINDEN_RAG.rebuild();
    }

    if (typeof window.samsucRevealCards === 'function') window.samsucRevealCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
