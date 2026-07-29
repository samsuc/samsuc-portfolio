(function () {
  'use strict';
  const ENDPOINT = '/api/analytics/track';
  const SID_KEY = 'samsuc_sid';

  function sessionId() {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = 's_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  function track(type, extra) {
    const body = {
      type,
      path: location.pathname + location.hash,
      sessionId: sessionId(),
      referrer: document.referrer || null,
      ...(extra || {}),
    };
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
        navigator.sendBeacon(ENDPOINT, blob);
      } else {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          keepalive: true,
        }).catch(() => {});
      }
    } catch (_) {}
  }

  // Page view
  track('pageview');

  // Resume / CV downloads
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a, button');
    if (!a) return;
    const href = (a.getAttribute('href') || '').toLowerCase();
    const text = (a.textContent || '').toLowerCase();
    const label = a.getAttribute('aria-label') || a.textContent || '';

    if (href.includes('cv') || href.includes('resume') || text.includes('download cv') || text.includes('download resume')) {
      track('resume_download', { label: label.slice(0, 80) });
    } else if (a.classList.contains('project-demo') || text.includes('live demo') || text.includes('case study')) {
      track('project_click', { label: label.slice(0, 80) });
    } else if (a.classList.contains('social-icon') || href.includes('github.com') || href.includes('linkedin.com') || href.includes('x.com') || href.includes('twitter.com')) {
      track('social_click', { label: href.slice(0, 80) });
    } else if (href === '#contact' || text.includes("let's talk") || text.includes('start a project')) {
      track('contact_click', { label: label.slice(0, 80) });
    }
  });

  window.samsucTrack = track;
})();
