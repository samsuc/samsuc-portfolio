(function () {
  'use strict';

  function setText(sel, value) {
    if (!value) return;
    document.querySelectorAll(sel).forEach((el) => {
      el.textContent = value;
    });
  }

  function setHTML(sel, value) {
    if (!value) return;
    document.querySelectorAll(sel).forEach((el) => {
      el.innerHTML = value;
    });
  }

  function setAttr(sel, attr, value) {
    if (!value) return;
    document.querySelectorAll(sel).forEach((el) => {
      el.setAttribute(attr, value);
    });
  }

  async function apply() {
    try {
      const res = await fetch('/api/content/profile');
      if (!res.ok) return;
      const data = await res.json();
      const p = data.profile;
      if (!p) return;

      // Name / brand
      setText('[data-profile="displayName"]', p.displayName);
      setText('[data-profile="brand"]', p.brand);
      setText('[data-profile="tagline"]', p.tagline);
      setText('[data-profile="shortTagline"]', p.shortTagline);
      setText('[data-profile="heroQuote"]', p.heroQuote);
      setText('[data-profile="about"]', p.about);
      setText('[data-profile="mission"]', p.mission);
      setText('[data-profile="vision"]', p.vision);
      setText('[data-profile="location"]', p.location);
      setText('[data-profile="availability"]', p.availability);
      setText('[data-profile="email"]', p.email);

      // Portrait
      if (p.portraitUrl) {
        document.querySelectorAll('img.hero-portrait, img[data-profile="portrait"], #hero-portrait').forEach((img) => {
          img.src = p.portraitUrl;
          img.alt = p.displayName || 'Portrait';
        });
      }

      // CV links
      if (p.cvUrl) {
        document.querySelectorAll('a[download], a[href*="CV"], a[href*="cv"], a[href*="resume"]').forEach((a) => {
          if (/cv|resume/i.test(a.textContent) || a.hasAttribute('download') || /CV\.pdf/i.test(a.getAttribute('href') || '')) {
            a.href = p.cvUrl;
          }
        });
        document.querySelectorAll('a[data-profile="cv"]').forEach((a) => {
          a.href = p.cvUrl;
        });
      }

      // Socials
      if (p.github) setAttr('a[data-profile="github"], a[href*="github.com/samsuc"]', 'href', p.github);
      if (p.linkedin) setAttr('a[data-profile="linkedin"], a[href*="linkedin.com"]', 'href', p.linkedin);
      if (p.x) setAttr('a[data-profile="x"], a[href*="x.com/sam"]', 'href', p.x);
      if (p.email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
          a.href = 'mailto:' + p.email;
        });
      }

      // Title
      if (p.displayName) {
        document.title = p.displayName + (p.brand ? ' — ' + p.brand : '');
      }

      // Sync NOVA knowledge
      if (window.NOVA && window.NOVA.KB) {
        const kb = window.NOVA.KB;
        kb.name = p.displayName || kb.name;
        kb.brand = p.brand || kb.brand;
        kb.tagline = p.tagline || kb.tagline;
        kb.about = p.about || kb.about;
        kb.mission = p.mission || kb.mission;
        kb.vision = p.vision || kb.vision;
        kb.quote = p.heroQuote || kb.quote;
        kb.email = p.email || kb.email;
        kb.location = p.location || kb.location;
        kb.availability = p.availability || kb.availability;
        if (p.github) kb.socials.github = p.github;
        if (p.linkedin) kb.socials.linkedin = p.linkedin;
        if (p.x) kb.socials.x = p.x;
      }
      if (window.NOVA_RAG && window.NOVA_RAG.rebuild) {
        window.NOVA_RAG.rebuild();
      }

      window.__SAMSUC_PROFILE__ = p;
    } catch (e) {
      console.warn('[profile]', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
