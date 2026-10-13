/* ═══════════════════════════════════════════════════════════════
  RLAlphaLabs — Main JS v3
   Dual-theme · engagement chrome · real data · grounded charts
   Works on every page: features activate only when their target
   elements exist on the page.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ─── Resolve site-data.json relative to THIS script (subpage-safe) ─ */
const SCRIPT_URL = document.currentScript ? document.currentScript.src : '';
const DATA_URL = SCRIPT_URL
  ? new URL('../data/site-data.json', SCRIPT_URL).href
  : 'data/site-data.json';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

fetch(DATA_URL)
  .then(r => r.json())
  .then(data => boot(data))
  .catch(() => {
    console.warn('Could not fetch site-data.json — using embedded fallback');
    boot(FALLBACK_DATA);
  });

/* ─── Minimal fallback (offline / file:// dev) ────────────────── */
const FALLBACK_DATA = {
  experiments: [
    { id:'Result', date:'Apr 2026', algo:'Actor-Critic (JAX)', total_steps:5000000, sps:9700, n_envs:64, n_assets:20, test_sharpe:0.49, val_sharpe:1.30, test_win_rate:65.0, test_sortino:0.47, status:'complete' }
  ],
  data_coverage: { total_stocks:700, total_parquet_files:5000, granularities:{'1min':600,'3min':700,'5min':700,'10min':700,'15min':700,'30min':700,'1hour':600,'daily':700}, indices:['Nifty 50','Nifty 100','Nifty 200','Nifty 500','Nifty Midcap 100','Nifty Smallcap 100'] },
  portfolio_sample: { symbols:['RELIANCE','HDFCBANK','INFY','TCS','ICICIBANK','HINDUNILVR','SBIN','BAJFINANCE','AXISBANK','KOTAKBANK'], names:['Reliance Industries','HDFC Bank','Infosys','TCS','ICICI Bank','Hindustan Unilever','SBI','Bajaj Finance','Axis Bank','Kotak Mahindra'] },
  equity_curves: { labels:[], rl_portfolio:[], nifty50:[] },
  hero_curve: []
};

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
   BOOT
   ═══════════════════════════════════════════════════════════════ */
function boot(data) {
  initTheme();
  initNav();
  initScrollChrome();
  initSectionDots();
  initTicker(data.portfolio_sample.symbols);
  initParticles();
  Charts.init(data);
  initExperimentTable(data.experiments);
  initStockGrid(data.portfolio_sample);
  initCounters();
  initReveal();
  initMobileCta();
  initMobileMenu();
  initActiveNav();
  initArticleEnhancements();
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
   TICKER — illustrative sample universe symbols with placeholder,
   non-live prices/changes. NOT live prices, NOT holdings.
   ═══════════════════════════════════════════════════════════════ */
function initTicker(symbols) {
  const track = document.getElementById('tickerTrack');
  if (!track) return;

  // Placeholder prices/changes — illustrative only, not real market data
  const seed_prices = [2850, 1680, 1520, 3940, 1280, 2440, 820, 6890, 1140, 1890,
                       720, 4200, 1360, 4800, 980, 2100, 1890, 430, 2760, 1150];
  const seed_chg    = [1.2, -0.4, 0.8, -1.1, 2.1, 0.3, -0.7, 1.5, -0.2, 0.9,
                       -1.3, 0.6, 1.8, -0.5, 2.3, -0.8, 0.4, -1.6, 0.7, 1.1];

  const items = symbols.slice(0, 20).map((sym, i) => {
    const price = seed_prices[i] || 1000;
    const chg   = seed_chg[i] || 0;
    const cls   = chg >= 0 ? 'tick-up' : 'tick-dn';
    const sign  = chg >= 0 ? '+' : '';
    return `<span class="ticker-item"><span class="tick-sym">${sym}</span>₹${price.toLocaleString('en-IN')} <span class="${cls}">${sign}${chg}%</span></span>`;
  }).join('');

  track.innerHTML = items + items; // duplicate for seamless loop
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
   CHARTS — theme-aware; re-rendered on theme change
   ═══════════════════════════════════════════════════════════════ */
const Charts = (() => {
  let data = null;
  let heroChart = null, perfChart = null;

  function palette() {
    return {
      line:    cssVar('--chart-line')   || '#00c8f0',
      bench:   cssVar('--chart-bench')  || '#3d526e',
      grid:    cssVar('--chart-grid')   || 'rgba(255,255,255,0.04)',
      tick:    cssVar('--chart-tick')   || '#3d526e',
      fillA:   cssVar('--chart-fill-a') || 'rgba(0,200,240,0.2)',
      fillB:   cssVar('--chart-fill-b') || 'rgba(0,200,240,0)',
      tipBg:   cssVar('--tooltip-bg')   || 'rgba(6,13,28,0.95)',
    };
  }

  function tooltipStyle(p) {
    return {
      mode: 'index', intersect: false,
      backgroundColor: p.tipBg,
      borderColor: p.grid, borderWidth: 1,
      titleColor: '#c5d0e8', bodyColor: '#7a92b4',
      callbacks: { label: c => ` ${c.dataset.label || 'Portfolio'}: ${c.parsed.y.toFixed(1)}` }
    };
  }

  function axisStyle(p) {
    return {
      grid: { color: p.grid, drawBorder: false },
      ticks: { color: p.tick, font: { family: "'JetBrains Mono'", size: 10 } },
      border: { display: false }
    };
  }

  function renderHero(p) {
    const canvas = document.getElementById('heroChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const curve = data.hero_curve;
    if (!curve || !curve.length) return;

    const grad = canvas.getContext('2d').createLinearGradient(0, 0, 0, 200);
    grad.addColorStop(0, p.fillA);
    grad.addColorStop(1, p.fillB);

    // Hero curve is illustrative shape only — no numeric return figure is derived or displayed.
    if (heroChart) heroChart.destroy();
    heroChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: curve.map((_, i) => i),
        datasets: [{ data: curve, borderColor: p.line, borderWidth: 2, pointRadius: 0, fill: true, backgroundColor: grad, tension: 0.4 }]
      },
      options: {
        responsive: true,
        animation: REDUCED_MOTION ? false : { duration: 1800, easing: 'easeInOutQuart' },
        plugins: { legend: { display: false }, tooltip: tooltipStyle(p) },
        scales: {
          x: { display: false },
          y: Object.assign(axisStyle(p), { ticks: Object.assign(axisStyle(p).ticks, { callback: v => v.toFixed(0) }) })
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false }
      }
    });
  }

  function renderPerf(p) {
    const canvas = document.getElementById('perfChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const { labels, rl_portfolio, nifty50 } = data.equity_curves;
    if (!rl_portfolio || !rl_portfolio.length) return;

    const ctx = canvas.getContext('2d');
    const gradRL = ctx.createLinearGradient(0, 0, 0, 320);
    gradRL.addColorStop(0, p.fillA);
    gradRL.addColorStop(1, p.fillB);
    const gradBench = ctx.createLinearGradient(0, 0, 0, 320);
    gradBench.addColorStop(0, p.grid);
    gradBench.addColorStop(1, 'rgba(0,0,0,0)');

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const n = labels.length;
    const monthLabels = labels.map((_, i) => {
      const m = Math.floor(i / (n / 12));
      return i % Math.round(n / 12) === 0 ? months[Math.min(m, 11)] : '';
    });

    if (perfChart) perfChart.destroy();
    perfChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [
          { label: 'RL Portfolio', data: rl_portfolio, borderColor: p.line, borderWidth: 2, pointRadius: 0, fill: true, backgroundColor: gradRL, tension: 0.4 },
          { label: 'NIFTY 50', data: nifty50, borderColor: p.bench, borderWidth: 1.5, pointRadius: 0, fill: true, backgroundColor: gradBench, tension: 0.4, borderDash: [5, 4] }
        ]
      },
      options: {
        responsive: true,
        animation: REDUCED_MOTION ? false : { duration: 1400, easing: 'easeInOutQuart' },
        plugins: { legend: { display: false }, tooltip: tooltipStyle(p) },
        scales: {
          x: axisStyle(p),
          y: Object.assign(axisStyle(p), { ticks: Object.assign(axisStyle(p).ticks, { callback: v => v.toFixed(0) }) })
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false }
      }
    });
  }

  function renderAll() {
    const p = palette();
    renderHero(p);
    renderPerf(p);
  }

  function init(d) {
    data = d;
    renderAll();
    document.addEventListener('rlal:theme', () => renderAll());
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════
   EXPERIMENT TABLE — real data from JSON
   ═══════════════════════════════════════════════════════════════ */
function initExperimentTable(experiments) {
  const tbody = document.getElementById('expTableBody');
  if (!tbody) return;

  tbody.innerHTML = experiments.map(e => `
    <tr>
      <td class="run-id">${e.id}</td>
      <td style="color:var(--t3)">${e.date}</td>
      <td style="color:var(--t2)">${e.algo}</td>
      <td>${(e.total_steps / 1e6).toFixed(1)}M</td>
      <td class="${e.sps > 9000 ? 'val-good' : 'val-ok'}">${e.sps.toLocaleString()}</td>
      <td style="color:var(--t3)">${e.n_envs}</td>
      <td class="${e.test_sharpe >= 0.45 ? 'val-good' : 'val-ok'}">${e.test_sharpe.toFixed(2)}</td>
      <td class="${e.val_sharpe >= 1.0 ? 'val-good' : 'val-ok'}">${e.val_sharpe.toFixed(2)}</td>
      <td class="${e.test_win_rate >= 60 ? 'val-good' : 'val-ok'}">${e.test_win_rate.toFixed(1)}%</td>
      <td style="color:var(--t2)">${e.test_sortino.toFixed(2)}</td>
      <td><span class="status-done">✓ ${e.status}</span></td>
    </tr>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════════
   STOCK GRID — real NIFTY 50 symbols
   ═══════════════════════════════════════════════════════════════ */
function initStockGrid(sample) {
  const grid = document.getElementById('stockGrid');
  if (!grid) return;
  grid.innerHTML = sample.symbols.map(sym =>
    `<div class="stock-chip">${sym}</div>`).join('');
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTERS (easeOut cubic)
   ═══════════════════════════════════════════════════════════════ */
function initCounters() {
  const els = document.querySelectorAll('[data-target]');
  if (!els.length) return;
  const ease = t => 1 - Math.pow(1 - t, 3);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseFloat(el.dataset.target);
      const dec = parseInt(el.dataset.dec || '0');
      const sfx = el.dataset.sfx || '';
      if (REDUCED_MOTION) { el.textContent = end.toFixed(dec) + sfx; observer.unobserve(el); return; }
      const dur = 1800;
      const t0  = performance.now();

      (function tick(now) {
        const t   = Math.min((now - t0) / dur, 1);
        const val = end * ease(t);
        el.textContent = val.toFixed(dec) + sfx;
        if (t < 1) requestAnimationFrame(tick);
      })(t0);

      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  els.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (REDUCED_MOTION) { els.forEach(el => el.classList.add('visible')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const parent = entry.target.parentElement;
      const pending = parent ? [...parent.querySelectorAll('.reveal:not(.visible)')] : [];
      const i = pending.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), Math.min(i * 70, 350));
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));
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
   STICKY BOTTOM CTA — mobile only, home only. Appears after the
   hero, hides when the contact section is on screen.
   ═══════════════════════════════════════════════════════════════ */
function initMobileCta() {
  const contact = document.getElementById('contact');
  if (!contact) return;
  if (!window.matchMedia('(max-width: 860px)').matches) return;

  const bar = document.createElement('div');
  bar.id = 'mobileCta';
  bar.innerHTML = '<a href="#contact" class="btn-primary">Request Access</a>';
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
   CONTACT FORM (mailto for static hosting)
   ═══════════════════════════════════════════════════════════════ */
function handleSubmit(e) {
  e.preventDefault();
  const f    = e.target;
  const name = f.name.value.trim();
  const mail = f.email.value.trim();
  const type = f.type.value;
  const msg  = f.message.value.trim();
  if (!name || !mail) return;

  const sub  = encodeURIComponent(`[RLAlphaLabs] ${type || 'Inquiry'} from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${mail}\nType: ${type}\n\n${msg}`);
  window.location.href = `mailto:connect@rlalphalabs.com?subject=${sub}&body=${body}`;

  setTimeout(() => {
    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('formSuccess').style.display  = 'block';
  }, 300);
}
