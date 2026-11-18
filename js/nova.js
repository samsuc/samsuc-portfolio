/**
 * NOVA — Digital representative for Samuel Success (SAMSUC)
 * Knowledge-first assistant with navigation, hire flow, and LLM-ready architecture.
 */
(function () {
  'use strict';

  /* ========== KNOWLEDGE BASE ========== */
  const KB = {
    name: 'Samuel Success',
    brand: 'SAMSUC',
    tagline: 'Founder • Computer Engineering Student • Frontend Developer • UI/UX Designer',
    mission: 'Bringing the world into one place.',
    vision:
      'Technology should connect people instead of separating them. Samuel aims to build digital experiences that simplify how people learn, work, communicate, create, buy, sell, and grow—all within one connected ecosystem.',
    about:
      "Samuel Success is a Computer Engineering student and software developer from Nigeria. He designs immersive digital experiences that combine creativity, modern technology, and thoughtful UX. Interests: web development, AI, product design, and interactive interfaces.",
    quote: "The future isn't something I wait for. It's something I build.",
    location: 'Nigeria',
    availability: 'Available for freelance and collaboration',
    email: 'samsuc34@gmail.com',
    socials: {
      github: 'https://github.com/samsuc',
      linkedin: 'https://www.linkedin.com/in/sam-suc',
      x: 'https://x.com/sam__suc',
    },
    services: [
      'Frontend Development',
      'Landing Page Design',
      'Portfolio Websites',
      'UI/UX Design',
      'Website Optimization',
      'Digital Product Design',
      'AI Prompt Engineering',
    ],
    skills: {
      Frontend: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'Responsive Design', 'Tailwind CSS', 'React'],
      Design: ['Figma', 'Canva', 'UI Systems', 'Wireframing'],
      Motion: ['GSAP', 'Three.js', 'Lenis', 'Framer Motion'],
      Other: ['Python', 'C++', 'Git', 'GitHub', 'OBS Studio', 'AI Prompting'],
    },
    projects: [
      {
        name: 'Futuristic Portfolio Website',
        type: 'frontend',
        desc: 'Cinematic interactive portfolio with GSAP, Three.js, glassmorphism, and immersive storytelling.',
      },
      {
        name: 'Digital Product Store',
        type: 'product',
        desc: 'Premium digital resources: landing pages, UI templates, and assets for creators.',
      },
      {
        name: 'AI Prompt Collection',
        type: 'ai',
        desc: 'Professional AI prompts for websites, branding, UI generation, and digital products.',
      },
      {
        name: 'Church Media Workflow',
        type: 'media',
        desc: 'Live production workflows using OBS Studio and NDI for church media operations.',
      },
    ],
    values: ['Innovation', 'Creativity', 'Curiosity', 'Consistency', 'Problem Solving', 'Continuous Learning'],
    education: 'Computer Engineering student',
    timeline: [
      'Discovered programming and web development',
      '2026 — Building premium websites and digital products while studying',
      'Today — Creating futuristic digital experiences; working toward a unified digital platform',
    ],
  };

  /* ========== SESSION MEMORY ========== */
  const memory = {
    userName: null,
    history: [],
    topics: new Set(),
    viewedProjects: new Set(),
    hire: { step: null, data: {} },
  };

  let voiceOn = false;
  let open = false;
  let idleTimer = null;
  let tourTimer = null;
  let tourActive = false;
  let tourStep = -1;
  let tourDeclined = false;
  let tourOffered = false;
  let proactiveCooldown = {};
  let lastSection = '';
  let sectionDwell = {};
  let reachedBottom = false;
  let userInteracted = false;

  /* ========== DOM ========== */
  function injectUI() {
    if (document.getElementById('nova-root')) return;

    const style = document.createElement('style');
    style.textContent = `
      #nova-root { position: fixed; z-index: 9999; bottom: 24px; right: 24px; font-family: Inter, system-ui, sans-serif; }
      #nova-orb {
        width: 56px; height: 56px; border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #6689A8, #D6AD60 40%, #151C26 70%);
        box-shadow: 0 0 24px rgba(214,173,96,0.45), 0 0 48px rgba(214,173,96,0.15);
        border: 1px solid rgba(214,173,96,0.4);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        animation: nova-breathe 3.2s ease-in-out infinite;
        transition: transform 0.25s ease;
      }
      #nova-orb:hover { transform: scale(1.06); }
      #nova-orb.thinking { animation: nova-pulse 1s ease-in-out infinite; }
      #nova-orb .ring {
        position: absolute; width: 72px; height: 72px; border-radius: 50%;
        border: 1px solid rgba(214,173,96,0.25); animation: nova-float 4s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes nova-breathe {
        0%, 100% { box-shadow: 0 0 20px rgba(214,173,96,0.35); transform: translateY(0); }
        50% { box-shadow: 0 0 32px rgba(214,173,96,0.55); transform: translateY(-3px); }
      }
      @keyframes nova-pulse {
        0%, 100% { box-shadow: 0 0 16px rgba(214,173,96,0.3); }
        50% { box-shadow: 0 0 40px rgba(214,173,96,0.7); }
      }
      @keyframes nova-float {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.08); opacity: 0.2; }
      }
      #nova-panel {
        position: absolute; bottom: 72px; right: 0;
        width: min(380px, calc(100vw - 32px));
        height: min(520px, calc(100vh - 120px));
        background: rgba(8,17,31,0.85); backdrop-filter: blur(20px);
        border: 1px solid rgba(214,173,96,0.2); border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(214,173,96,0.08);
        display: none; flex-direction: column; overflow: hidden; color: #e5e5e5;
      }
      #nova-panel.open { display: flex; animation: nova-in 0.35s ease; }
      @keyframes nova-in {
        from { opacity: 0; transform: translateY(12px) scale(0.96); }
        to { opacity: 1; transform: none; }
      }
      #nova-header {
        padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex; align-items: center; gap: 10px;
      }
      #nova-header .dot {
        width: 10px; height: 10px; border-radius: 50%; background: #D6AD60;
        box-shadow: 0 0 10px #D6AD60;
      }
      #nova-messages {
        flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
      }
      .nova-msg {
        max-width: 92%; padding: 10px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.5;
        animation: nova-msg-in 0.25s ease;
      }
      @keyframes nova-msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      .nova-msg.bot {
        align-self: flex-start; background: rgba(214,173,96,0.08); border: 1px solid rgba(214,173,96,0.15);
      }
      .nova-msg.user {
        align-self: flex-end; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
      }
      .nova-typing {
        align-self: flex-start; display: flex; gap: 4px; padding: 12px 16px;
      }
      .nova-typing span {
        width: 6px; height: 6px; border-radius: 50%; background: #D6AD60; opacity: 0.5;
        animation: nova-dot 1.2s infinite ease-in-out;
      }
      .nova-typing span:nth-child(2) { animation-delay: 0.15s; }
      .nova-typing span:nth-child(3) { animation-delay: 0.3s; }
      @keyframes nova-dot {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40% { transform: translateY(-4px); opacity: 1; }
      }
      #nova-actions {
        padding: 8px 12px; display: flex; flex-wrap: wrap; gap: 6px;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      #nova-actions button {
        font-size: 11px; padding: 5px 10px; border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.7); cursor: pointer; transition: 0.2s;
      }
      #nova-actions button:hover {
        border-color: rgba(214,173,96,0.4); color: #D6AD60; background: rgba(214,173,96,0.08);
      }
      #nova-input-row {
        padding: 10px 12px 12px; display: flex; gap: 8px; border-top: 1px solid rgba(255,255,255,0.06);
      }
      #nova-input {
        flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; padding: 10px 12px; color: #fff; font-size: 13px; outline: none;
      }
      #nova-input:focus { border-color: rgba(214,173,96,0.4); }
      #nova-send, #nova-mic, #nova-voice-toggle {
        width: 40px; height: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
        background: rgba(214,173,96,0.15); color: #D6AD60; cursor: pointer; font-size: 14px;
      }
      #nova-send:hover { background: rgba(214,173,96,0.3); }
      #nova-voice-toggle.on { background: rgba(214,173,96,0.35); border-color: #D6AD60; }
      #nova-wave {
        display: none; height: 24px; align-items: center; justify-content: center; gap: 3px; padding: 0 12px;
      }
      #nova-wave.active { display: flex; }
      #nova-wave i {
        width: 3px; height: 8px; background: #D6AD60; border-radius: 2px;
        animation: nova-wave 0.8s ease-in-out infinite;
      }
      #nova-wave i:nth-child(2) { animation-delay: 0.1s; }
      #nova-wave i:nth-child(3) { animation-delay: 0.2s; }
      #nova-wave i:nth-child(4) { animation-delay: 0.3s; }
      #nova-wave i:nth-child(5) { animation-delay: 0.15s; }
      @keyframes nova-wave {
        0%, 100% { height: 6px; opacity: 0.5; }
        50% { height: 16px; opacity: 1; }
      }
      @media (max-width: 480px) {
        #nova-root { bottom: 16px; right: 16px; }
        #nova-panel { height: min(70vh, 480px); }
      }
      .nova-choices { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .nova-choices button {
        font-size: 12px; padding: 8px 14px; border-radius: 999px; cursor: pointer;
        border: 1px solid rgba(214,173,96,0.35); background: rgba(214,173,96,0.12); color: #D6AD60;
      }
      .nova-choices button.secondary {
        border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7);
      }
      .nova-choices button:hover { filter: brightness(1.15); }
      #nova-tour-bar {
        display: none; padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);
        font-size: 11px; color: rgba(255,255,255,0.5); align-items: center; justify-content: space-between;
      }
      #nova-tour-bar.active { display: flex; }
      #nova-tour-bar button {
        font-size: 11px; padding: 4px 10px; border-radius: 999px; cursor: pointer;
        border: 1px solid rgba(255,255,255,0.15); background: transparent; color: rgba(255,255,255,0.6);
      }
    `;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = 'nova-root';
    root.innerHTML = `
      <div id="nova-panel" role="dialog" aria-label="NOVA assistant">
        <div id="nova-header">
          <span class="dot"></span>
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px;letter-spacing:0.04em">NOVA</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.4)">Samuel's digital guide</div>
          </div>
          <button id="nova-voice-toggle" title="Toggle voice replies" type="button">🔊</button>
          <button id="nova-close" type="button" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;line-height:1">×</button>
        </div>
        <div id="nova-tour-bar">
          <span id="nova-tour-label">Guided tour</span>
          <button type="button" id="nova-tour-skip">Skip tour</button>
        </div>
        <div id="nova-messages"></div>
        <div id="nova-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div id="nova-actions"></div>
        <div id="nova-input-row">
          <button id="nova-mic" type="button" title="Voice input">🎤</button>
          <input id="nova-input" type="text" placeholder="Ask NOVA anything…" autocomplete="off" />
          <button id="nova-send" type="button">→</button>
        </div>
      </div>
      <div id="nova-orb" role="button" tabindex="0" aria-label="Open NOVA">
        <span class="ring"></span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#090D14" stroke-width="2">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>
        </svg>
      </div>
    `;
    document.body.appendChild(root);

    const actions = [
      ['About', 'tell me about Samuel'],
      ['Projects', 'show projects'],
      ['Skills', 'what skills does he have'],
      ['Services', 'what services does he offer'],
      ['Resume', 'download resume'],
      ['Blog', 'show blog'],
      ['Contact', 'contact Samuel'],
      ['Hire Me', 'I want to hire Samuel'],
      ['GitHub', 'open github'],
      ['LinkedIn', 'open linkedin'],
    ];
    const actEl = document.getElementById('nova-actions');
    actions.forEach(([label, q]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', () => handleUser(q));
      actEl.appendChild(b);
    });

    document.getElementById('nova-orb').addEventListener('click', toggle);
    document.getElementById('nova-close').addEventListener('click', () => setOpen(false));
    document.getElementById('nova-send').addEventListener('click', sendFromInput);
    document.getElementById('nova-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendFromInput();
    });
    document.getElementById('nova-voice-toggle').addEventListener('click', () => {
      voiceOn = !voiceOn;
      document.getElementById('nova-voice-toggle').classList.toggle('on', voiceOn);
      document.getElementById('nova-voice-toggle').textContent = voiceOn ? '🔊' : '🔇';
    });
    document.getElementById('nova-mic').addEventListener('click', startListening);

    // Intro after delay
    setTimeout(() => {
      setOpen(true);
      botSay(
        "Hello, I'm NOVA.\nWelcome to Samuel Success' digital universe.\nI'm here to guide you through his work, projects, vision, and experience.\nFeel free to ask me anything."
      );
    }, 2800);

    // Guided tour offer after ~30s without interaction
    tourTimer = setTimeout(() => {
      if (tourDeclined || tourActive || tourOffered || userInteracted) return;
      offerTour();
    }, 30000);

    document.getElementById('nova-tour-skip').addEventListener('click', skipTour);

    resetIdle();
    ['mousemove', 'keydown', 'click'].forEach((ev) =>
      window.addEventListener(ev, () => {
        userInteracted = true;
        resetIdle();
      }, { passive: true })
    );
    window.addEventListener('scroll', onScrollAssist, { passive: true });
    setInterval(checkSectionProactive, 4000);
  }

  function setOpen(v) {
    open = v;
    document.getElementById('nova-panel').classList.toggle('open', open);
  }
  function toggle() {
    setOpen(!open);
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (tourActive) return;
      if (!open) setOpen(true);
      botSay("I'm here if you need anything.");
    }, 120000);
  }

  /* ========== GUIDED TOUR (modular) ========== */
  const TOUR_STEPS = [
    {
      id: 'hero',
      text: "This is the beginning of Samuel's digital universe. He's a Computer Engineering student, frontend developer, and UI/UX designer building experiences that feel like the future.\n\nHis mission: Bringing the world into one place.",
    },
    {
      id: 'about',
      text: "About Samuel — he's based in Nigeria, constantly learning, and driven by the belief that technology should connect people, not scatter their attention across endless apps.",
    },
    {
      id: 'skills',
      text: "His strongest toolkit blends frontend craft (HTML, CSS, JavaScript, React, Tailwind), motion (GSAP, Three.js), and design (Figma). Together they create interfaces that feel alive.",
    },
    {
      id: 'projects',
      text: "Featured work includes this cinematic portfolio, digital product design, AI prompt collections, and media workflows. Scroll or ask me about any project you want to explore deeper.",
    },
    {
      id: 'vision',
      text: "Long-term, Samuel is working toward a unified digital ecosystem — one place to learn, work, create, and grow without constant app-switching.",
    },
    {
      id: 'contact',
      text: "Ready to collaborate? Use the contact form, email samsuc34@gmail.com, or say \"hire Samuel\" and I'll prepare an inquiry.\n\nYou can also download his resume anytime.",
      final: true,
    },
  ];

  function offerTour() {
    if (tourOffered || tourActive || tourDeclined) return;
    tourOffered = true;
    setOpen(true);
    addMsgWithChoices(
      "Welcome. Would you like a quick guided tour of Samuel's portfolio? It takes about one minute.",
      [
        { label: 'Start Tour', primary: true, action: 'tour-start' },
        { label: 'Maybe Later', primary: false, action: 'tour-later' },
      ]
    );
  }

  function addMsgWithChoices(text, choices) {
    const box = document.getElementById('nova-messages');
    const div = document.createElement('div');
    div.className = 'nova-msg bot';
    div.textContent = text;
    const row = document.createElement('div');
    row.className = 'nova-choices';
    choices.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.label;
      if (!c.primary) b.className = 'secondary';
      b.addEventListener('click', () => {
        row.remove();
        if (c.action === 'tour-start') startTour();
        if (c.action === 'tour-later') {
          tourDeclined = true;
          botSay("No problem. I'm here whenever you need a guide — or try the quick actions below.");
        }
        if (c.action === 'recommend-project') {
          handleUser('recommend a project');
        }
        if (c.action === 'skills-projects') {
          handleUser('show projects');
        }
        if (c.action === 'download-cv') {
          handleUser('download resume');
        }
        if (c.action === 'go-contact') {
          handleUser('contact Samuel');
        }
      });
      row.appendChild(b);
    });
    div.appendChild(row);
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    memory.history.push({ who: 'bot', text, at: Date.now() });
  }

  function startTour() {
    tourActive = true;
    tourStep = -1;
    document.getElementById('nova-tour-bar').classList.add('active');
    botSay("Great — let's begin. You can skip anytime from the top of this panel.");
    setTimeout(nextTourStep, 1600);
  }

  function skipTour() {
    tourActive = false;
    tourStep = -1;
    document.getElementById('nova-tour-bar').classList.remove('active');
    botSay("Tour skipped. Explore freely, or ask me anything about Samuel's work.");
  }

  function nextTourStep() {
    if (!tourActive) return;
    tourStep += 1;
    if (tourStep >= TOUR_STEPS.length) {
      tourActive = false;
      document.getElementById('nova-tour-bar').classList.remove('active');
      botSay("That's the tour. If you'd like to go deeper on any section, just ask.");
      return;
    }
    const step = TOUR_STEPS[tourStep];
    document.getElementById('nova-tour-label').textContent =
      'Tour ' + (tourStep + 1) + '/' + TOUR_STEPS.length + ' · ' + step.id;
    const el = document.getElementById(step.id === 'hero' ? 'hero' : step.id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showTyping(true);
    setTimeout(() => {
      showTyping(false);
      addMsg(step.text, 'bot');
      speak(step.text);
      if (step.final) {
        addMsgWithChoices('What would you like to do next?', [
          { label: 'Download CV', primary: true, action: 'download-cv' },
          { label: 'Contact', primary: true, action: 'go-contact' },
          { label: 'Projects', primary: false, action: 'skills-projects' },
        ]);
        tourActive = false;
        document.getElementById('nova-tour-bar').classList.remove('active');
      } else {
        setTimeout(nextTourStep, 5500);
      }
    }, 900);
  }

  /* ========== PROACTIVE ASSISTANCE ========== */
  function onScrollAssist() {
    resetIdle();
    const doc = document.documentElement;
    const scrolled = (window.scrollY + window.innerHeight) / doc.scrollHeight;
    if (scrolled > 0.92 && !reachedBottom && !tourActive) {
      reachedBottom = true;
      if (canProactive('bottom')) {
        setOpen(true);
        addMsgWithChoices(
          "Before you leave, would you like to download Samuel's resume or send a quick message?",
          [
            { label: 'Download CV', primary: true, action: 'download-cv' },
            { label: 'Contact', primary: true, action: 'go-contact' },
            { label: 'Maybe later', primary: false, action: 'tour-later' },
          ]
        );
      }
    }
  }

  function canProactive(key) {
    const now = Date.now();
    if (proactiveCooldown[key] && now - proactiveCooldown[key] < 180000) return false;
    proactiveCooldown[key] = now;
    return true;
  }

  function checkSectionProactive() {
    if (tourActive) return;
    const sec = currentSection();
    const now = Date.now();
    if (sec !== lastSection) {
      lastSection = sec;
      sectionDwell[sec] = now;
      return;
    }
    const dwell = now - (sectionDwell[sec] || now);
    if (sec === 'projects' && dwell > 25000 && canProactive('projects')) {
      setOpen(true);
      addMsgWithChoices(
        "I noticed you're exploring Samuel's projects. Would you like me to recommend one?",
        [
          { label: 'Yes, recommend', primary: true, action: 'recommend-project' },
          { label: 'No thanks', primary: false, action: 'tour-later' },
        ]
      );
    }
    if (sec === 'skills' && dwell > 20000 && canProactive('skills')) {
      setOpen(true);
      addMsgWithChoices(
        'Would you like to see which projects use these technologies?',
        [
          { label: 'Show projects', primary: true, action: 'skills-projects' },
          { label: 'Not now', primary: false, action: 'tour-later' },
        ]
      );
    }
  }

  function currentSection() {
    const sections = ['hero', 'about', 'skills', 'projects', 'vision', 'experience', 'testimonials', 'blog', 'contact'];
    let current = 'hero';
    const mid = window.innerHeight * 0.35;
    sections.forEach((id) => {
      const el = document.getElementById(id === 'hero' ? 'hero' : id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) current = id;
    });
    return current;
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function addMsg(text, who) {
    const box = document.getElementById('nova-messages');
    const div = document.createElement('div');
    div.className = 'nova-msg ' + who;
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    memory.history.push({ who, text, at: Date.now() });
  }

  function showTyping(show) {
    const box = document.getElementById('nova-messages');
    let t = document.getElementById('nova-typing');
    if (show) {
      if (!t) {
        t = document.createElement('div');
        t.id = 'nova-typing';
        t.className = 'nova-typing';
        t.innerHTML = '<span></span><span></span><span></span>';
        box.appendChild(t);
      }
      document.getElementById('nova-orb').classList.add('thinking');
    } else {
      if (t) t.remove();
      document.getElementById('nova-orb').classList.remove('thinking');
    }
    box.scrollTop = box.scrollHeight;
  }

  function speak(text) {
    if (!voiceOn || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.replace(/\n/g, ' '));
    u.rate = 1;
    u.pitch = 1;
    const wave = document.getElementById('nova-wave');
    wave.classList.add('active');
    u.onend = () => wave.classList.remove('active');
    speechSynthesis.speak(u);
  }

  function botSay(text) {
    showTyping(true);
    const delay = Math.min(1200, 400 + text.length * 8);
    setTimeout(() => {
      showTyping(false);
      addMsg(text, 'bot');
      speak(text);
    }, delay);
  }

  function sendFromInput() {
    const input = document.getElementById('nova-input');
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    handleUser(q);
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      botSay("Voice input isn't supported in this browser. You can still type to me.");
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      handleUser(text);
    };
    rec.onerror = () => botSay("I couldn't catch that. Try typing instead.");
    rec.start();
  }

  /* ========== INTENT ENGINE ========== */
  function normalize(s) {
    return s.toLowerCase().trim();
  }

  function handleUser(raw) {
    resetIdle();
    if (!open) setOpen(true);
    addMsg(raw, 'user');

    // Capture name
    const nameMatch = raw.match(/(?:my name is|i'm|i am)\s+([A-Za-z][A-Za-z\s'-]{1,30})/i);
    if (nameMatch) memory.userName = nameMatch[1].trim();

    // Hire flow
    if (memory.hire.step) {
      return continueHire(raw);
    }

    const q = normalize(raw);
    respond(q, raw);
  }

  function continueHire(raw) {
    const h = memory.hire;
    if (h.step === 'type') {
      h.data.type = raw;
      h.step = 'budget';
      botSay('Got it. Do you have a budget range in mind?');
    } else if (h.step === 'budget') {
      h.data.budget = raw;
      h.step = 'timeline';
      botSay('And what timeline are you aiming for?');
    } else if (h.step === 'timeline') {
      h.data.timeline = raw;
      h.step = 'company';
      botSay('Company or team name? (or say "personal")');
    } else if (h.step === 'company') {
      h.data.company = raw;
      h.step = 'email';
      botSay("What's the best email to reach you?");
    } else if (h.step === 'email') {
      h.data.email = raw;
      h.step = null;
      fillContactForm(h.data);
      botSay(
        "I've prepared a message on the Contact section with your details. Review it and hit send when you're ready — Samuel will get it directly."
      );
      scrollToId('contact');
    }
  }

  function fillContactForm(data) {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');
    if (name) name.value = memory.userName || data.company || 'Prospective client';
    if (email) email.value = data.email || '';
    if (subject) subject.value = 'Hire inquiry — ' + (data.type || 'project');
    if (message) {
      message.value = [
        'Hire inquiry via NOVA',
        'Project type: ' + (data.type || '—'),
        'Budget: ' + (data.budget || '—'),
        'Timeline: ' + (data.timeline || '—'),
        'Company: ' + (data.company || '—'),
      ].join('\n');
    }
  }

  function respond(q, raw) {
    const greet = memory.userName ? `, ${memory.userName}` : '';

    // Navigation intents
    if (/project|work|portfolio piece/.test(q)) {
      memory.topics.add('projects');
      scrollToId('projects');
      const list = KB.projects.map((p) => `• ${p.name} — ${p.desc}`).join('\n');
      return botSay(`I've highlighted the Projects section for you${greet}.\n\n${list}\n\nAsk about any project for more detail.`);
    }
    if (/skill|technolog|stack|tools/.test(q)) {
      memory.topics.add('skills');
      scrollToId('skills');
      const lines = Object.entries(KB.skills)
        .map(([k, v]) => `• ${k}: ${v.join(', ')}`)
        .join('\n');
      return botSay(`Here are Samuel's core capabilities:\n${lines}\n\nI've scrolled you to the Skills section.`);
    }
    if (/service|offer|what can he do/.test(q)) {
      return botSay(`Samuel offers:\n${KB.services.map((s) => '• ' + s).join('\n')}\n\nWant to start a project? Say "hire Samuel".`);
    }
    if (/contact|email|reach|message/.test(q) && !/hire/.test(q)) {
      scrollToId('contact');
      return botSay(`You can reach Samuel at ${KB.email}, or use the contact form I've opened for you.\nLocation: ${KB.location}.\nStatus: ${KB.availability}.`);
    }
    if (/blog|article|writing|journal/.test(q)) {
      scrollToId('blog');
      return botSay("Opening the Blog section — latest published writing appears there.");
    }
    if (/about|who is|tell me about|biography|who are you/.test(q) && !/nova/.test(q)) {
      scrollToId('about');
      return botSay(`${KB.about}\n\nTagline: ${KB.tagline}\n\n"${KB.quote}"`);
    }
    if (/vision|mission|bringing the world|ecosystem|future goal/.test(q)) {
      scrollToId('vision');
      return botSay(`Mission: ${KB.mission}\n\nVision: ${KB.vision}`);
    }
    if (/resume|cv|download/.test(q)) {
      const a = document.createElement('a');
      a.href = 'assets/Samuel-Success-CV.pdf';
      a.download = 'Samuel-Success-CV.pdf';
      a.click();
      if (window.samsucTrack) window.samsucTrack('resume_download', { label: 'NOVA' });
      return botSay("Starting the CV download now. You can also use the Download CV button in the header.");
    }
    if (/github/.test(q)) {
      window.location.href = KB.socials.github;
      return botSay('Opening Samuel’s GitHub.');
    }
    if (/linkedin/.test(q)) {
      window.location.href = KB.socials.linkedin;
      return botSay('Opening Samuel’s LinkedIn.');
    }
    if (/\bx\b|twitter/.test(q)) {
      window.location.href = KB.socials.x;
      return botSay('Opening Samuel’s X profile.');
    }
    if (/available|hire him|freelance|can i hire|i want to hire|hire samuel/.test(q)) {
      memory.hire.step = 'type';
      memory.hire.data = {};
      return botSay(
        `Samuel is currently: ${KB.availability}.\n\nI'd love to help prepare an inquiry. What type of project do you have in mind? (e.g. portfolio site, landing page, UI design, product)`
      );
    }
    if (/frontend project/.test(q)) {
      scrollToId('projects');
      const list = KB.projects.filter((p) => p.type === 'frontend' || p.type === 'product');
      return botSay(list.map((p) => `• ${p.name}: ${p.desc}`).join('\n') || 'Frontend-focused work is listed under Projects.');
    }
    if (/ai project/.test(q)) {
      scrollToId('projects');
      return botSay(
        KB.projects
          .filter((p) => p.type === 'ai')
          .map((p) => `• ${p.name}: ${p.desc}`)
          .join('\n') || 'Samuel’s AI work includes the AI Prompt Collection — see Projects.'
      );
    }
    if (/ui design|design project/.test(q)) {
      scrollToId('projects');
      return botSay('Samuel’s design-led work includes the Digital Product Store and this portfolio’s UI system. Scrolling to Projects.');
    }
    if (/favorite project|best project|recommend/.test(q)) {
      scrollToId('projects');
      return botSay(
        `I'd highlight the Futuristic Portfolio Website — it captures Samuel’s focus on cinematic UI, motion, and immersive experiences. You can also explore his AI Prompt Collection if you're into productized knowledge.`
      );
    }
    if (/where|location|based|nigeria/.test(q)) {
      return botSay(`Samuel is based in ${KB.location}.`);
    }
    if (/educat|student|school|degree|engineer/.test(q)) {
      return botSay(`${KB.education}. He's building real products while studying — see Experience on the site.`);
    }
    if (/value|principle/.test(q)) {
      return botSay(`Core values: ${KB.values.join(', ')}.`);
    }
    if (/who are you|what are you|your name|nova/.test(q)) {
      return botSay(
        "I'm NOVA — Samuel Success' digital guide. I help visitors explore his work, vision, and how to work with him. Think of me as a calm concierge for this portfolio."
      );
    }
    if (/start tour|guided tour|take a tour/.test(q)) {
      startTour();
      return;
    }
    if (/hello|hi |hey|good morning|good evening/.test(q)) {
      return botSay(`Hello${greet}. How can I guide you today — projects, skills, vision, or hiring?`);
    }
    if (/thank/.test(q)) {
      return botSay("You're welcome. I'm here if you need anything else.");
    }
    if (/inspired|this website|how was this built/.test(q)) {
      return botSay(
        "This site is inspired by the craft of Apple, Linear, Vercel, and Awwwards-level design — cinematic motion, glass, and calm technology. It reflects Samuel’s belief that interfaces should feel premium and purposeful."
      );
    }

    // Project name match
    for (const p of KB.projects) {
      if (q.includes(p.name.toLowerCase().split(' ')[0]) && q.includes('project')) {
        memory.viewedProjects.add(p.name);
        return botSay(`${p.name}: ${p.desc}\nType: ${p.type}`);
      }
    }

    // RAG fallback — retrieve from live CMS + knowledge index
    (async () => {
      if (window.NOVA_RAG && window.NOVA_RAG.isReady()) {
        showTyping(true);
        try {
          const result = await window.NOVA_RAG.answer(raw);
          showTyping(false);
          addMsg(result.text, 'bot');
          speak(result.text);
          if (result.section) {
            const el = document.getElementById(result.section);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        } catch (e) {
          showTyping(false);
          console.warn(e);
        }
      }
      botSay(
        `I don't have specific details on that yet${greet}. I can help with Samuel's about, projects, skills, services, vision, resume, or how to contact and hire him. What would you like to explore?`
      );
    })();
  }

  /* ========== FUTURE LLM HOOK ========== */
  /**
   * window.NOVA_LLM = async (messages, context) => string
   * If defined, NOVA can route complex queries here (OpenAI / Anthropic / local).
   * context includes KB snapshot + memory for RAG-style grounding.
   */
  /**
   * Modular architecture
   * - Guide / Q&A: handleUser + KB
   * - Navigation: scrollToId
   * - Tour: startTour / skipTour / TOUR_STEPS
   * - Proactive: checkSectionProactive / onScrollAssist
   * - RAG: window.NOVA_RAG
   * - LLM: window.NOVA_LLM (OpenAI / Anthropic / Gemini / local)
   * Future: multilingual, calendar booking, onboarding plugins via NOVA.plugins
   */
  window.NOVA = {
    KB,
    memory,
    ask: handleUser,
    open: () => setOpen(true),
    startTour,
    skipTour,
    offerTour,
    refreshKnowledge: function () {
      if (window.NOVA_RAG) return window.NOVA_RAG.rebuild();
    },
    plugins: {},
    registerPlugin: function (name, fn) {
      this.plugins[name] = fn;
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI);
  } else {
    injectUI();
  }
})();
