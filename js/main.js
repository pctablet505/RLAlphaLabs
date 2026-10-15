/* ═══════════════════════════════════════════════════════════════
  RL Alpha Labs, site v3 on the live design. One script for every page; every page works without it.
  Content is hidden for its entrance only while this script runs (html.js-reveal), and is shown again after
  2.5 s if the browser never reports an element as seen. Theme, nav, progress bar, section dots, particles,
  counters, the contact flow.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ==== SITE CONSTANTS: the only place these values live ====
   The mailbox Send writes to is kept as character codes, so the address never appears as text in any file or
   on the page. It is put together only when a visitor presses Send or Copy (the owner, 2026-10-15). */
const SITE = {
  FOUNDER_FIRST_NAME: 'Rahul',
  FOUNDER_LINKEDIN_URL: 'https://www.linkedin.com/in/pctablet505',
  MAIL_USER: [119, 111, 114, 107, 46, 114, 97, 104, 117, 108, 49, 50, 54],
  MAIL_DOMAIN: [103, 109, 97, 105, 108, 46, 99, 111, 109]
};
/* ==== END SITE CONSTANTS ==== */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══════════════════════════════════════════════════════════════
   THEME — dark default, persisted, 'T' shortcut, chart re-render
   ═══════════════════════════════════════════════════════════════ */
const THEME_KEY = 'rlal-theme';

function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function setTheme(theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }
  document.dispatchEvent(new CustomEvent('rlal:theme', { detail: theme }));
}

function initTheme() {
  // One frame of no-transitions so first paint doesn't cross-fade
  document.body.classList.add('no-transitions');
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.body.classList.remove('no-transitions')));

  document.querySelectorAll('.theme-toggle').forEach(btn =>
    btn.addEventListener('click', () =>
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark')));

  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 't') return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
}

/* Read a CSS custom property (theme-aware colors for canvas) */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}


/* ═══════════════════════════════════════════════════════════════
   BOOT (runs at the end of the file, once every function exists)
   ═══════════════════════════════════════════════════════════════ */
function boot() {
  initTheme();
  initNav();
  initScrollChrome();
  initSectionDots();
  initParticles();
  initCounters();
  initReveal();
  try { initGuess(); initTypewriter(); } catch (e) { /* the page reads the same without them */ }
  initMobileCta();
  initMobileMenu();
  initActiveNav();
  initArticleEnhancements();
  initContact();
}

/* ═══════════════════════════════════════════════════════════════
   NAV scroll state
   ═══════════════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL CHROME — progress bar + back-to-top
   ═══════════════════════════════════════════════════════════════ */
function initScrollChrome() {
  const bar = document.getElementById('scrollProgress');
  const top = document.getElementById('backTop');
  const onScroll = () => {
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    if (top) top.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' }));
}

/* ═══════════════════════════════════════════════════════════════
   SECTION DOTS — fixed right rail on the home page
   ═══════════════════════════════════════════════════════════════ */
function initSectionDots() {
  const rail = document.getElementById('sectionDots');
  if (!rail) return;
  const sections = [...document.querySelectorAll('section[id][data-dot]')];
  if (!sections.length) { rail.remove(); return; }

  rail.innerHTML = sections.map(s =>
    `<a href="#${s.id}" data-label="${s.dataset.dot}" data-for="${s.id}" aria-label="${s.dataset.dot}"></a>`).join('');

  const links = rail.querySelectorAll('a');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle('on', l.dataset.for === e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ═══════════════════════════════════════════════════════════════
   PARTICLES (theme-aware, disabled under reduced motion)
   ═══════════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas || REDUCED_MOTION) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  const alpha = () => parseFloat(cssVar('--particle-a')) || 0.3;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Pt {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 8;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.35 + 0.1);
      this.r  = Math.random() * 1.2 + 0.4;
      this.a  = Math.random() * alpha() + 0.05;
      this.c  = Math.random() > 0.55 ? '0,200,240' : '110,168,254';
    }
    tick() { this.x += this.vx; this.y += this.vy; if (this.y < -8) this.reset(); }
    draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${this.c},${this.a})`; ctx.fill(); }
  }

  function connect() {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(0,200,240,${0.04 * (1 - d / 90)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
      }
    }
  }

  function frame() { ctx.clearRect(0, 0, W, H); connect(); pts.forEach(p => { p.tick(); p.draw(); }); requestAnimationFrame(frame); }

  resize();
  const COUNT = window.innerWidth < 760 ? 36 : 80;
  pts = Array.from({ length: COUNT }, () => new Pt());
  frame();
  window.addEventListener('resize', () => { resize(); }, { passive: true });
}


/* ═══════════════════════════════════════════════════════════════
   COUNTERS — the page already shows the final numbers; on sight they count up once.
   A timer sets the final value again, so a hidden tab never leaves a half-count.
   ═══════════════════════════════════════════════════════════════ */
function initCounters() {
  const els = document.querySelectorAll('[data-target]');
  if (!els.length || REDUCED_MOTION || !('IntersectionObserver' in window)) return;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const show = (el, v) => {
    const dec = parseInt(el.dataset.dec || '0', 10);
    const sfx = el.dataset.sfx || '';
    const n = el.dataset.fmt ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec);
    el.textContent = n + sfx;
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = parseFloat(el.dataset.target);
      const dur = 1600;
      const t0 = performance.now();
      observer.unobserve(el);
      (function tick(now) {
        const t = Math.min((now - t0) / dur, 1);
        show(el, end * ease(t));
        if (t < 1) requestAnimationFrame(tick);
      })(t0);
      setTimeout(() => show(el, end), dur + 300);
    });
  }, { threshold: 0.6 });
  els.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL — entrance only; nothing needs a click or a hover
   ═══════════════════════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const bars = document.querySelectorAll('.bars');
  const showAll = () => { els.forEach(el => el.classList.add('visible')); bars.forEach(b => b.classList.add('in')); };
  if (!document.documentElement.classList.contains('js-reveal') || !('IntersectionObserver' in window)) { showAll(); return; }

  let heard = 0;
  const obs = new IntersectionObserver(entries => {
    heard += entries.length;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      obs.unobserve(el);
      const parent = el.parentElement;
      const pending = parent ? Array.from(parent.children).filter(c => c.classList.contains('reveal') && !c.classList.contains('visible')) : [];
      const i = Math.max(0, pending.indexOf(el));
      setTimeout(() => el.classList.add('visible'), Math.min(i * 70, 350));
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));

  const barObs = new IntersectionObserver(entries => {
    heard += entries.length;
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); barObs.unobserve(e.target); } });
  }, { threshold: 0.3 });
  bars.forEach(b => barObs.observe(b));

  /* If the browser never reported anything (a hidden tab or pane), show what is on screen now, and from then on
     whatever scrolls into view, so nothing can stay hidden where the observer is silent. */
  const onScreen = () => {
    els.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible'); });
    bars.forEach(b => { if (b.getBoundingClientRect().top < window.innerHeight) b.classList.add('in'); });
  };
  setTimeout(() => {
    if (heard) return;
    onScreen();
    let queued = false;   /* a timer, not an animation frame: it also runs while the tab is throttled */
    window.addEventListener('scroll', () => {
      if (heard || queued) return;
      queued = true;
      setTimeout(() => { queued = false; onScreen(); }, 80);
    }, { passive: true });
  }, 2500);
}




/* ═══════════════════════════════════════════════════════════════
   GUESS FIRST — the answer appears by itself a moment after its card is seen (CSS keys it to .seen, and shows
   it in any case five seconds after .visible). A tap on an option shows it at once and marks the guess.
   ═══════════════════════════════════════════════════════════════ */
function initGuess() {
  const cards = Array.from(document.querySelectorAll('.guess-card'));
  if (!cards.length) return;
  const total = document.querySelector('.guess-total');
  const WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six'];
  let played = 0, right = 0;

  cards.forEach(card => {
    const want = parseInt(card.dataset.right, 10);
    const opts = Array.from(card.querySelectorAll('.gopt'));
    const mark = card.querySelector('.guess-mark');
    opts.forEach(btn => btn.addEventListener('click', () => {
      if (card.classList.contains('told')) return;
      const pick = parseInt(btn.dataset.i, 10);
      const hit = pick === want;
      card.classList.add('told');
      opts.forEach(b => {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        b.classList.toggle('right', parseInt(b.dataset.i, 10) === want);
        b.classList.toggle('wrong', b === btn && !hit);
        b.disabled = true;
      });
      played += 1;
      right += hit ? 1 : 0;
      mark.textContent = hit ? '✓ You got it' : '✗ Not quite';
      mark.className = 'guess-mark mono ' + (hit ? 'hit' : 'miss');
      if (total) total.textContent = 'Your guesses so far: ' + WORDS[right] + ' of ' + WORDS[played] + ' right';
    }));
  });

  if (!document.documentElement.classList.contains('js-reveal') || !('IntersectionObserver' in window)) return;
  let heard = 0;
  const obs = new IntersectionObserver(entries => {
    heard += entries.length;
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio >= 0.5) { e.target.classList.add('seen'); obs.unobserve(e.target); }
    });
  }, { threshold: [0.5] });
  cards.forEach(c => obs.observe(c));
  setTimeout(() => { if (!heard) cards.forEach(c => c.classList.add('seen')); }, 3000);
}

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER — the chart shell's title is complete in the HTML; on load the script retypes it once.
   ═══════════════════════════════════════════════════════════════ */
function initTypewriter() {
  const el = document.getElementById('shellTitle');
  if (!el || REDUCED_MOTION) return;
  const text = el.textContent;
  el.textContent = '';
  el.classList.add('typing');
  let i = 0;
  const step = () => {
    i += 1;
    el.textContent = text.slice(0, i);
    if (i < text.length) setTimeout(step, text[i - 1] === '·' ? 240 : 26);
    else setTimeout(() => el.classList.remove('typing'), 1800);
  };
  setTimeout(step, 450);
  setTimeout(() => { el.textContent = text; el.classList.remove('typing'); }, 7000);   /* whatever happened, the title is complete */
}
/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU + smooth anchor scroll
   ═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  // Backdrop: tap-outside-to-close
  const backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  document.body.appendChild(backdrop);

  const setOpen = open => {
    menu.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  btn.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));

  // Smooth scroll for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const tgt = document.querySelector(a.getAttribute('href'));
      if (!tgt) return;
      e.preventDefault();
      window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - 72, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   STICKY BOTTOM CTA — phones, home page only. Appears after the first screen,
   hides while the contact section is on screen.
   ═══════════════════════════════════════════════════════════════ */
function initMobileCta() {
  const contact = document.getElementById('contact');
  if (!contact) return;
  if (!window.matchMedia('(max-width: 860px)').matches) return;

  const bar = document.createElement('div');
  bar.id = 'mobileCta';
  bar.innerHTML = '<a href="#contact" class="btn-primary">Write to ' + SITE.FOUNDER_FIRST_NAME + '</a>';
  document.body.appendChild(bar);

  const hero = document.getElementById('hero');
  let contactInView = false;
  const update = () => {
    const past = window.scrollY > (hero ? hero.offsetHeight * 0.7 : 480);
    bar.classList.toggle('show', past && !contactInView);
  };
  new IntersectionObserver(es => {
    contactInView = es[0].isIntersecting;
    update();
  }, { rootMargin: '-10% 0px -10% 0px' }).observe(contact);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE NAV HIGHLIGHT (home page sections)
   ═══════════════════════════════════════════════════════════════ */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove('nav-on'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('nav-on');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ═══════════════════════════════════════════════════════════════
   ARTICLE ENHANCEMENTS — TOC scrollspy, heading anchors,
   reading time. Activate only where the markup exists.
   ═══════════════════════════════════════════════════════════════ */
function initArticleEnhancements() {
  const prose = document.querySelector('.article-prose');
  if (!prose) return;
  const headings = [...prose.querySelectorAll('h2, h3')];

  // Slugify + assign ids + anchor links
  const used = new Set();
  headings.forEach(h => {
    if (!h.id) {
      let slug = h.textContent.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
      let s = slug, n = 2;
      while (used.has(s)) s = `${slug}-${n++}`;
      used.add(s);
      h.id = s;
    }
    if (!h.querySelector('.anchor-link')) {
      const a = document.createElement('a');
      a.className = 'anchor-link';
      a.href = `#${h.id}`;
      a.textContent = '#';
      a.setAttribute('aria-label', `Link to ${h.textContent.trim()}`);
      h.appendChild(a);
    }
  });

  // TOC
  const toc = document.getElementById('tocList');
  if (toc && headings.length) {
    toc.innerHTML = headings.map(h =>
      `<li><a href="#${h.id}" class="${h.tagName === 'H3' ? 'toc-h3' : ''}">${h.textContent.replace('#', '').trim()}</a></li>`).join('');
    const tocLinks = toc.querySelectorAll('a');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        tocLinks.forEach(l => l.classList.toggle('on', l.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    headings.forEach(h => obs.observe(h));
    // Mobile: "On this page" title toggles the collapsed panel (CSS ≤860px)
    const title = toc.closest('.research-sidebar')?.querySelector('.toc-title');
    if (title) {
      title.addEventListener('click', () =>
        title.closest('.research-sidebar').classList.toggle('toc-open'));
    }
  }

  // Reading time
  const rt = document.querySelector('[data-reading-time]');
  if (rt) {
    const words = prose.textContent.trim().split(/\s+/).length;
    rt.textContent = `~${Math.max(1, Math.round(words / 200))} min read`;
  }
}


/* ═══════════════════════════════════════════════════════════════
   CONTACT — Send opens the visitor's own mail app with the message ready.
   A link from another page, or a topic button, can choose the topic first.
   The address is built from character codes at click time; Copy puts it on the clipboard only.
   ═══════════════════════════════════════════════════════════════ */
function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const msg = document.getElementById('f-msg');
  const status = document.getElementById('f-status');
  const done = document.getElementById('formSuccess');
  const chip = document.getElementById('topicChip');
  const chipText = document.getElementById('topicText');
  const copyStatus = document.getElementById('copyStatus');
  const mailbox = () => String.fromCharCode.apply(null, SITE.MAIL_USER) + String.fromCharCode(64) +
                        String.fromCharCode.apply(null, SITE.MAIL_DOMAIN);
  let topic = '';
  let composed = '';
  const known = new Set(Array.from(document.querySelectorAll('[data-topic]')).map(a => a.getAttribute('data-topic')));

  const setTopic = t => {
    topic = known.has(t) ? t : '';
    chip.hidden = !topic;
    chipText.textContent = topic;
  };
  const say = (text, kind) => { status.textContent = text; status.className = 'form-status' + (kind ? ' ' + kind : ''); };

  document.querySelectorAll('[data-topic]').forEach(a => a.addEventListener('click', () => {
    setTopic(a.getAttribute('data-topic'));
    done.hidden = true;
    say('');
    setTimeout(() => msg.focus({ preventScroll: true }), REDUCED_MOTION ? 0 : 600);
  }));
  document.getElementById('topicClear').addEventListener('click', () => setTopic(''));
  document.querySelectorAll('[data-role]').forEach(a => a.addEventListener('click', () => {
    const want = a.getAttribute('data-role');
    Array.from(form.querySelectorAll('input[name="role"]')).forEach(r => { r.checked = r.value === want; });
  }));

  const q = new URLSearchParams(location.search);
  if (q.get('topic')) setTopic(q.get('topic'));
  const wanted = q.get('role');
  if (wanted) Array.from(form.querySelectorAll('input[name="role"]')).forEach(r => { if (r.value === wanted) r.checked = true; });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = msg.value.trim();
    if (text.length < 5) { say('Write a few words first.', 'err'); msg.focus(); return; }
    const role = form.elements['role'].value || '';
    const bits = [role, topic].filter(Boolean);
    const subject = 'RL Alpha Labs: ' + (bits.length ? bits.join(', ') : 'a message from the site');
    const body = (role ? 'I am a: ' + role + '\r\n' : '') + (topic ? 'About: ' + topic + '\r\n' : '') + (bits.length ? '\r\n' : '') + text;
    composed = subject + '\r\n\r\n' + body;
    const a = document.createElement('a');
    a.href = 'mailto:' + mailbox() + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    a.remove();
    say('');
    copyStatus.textContent = '';
    done.hidden = false;
  });

  const copy = async (text, ok) => {
    try {
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = ok;
      return;
    } catch (err) { /* fall through to the older way */ }
    const t = document.createElement('textarea');
    t.value = text;
    t.setAttribute('readonly', '');
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (err) { copied = false; }
    t.remove();
    copyStatus.textContent = copied ? ok : 'Copying did not work here. Message ' + SITE.FOUNDER_FIRST_NAME + ' on LinkedIn instead.';
  };
  document.getElementById('copyMsg').addEventListener('click', () => copy(composed, 'Message copied.'));
  document.getElementById('copyAddr').addEventListener('click', () => copy(mailbox(), 'Address copied.'));
}

boot();
