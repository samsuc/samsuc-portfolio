/* ============================================
   NOVA PORTFOLIO — Core Interactions (fixed)
   ============================================ */

(function () {
  'use strict';

  // ---------- LOADER ----------
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');

  document.querySelectorAll(
    '.hero-label, .hero-title-line, .hero-intro, #hero-cta, #hero-status, #scroll-hint, .section-label, .about-text, .stat-card, .timeline-item, #contact-form, #skills h2, #projects h2, #vision h2, #journey h2, #testimonials h2, #journal h2, #contact h2'
  ).forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });

  function initExperience() {
    initLenis();
    initCursor();
    initNavbar();
    initHeroAnimations();
    initScrollTriggers();
    initCounters();
    initMagneticButtons();
    initProjectFilters();
    initContactForm();
    initCommandPalette();
    initLocalTime();
    initBackToTop();
    initPortraitParallax();
    initBackground();
    initMobileMenu();
  }

  // ---------- LENIS SMOOTH SCROLL ----------
  let lenis = null;
  function initLenis() {
    if (typeof Lenis === 'undefined') {
      return;
    }
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      function raf(time) {
        if (lenis) lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) {
        lenis.on('scroll', ({ progress }) => {
          progressBar.style.transform = `scaleX(${progress})`;
        });
      }
    } catch (e) {
      console.warn('Lenis init failed, using native scroll');
      lenis = null;
    }
  }

  // ---------- CUSTOM CURSOR ----------
  function initCursor() {
    const cursor = document.getElementById('cursor');
    const trail = document.getElementById('cursor-trail');
    if (!cursor || !trail) return;

    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      cursor.style.display = 'none';
      trail.style.display = 'none';
      return;
    }

    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;
    let isHovering = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const scale = isHovering ? 1.8 : 1;
      cursor.style.transform = `translate(${mouseX - 8}px, ${mouseY - 8}px) scale(${scale})`;
    });

    function animateTrail() {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      const size = isHovering ? 48 : 40;
      trail.style.width = size + 'px';
      trail.style.height = size + 'px';
      trail.style.transform = `translate(${trailX - size / 2}px, ${trailY - size / 2}px)`;
      requestAnimationFrame(animateTrail);
    }
    animateTrail();

    const hoverTargets = document.querySelectorAll('a, button, .skill-card, .project-card, .magnetic-btn');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        isHovering = true;
        cursor.style.background = 'rgba(214, 173, 96, 0.85)';
        trail.style.borderColor = 'rgba(214, 173, 96, 0.8)';
      });
      el.addEventListener('mouseleave', () => {
        isHovering = false;
        cursor.style.background = 'white';
        trail.style.borderColor = 'rgba(214, 173, 96, 0.5)';
      });
    });
  }

  // ---------- NAVBAR HIDE ON SCROLL ----------
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;

    const onScroll = (scroll) => {
      if (scroll > lastScroll && scroll > 120) {
        navbar.classList.add('nav-hidden');
      } else {
        navbar.classList.remove('nav-hidden');
      }
      lastScroll = scroll;
    };

    if (lenis) {
      lenis.on('scroll', ({ scroll }) => onScroll(scroll));
    } else {
      window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
    }
  }

  // ---------- HERO ANIMATIONS ----------
  function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero-label', { opacity: 1, y: 0, duration: 0.8 }, 0.2)
      .to('.hero-title-line', { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 0.4)
      .to('.hero-intro', { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.9)
      .to('#hero-cta', { opacity: 1, y: 0, duration: 0.7 }, 1.2)
      .to('#hero-status', { opacity: 1, duration: 0.6 }, 1.4)
      .to('#scroll-hint', { opacity: 1, duration: 0.6 }, 1.6);
  }

  // ---------- SCROLL TRIGGERS ----------
  function initScrollTriggers() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.section-label').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        duration: 0.8,
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    gsap.utils.toArray('h2').forEach(el => {
      if (el.closest('#hero')) return;
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    gsap.utils.toArray('.about-text').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.1,
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    gsap.utils.toArray('.stat-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    gsap.utils.toArray('.skill-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: i * 0.07,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#skills-grid', start: 'top 80%' }
      });
    });

    gsap.utils.toArray('.project-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#projects-grid', start: 'top 85%' }
      });
    });

    gsap.utils.toArray('.timeline-item').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.15,
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      gsap.to(contactForm, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        scrollTrigger: { trigger: contactForm, start: 'top 85%' }
      });
    }
  }

  // ---------- COUNTERS (safe) ----------
  function initCounters() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target, 10) || 0;
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              counter.textContent = Math.round(obj.val);
            }
          });
        }
      });
    });
  }

  // ---------- MAGNETIC BUTTONS ----------
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ---------- PROJECT FILTERS ----------
  function initProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    if (!buttons.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        cards.forEach(card => {
          const category = card.dataset.category;
          const show = filter === 'all' || category === filter;
          if (typeof gsap !== 'undefined') {
            if (show) {
              card.style.display = '';
              gsap.to(card, { opacity: 1, scale: 1, duration: 0.35 });
            } else {
              gsap.to(card, {
                opacity: 0,
                scale: 0.96,
                duration: 0.25,
                onComplete: () => { card.style.display = 'none'; }
              });
            }
          } else {
            card.style.display = show ? '' : 'none';
          }
        });
      });
    });
  }

  // ---------- CONTACT FORM ----------
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    const errorBox = document.getElementById('form-error');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');
    if (!form) return;

    const API_URL = '/api/contact'; // change to full URL in production if frontend & backend are separated

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Reset error
      if (errorBox) {
        errorBox.classList.add('hidden');
        errorBox.textContent = '';
      }

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject ? form.subject.value.trim() : '';
      const message = form.message.value.trim();
      const honeypot = form.website ? form.website.value : '';

      // Client-side validation
      if (name.length < 2) {
        showError('Please enter your full name.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Please enter a valid email address.');
        return;
      }
      if (message.length < 10) {
        showError('Message should be at least 10 characters.');
        return;
      }
      if (honeypot) {
        // bot filled honeypot
        showError('Something went wrong. Please try again.');
        return;
      }

      // Loading state
      setLoading(true);

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || 'Failed to send message. Please try again later.');
        }

        // Success
        if (typeof gsap !== 'undefined') {
          gsap.to(form, {
            opacity: 0,
            y: -16,
            duration: 0.35,
            onComplete: () => {
              form.classList.add('hidden');
              if (success) {
                success.classList.remove('hidden');
                gsap.fromTo(success, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45 });
              }
            }
          });
        } else {
          form.classList.add('hidden');
          if (success) success.classList.remove('hidden');
        }

        // Analytics event (optional)
        if (typeof gtag === 'function') {
          gtag('event', 'contact_form_submit', { method: 'api' });
        }
      } catch (err) {
        showError(err.message || 'Something went wrong. Please try again or email me directly.');
        setLoading(false);
      }
    });

    function setLoading(isLoading) {
      if (!submitBtn) return;
      submitBtn.disabled = isLoading;
      if (btnText) btnText.classList.toggle('hidden', isLoading);
      if (btnLoading) {
        btnLoading.classList.toggle('hidden', !isLoading);
        btnLoading.classList.toggle('flex', isLoading);
      }
    }

    function showError(msg) {
      if (errorBox) {
        errorBox.textContent = msg;
        errorBox.classList.remove('hidden');
      }
      setLoading(false);
    }
  }

  // ---------- COMMAND PALETTE ----------
  function initCommandPalette() {
    const palette = document.getElementById('cmd-palette');
    const input = document.getElementById('cmd-input');
    if (!palette || !input) return;

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const isHidden = palette.classList.contains('hidden');
        if (isHidden) {
          palette.classList.remove('hidden');
          palette.classList.add('flex');
          input.focus();
        } else {
          palette.classList.add('hidden');
          palette.classList.remove('flex');
        }
      }
      if (e.key === 'Escape') {
        palette.classList.add('hidden');
        palette.classList.remove('flex');
      }
    });

    document.querySelectorAll('.cmd-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        palette.classList.add('hidden');
        palette.classList.remove('flex');
        if (action === 'about') scrollToId('about');
        if (action === 'projects') scrollToId('projects');
        if (action === 'vision') scrollToId('vision');
        if (action === 'contact') scrollToId('contact');
      });
    });
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el);
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ---------- LOCAL TIME ----------
  function initLocalTime() {
    const el = document.getElementById('local-time');
    if (!el) return;
    function update() {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    update();
    setInterval(update, 30000);
  }

  // ---------- BACK TO TOP ----------
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- PORTRAIT PARALLAX ----------
  function initPortraitParallax() {
    const container = document.getElementById('portrait-container');
    const img = document.getElementById('portrait-img');
    if (!container || !img) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      img.style.transform = `scale(1.05) translate(${x * 12}px, ${y * 12}px)`;
    });
    container.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1.05) translate(0, 0)';
    });
  }

  // ---------- BACKGROUND ----------
  function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    if (typeof THREE !== 'undefined') {
      try {
        initThreeBackground(canvas);
        return;
      } catch (e) {
        console.warn('Three.js background failed, using 2D fallback');
      }
    }
    initSimpleParticles(canvas);
  }

  function initThreeBackground(canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particleCount = 700;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const c = Math.random();
      // champagne gold #D6AD60 or steel blue #6689A8
      colors[i * 3] = c > 0.6 ? 0.84 : 0.40;
      colors[i * 3 + 1] = c > 0.6 ? 0.68 : 0.54;
      colors[i * 3 + 2] = c > 0.6 ? 0.38 : 0.66;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    camera.position.z = 12;

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
      requestAnimationFrame(animate);
      points.rotation.y += 0.0007;
      points.rotation.x += 0.00025;
      camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.025;
      camera.position.y += (-mouseY * 1.4 - camera.position.y) * 0.025;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  function initSimpleParticles(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w, h;
    const particles = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        alpha: Math.random() * 0.45 + 0.2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 173, 96, ${p.alpha})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(214, 173, 96, ${0.08 * (1 - dist / 110)})`;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ---------- MOBILE MENU ----------
  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
    });

    menu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
      });
    });
  }

  initExperience();
})();
