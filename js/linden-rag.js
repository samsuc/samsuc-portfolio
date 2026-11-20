/**
 * LINDEN RAG — Retrieval layer over live portfolio content.
 * Indexes projects, skills, testimonials, posts + static profile docs.
 * Pure JS TF–IDF + cosine similarity (no external ML deps).
 * Ready to swap embedding backend via window.LINDEN_EMBED.
 */
(function () {
  'use strict';

  const API = '/api/content';
  let corpus = []; // { id, text, meta }
  let vocab = new Map();
  let idf = new Map();
  let vectors = []; // parallel to corpus
  let ready = false;

  function tokenize(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s+#.]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  function tf(tokens) {
    const m = new Map();
    tokens.forEach((t) => m.set(t, (m.get(t) || 0) + 1));
    const n = tokens.length || 1;
    m.forEach((v, k) => m.set(k, v / n));
    return m;
  }

  function buildIndex(docs) {
    corpus = docs;
    vocab = new Map();
    const df = new Map();

    const tokenized = docs.map((d) => tokenize(d.text));
    tokenized.forEach((tokens) => {
      const seen = new Set();
      tokens.forEach((t) => {
        if (!vocab.has(t)) vocab.set(t, vocab.size);
        if (!seen.has(t)) {
          df.set(t, (df.get(t) || 0) + 1);
          seen.add(t);
        }
      });
    });

    const N = docs.length || 1;
    idf = new Map();
    df.forEach((c, t) => idf.set(t, Math.log((N + 1) / (c + 1)) + 1));

    vectors = tokenized.map((tokens) => {
      const termFreq = tf(tokens);
      const vec = new Map();
      termFreq.forEach((v, t) => {
        vec.set(t, v * (idf.get(t) || 0));
      });
      return vec;
    });

    ready = docs.length > 0;
  }

  function cosine(a, b) {
    let dot = 0;
    let na = 0;
    let nb = 0;
    a.forEach((v, k) => {
      na += v * v;
      if (b.has(k)) dot += v * b.get(k);
    });
    b.forEach((v) => {
      nb += v * v;
    });
    if (!na || !nb) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  function queryVector(text) {
    const termFreq = tf(tokenize(text));
    const vec = new Map();
    termFreq.forEach((v, t) => {
      if (idf.has(t)) vec.set(t, v * idf.get(t));
    });
    return vec;
  }

  /**
   * Retrieve top-k documents for a query.
   * @returns {Array<{score, text, meta}>}
   */
  function retrieve(query, k) {
    k = k || 4;
    if (!ready || !corpus.length) return [];

    // Optional external embeddings
    if (typeof window.LINDEN_EMBED === 'function') {
      // Placeholder: custom embedders can replace this path later
    }

    const qv = queryVector(query);
    const scored = corpus.map((doc, i) => ({
      score: cosine(qv, vectors[i]),
      text: doc.text,
      meta: doc.meta,
      id: doc.id,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.filter((s) => s.score > 0.02).slice(0, k);
  }

  function doc(id, text, meta) {
    return { id, text, meta: meta || {} };
  }

  async function fetchJSON(path) {
    try {
      const res = await fetch(API + path);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function rebuildFromCMS() {
    const docs = [];

    // Static profile documents (always present)
    const staticProfile = window.LINDEN && window.LINDEN.KB ? window.LINDEN.KB : null;
    if (staticProfile) {
      docs.push(
        doc('profile-about', `About ${staticProfile.name}. ${staticProfile.about} ${staticProfile.tagline}`, {
          type: 'profile',
          section: 'about',
        })
      );
      docs.push(
        doc('profile-mission', `Mission: ${staticProfile.mission}. Vision: ${staticProfile.vision}`, {
          type: 'profile',
          section: 'vision',
        })
      );
      docs.push(
        doc(
          'profile-contact',
          `Contact email ${staticProfile.email}. Location ${staticProfile.location}. Availability: ${staticProfile.availability}. GitHub ${staticProfile.socials.github}. LinkedIn ${staticProfile.socials.linkedin}`,
          { type: 'profile', section: 'contact' }
        )
      );
      docs.push(
        doc('profile-services', `Services offered: ${(staticProfile.services || []).join(', ')}`, {
          type: 'services',
        })
      );
      docs.push(
        doc('profile-quote', staticProfile.quote, { type: 'profile' })
      );
      (staticProfile.projects || []).forEach((p, i) => {
        docs.push(
          doc(`kb-project-${i}`, `Project: ${p.name}. Type: ${p.type}. ${p.desc}`, {
            type: 'project',
            name: p.name,
            section: 'projects',
          })
        );
      });
      Object.entries(staticProfile.skills || {}).forEach(([cat, tags]) => {
        docs.push(
          doc(`kb-skill-${cat}`, `Skill category ${cat}: ${tags.join(', ')}`, {
            type: 'skill',
            category: cat,
            section: 'skills',
          })
        );
      });
    }

    const [projects, skills, testimonials, posts] = await Promise.all([
      fetchJSON('/projects'),
      fetchJSON('/skills'),
      fetchJSON('/testimonials'),
      fetchJSON('/posts'),
    ]);

    (projects?.projects || []).forEach((p) => {
      docs.push(
        doc(
          'cms-project-' + p.id,
          `Project: ${p.title}. Category: ${p.category}. ${(p.tech || []).join(', ')}. ${p.description || ''} GitHub: ${p.github || 'n/a'} Live: ${p.live || 'n/a'}`,
          { type: 'project', id: p.id, title: p.title, section: 'projects' }
        )
      );
    });

    (skills?.skills || []).forEach((s) => {
      docs.push(
        doc(
          'cms-skill-' + s.id,
          `Skill: ${s.name}. Category: ${s.category}. ${s.description || ''} Tags: ${(s.tags || []).join(', ')}`,
          { type: 'skill', id: s.id, name: s.name, section: 'skills' }
        )
      );
    });

    (testimonials?.testimonials || []).forEach((t) => {
      docs.push(
        doc(
          'cms-testimonial-' + t.id,
          `Testimonial by ${t.name}, ${t.role || ''} ${t.company || ''}: "${t.quote}"`,
          { type: 'testimonial', section: 'testimonials' }
        )
      );
    });

    (posts?.posts || []).forEach((p) => {
      docs.push(
        doc(
          'cms-post-' + p.id,
          `Blog post: ${p.title}. ${(p.tags || []).join(', ')}. ${p.excerpt || ''} ${((p.content || '') + '').slice(0, 1200)}`,
          { type: 'post', id: p.id, title: p.title, section: 'blog', slug: p.slug }
        )
      );
    });

    buildIndex(docs);
    return { count: docs.length, ready };
  }

  /**
   * Build a context string for generation / answer synthesis.
   */
  function buildContext(query, k) {
    const hits = retrieve(query, k || 5);
    if (!hits.length) return { context: '', hits: [] };
    const context = hits
      .map((h, i) => `[${i + 1}] (${h.meta.type || 'doc'}${h.meta.title ? ': ' + h.meta.title : ''}) ${h.text}`)
      .join('\n\n');
    return { context, hits };
  }

  /**
   * Answer using retrieved context. Uses LINDEN_LLM if provided, else extractive synthesis.
   */
  async function answerWithRAG(query) {
    const { context, hits } = buildContext(query, 5);

    if (typeof window.LINDEN_LLM === 'function') {
      try {
        const reply = await window.LINDEN_LLM(
          [
            {
              role: 'system',
              content:
                'You are Linden, a calm guide for Samuel Success (SAMSUC)\'s portfolio. Answer only using the provided context. Be concise and professional. If context is insufficient, say so and suggest Projects, Skills, or Contact.',
            },
            {
              role: 'user',
              content: `Context:\n${context || '(empty)'}\n\nQuestion: ${query}`,
            },
          ],
          { hits, context }
        );
        if (reply) return { text: reply, hits, source: 'llm' };
      } catch (e) {
        console.warn('[LINDEN RAG] LLM error', e);
      }
    }

    // Extractive fallback: stitch top chunks + light guidance
    if (!hits.length) {
      return {
        text: "I don't have enough indexed material on that yet. Try asking about Samuel's projects, skills, vision, or how to contact him — or check back after new content is published in the admin.",
        hits,
        source: 'fallback',
      };
    }

    const top = hits[0];
    let text = top.text;
    // Prefer concise lead from highest score
    if (text.length > 420) text = text.slice(0, 400).replace(/\s+\S*$/, '') + '…';

    const extras = hits
      .slice(1, 3)
      .map((h) => h.meta.title || h.meta.name || h.meta.category)
      .filter(Boolean);
    if (extras.length) {
      text += '\n\nRelated: ' + extras.join(' · ');
    }

    // Navigation hint from meta
    const section = hits.find((h) => h.meta.section)?.meta.section;
    if (section) {
      text += `\n\n(I can take you to the ${section} section if you'd like.)`;
    }

    return { text, hits, source: 'rag', section };
  }

  // Public API
  window.LINDEN_RAG = {
    rebuild: rebuildFromCMS,
    retrieve,
    buildContext,
    answer: answerWithRAG,
    isReady: () => ready,
    size: () => corpus.length,
  };

  // Auto-index when DOM ready (after LINDEN KB exists)
  function boot() {
    const run = () =>
      rebuildFromCMS().then((r) => {
        console.info('[LINDEN RAG] indexed', r.count, 'documents');
      });
    run();
    // Refresh periodically so admin updates flow in without reload
    setInterval(run, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 500));
  } else {
    setTimeout(boot, 500);
  }
})();
