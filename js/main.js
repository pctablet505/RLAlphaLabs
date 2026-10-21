/* ═══════════════════════════════════════════════════════════════
   RLAlphaLabs — Main JS v4
   Dual-theme · Interactive Hero Console · NSE Retail Friction Simulator
   User-Controlled Quant Intuition Quiz · Safe DOM Construction
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const SCRIPT_URL = document.currentScript ? document.currentScript.src : '';
const DATA_URL = SCRIPT_URL
  ? new URL('../data/site-data.json', SCRIPT_URL).href
  : 'data/site-data.json';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FALLBACK_DATA = {
  data_coverage: {
    total_stocks: 4277,
    total_parquet_files: 6632,
    granularities: { '1min': 600, '5min': 700, '15min': 700, '1hour': 600, 'daily': 4277 },
    indices: ['Nifty 50', 'Nifty 100', 'Nifty 200', 'Nifty 500', 'Nifty Midcap 150', 'NSE Total Market PIT']
  },
  capital_curve: {
    note: "Illustrative only: the site's simulator cost model (public NSE fees, flat ₹15.34 DP, spreads) applied to its 200-stock quarterly basket preset with an assumed 5%/yr gross edge. Not a study result.",
    labels: ['₹1L', '₹2L', '₹5L', '₹10L', '₹20L', '₹50L', '₹1Cr', '₹2Cr'],
    net_active_spread: [-5.59, -1.51, 1.15, 2.41, 2.81, 3.05, 3.12, 3.16],
    net_active_stat: [-3.56, 0.43, 2.82, 3.62, 4.01, 4.25, 4.33, 4.37]
  }
};

/* ═══════════════════════════════════════════════════════════════
   THEME — OS default, persisted, chart re-render
   (first paint is handled by the inline pre-paint script in <head>;
   the old single-key 'T' shortcut was removed — WCAG 2.1.4)
   ═══════════════════════════════════════════════════════════════ */
const THEME_KEY = 'rlal-theme';
const THEME_COLORS = { dark: '#02060f', light: '#f7f8f6' };

function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function storedTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch (e) { return null; }
}

function syncThemeChrome() {
  const theme = currentTheme();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  });
}

function setTheme(theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  if (persist) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }
  syncThemeChrome();
  document.dispatchEvent(new CustomEvent('rlal:theme', { detail: theme }));
}

function initTheme() {
  document.body.classList.add('no-transitions');
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.body.classList.remove('no-transitions')));

  syncThemeChrome();
  document.querySelectorAll('.theme-toggle').forEach(btn =>
    btn.addEventListener('click', () =>
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark')));

  // Follow live OS theme changes until the visitor picks a theme explicitly.
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', e => {
      if (!storedTheme()) setTheme(e.matches ? 'light' : 'dark', false);
    });
  }
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function replaceUrlParam(key, val) {
  try {
    const url = new URL(window.location.href);
    if (!val || val === 'pass' || val === 'default-qtr' || val === 'paneBench') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, val);
    }
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  } catch (e) {}
}

/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */
function boot(data) {
  initTheme();
  initNav();
  initScrollChrome();
  initSectionDots();
  initAnchors();
  initForms();
  initParticles();
  initHeroConsoleTabs();
  Charts.init(data);
  initFrictionSimulator();
  initIntuitionQuiz();
  initProgressiveSections();
  initVerdictLedger();
  initAboutAvatar();
  initCounters();
  initReveal();
  initMobileCta();
  initMobileMenu();
  initActiveNav();
  initArticleEnhancements();
  initUrlState();
}

/* ═══════════════════════════════════════════════════════════════
   NAV scroll state
   ═══════════════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  let queued = false;
  const update = () => {
    queued = false;
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL CHROME — progress bar + back-to-top (rAF-throttled)
   ═══════════════════════════════════════════════════════════════ */
function initScrollChrome() {
  const bar = document.getElementById('scrollProgress');
  const top = document.getElementById('backTop');
  if (!bar && !top) return;
  let queued = false;
  const update = () => {
    queued = false;
    const y = window.scrollY;
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    }
    if (top) top.classList.toggle('show', y > 900);
  };
  const queue = () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  update();
  if (top) {
    top.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
      // The button hides at the top, so hand keyboard focus to the logo link.
      const home = document.querySelector('#navbar .logo');
      if (home) home.focus({ preventScroll: true });
    });
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION DOTS — fixed right rail on the home page (pointer-only
   affordance: the rail is aria-hidden, so its links stay out of the
   tab order; keyboard users have the nav and the skip link)
   ═══════════════════════════════════════════════════════════════ */
function initSectionDots() {
  const rail = document.getElementById('sectionDots');
  if (!rail) return;
  const sections = [...document.querySelectorAll('section[id][data-dot]')];
  if (!sections.length) { rail.remove(); return; }

  rail.replaceChildren();
  sections.forEach(s => {
    const a = document.createElement('a');
    a.setAttribute('href', `#${s.id}`);
    a.setAttribute('tabindex', '-1');
    a.dataset.label = s.dataset.dot;
    a.dataset.for = s.id;
    rail.appendChild(a);
  });

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
   PARTICLES (theme-aware, disabled under reduced motion; paused when
   off-screen or in a hidden tab; crisp on HiDPI screens)
   ═══════════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas || REDUCED_MOTION) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let W = 0, H = 0, pts = [], raf = 0, onScreen = true;
  let alphaMax = 0.3;
  const readAlpha = () => { alphaMax = parseFloat(cssVar('--particle-a')) || 0.3; };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = Math.round(rect.width) || canvas.offsetWidth || 300;
    H = Math.round(rect.height) || canvas.offsetHeight || 150;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Pt {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 8;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.35 + 0.1);
      this.r = Math.random() * 1.2 + 0.4;
      this.a = Math.random() * alphaMax + 0.05;
      this.c = Math.random() > 0.55 ? '0,200,240' : '110,168,254';
    }
    tick() { this.x += this.vx; this.y += this.vy; if (this.y < -8) this.reset(); }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.c},${this.a})`;
      ctx.fill();
    }
  }

  function connect() {
    ctx.lineWidth = 0.5;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 8100) {
          const d = Math.sqrt(d2);
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,200,240,${0.04 * (1 - d / 90)})`;
          ctx.stroke();
        }
      }
    }
  }

  function frame() {
    raf = 0;
    ctx.clearRect(0, 0, W, H);
    connect();
    pts.forEach(p => { p.tick(); p.draw(); });
    start();
  }
  function start() {
    if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  readAlpha();
  resize();
  const COUNT = window.innerWidth < 760 ? 36 : 75;
  pts = Array.from({ length: COUNT }, () => new Pt());
  start();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      onScreen = entries[entries.length - 1].isIntersecting;
      if (onScreen) start(); else stop();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
  document.addEventListener('rlal:theme', readAlpha);
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   HERO CONSOLE TABS & INTERACTIVE STUDY EVIDENCE STRIP
   ═══════════════════════════════════════════════════════════════ */
function initHeroConsoleTabs() {
  const consoleEl = document.getElementById('heroConsole');
  const tabs = [...document.querySelectorAll('.ctab')];
  const panes = [...document.querySelectorAll('.console-pane')];
  if (!tabs.length || !panes.length) return;

  function activateTab(tab, syncUrl = true) {
    if (!tab) return;
    const targetId = tab.dataset.pane;
    tabs.forEach(t => {
      const active = t === tab;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.tabIndex = active ? 0 : -1; // APG tabs: only the selected tab sits in the Tab order
    });
    panes.forEach(p => {
      p.classList.toggle('active', p.id === targetId);
    });
    if (syncUrl) replaceUrlParam('tab', targetId);
    document.dispatchEvent(new CustomEvent('rlal:tabchange', { detail: targetId }));
  }

  // APG tabs: a panel with no focusable content is itself focusable, so keyboard users can reach its text
  panes.forEach(p => {
    if (!p.querySelector('a[href], button, input, select, textarea, [tabindex]')) p.tabIndex = 0;
  });

  tabs.forEach((tab, idx) => {
    tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
    tab.addEventListener('click', () => activateTab(tab, true));
    tab.addEventListener('keydown', e => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus();
      activateTab(next, true);
    });
  });

  // 1 / 2 / 3 switch views only while focus is inside the console (WCAG 2.1.4 — no page-wide key hijack)
  if (consoleEl) {
    consoleEl.addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== '1' && e.key !== '2' && e.key !== '3') return;
      const tab = tabs[parseInt(e.key, 10) - 1];
      if (!tab) return;
      e.preventDefault();
      tab.focus();
      activateTab(tab, true);
    });
  }

  // Interactive Benchmark Study Evidence Inspector in Pane 1
  const STUDY_EVIDENCE = {
    pead: {
      tag: 'POST-FILING DRIFT · t > 2.5',
      desc: 'Entered only after the filing was public. Stayed positive under measured spreads and doubled costs, above a high-lakh capital floor.',
      linkText: 'Test in Quiz ↓',
      href: '#intuition',
      quizStep: '4'
    },
    hysteresis: {
      tag: 'TAX-GATED HYSTERESIS · 20.7 YEARS',
      desc: 'Retention buffer + no-trade band cut annual turnover by 58% and deferred exits across the 365-day LTCG boundary (+39 to +45 bps/yr net).',
      linkText: 'Simulate Tax-Gated ↓',
      href: '#simulator',
      simPreset: 'tax-gated'
    },
    llm: {
      tag: 'MASKED LLM FILINGS · 1,563 EVENTS',
      desc: 'With company names and dates scrubbed, reading filing prose added +1.4 pp over accounting ratios (74.2% vs 72.8%)—below the 5.0 pp cost hurdle.',
      linkText: 'Test in Quiz ↓',
      href: '#intuition',
      quizStep: '0'
    },
    rl: {
      tag: 'CONTINUOUS RL · 144 CELLS (12 SEEDS × 6 FOLDS)',
      desc: 'Unconstrained RL churned ~710 trades per evaluation window, turning calibrated signal into statutory fee drag (-1.96 OOS IR vs -2.04 sham).',
      linkText: 'Simulate Weekly Churn ↓',
      href: '#simulator',
      simPreset: 'ai-churn'
    }
  };

  const benchRows = [...document.querySelectorAll('.bench-row[data-study]')];
  const beTag = document.getElementById('beTag');
  const beDesc = document.getElementById('beDesc');
  const beLink = document.getElementById('beLink');

  function selectStudyRow(row, moveFocus = false) {
    if (!row) return;
    const key = row.dataset.study;
    const info = STUDY_EVIDENCE[key];
    if (!info) return;
    benchRows.forEach(r => {
      const on = r === row;
      r.classList.toggle('active', on);
      r.setAttribute('aria-selected', on ? 'true' : 'false');
      r.tabIndex = on ? 0 : -1; // APG listbox: one Tab stop, arrows move between options
    });
    if (moveFocus) row.focus();
    if (beTag) beTag.textContent = info.tag;
    if (beDesc) beDesc.textContent = info.desc;
    if (beLink) {
      beLink.textContent = info.linkText;
      beLink.setAttribute('href', info.href);
      if (info.simPreset) {
        beLink.dataset.simPreset = info.simPreset;
      } else {
        delete beLink.dataset.simPreset;
      }
      if (info.quizStep !== undefined) {
        beLink.dataset.quizStep = info.quizStep;
      } else {
        delete beLink.dataset.quizStep;
      }
    }
  }

  const initialRow = benchRows.find(r => r.classList.contains('active')) || benchRows[0];
  benchRows.forEach((row, idx) => {
    row.tabIndex = row === initialRow ? 0 : -1;
    row.addEventListener('click', () => selectStudyRow(row));
    row.addEventListener('keydown', e => {
      let next = null;
      if (e.key === 'ArrowDown') next = benchRows[(idx + 1) % benchRows.length];
      else if (e.key === 'ArrowUp') next = benchRows[(idx - 1 + benchRows.length) % benchRows.length];
      else if (e.key === 'Home') next = benchRows[0];
      else if (e.key === 'End') next = benchRows[benchRows.length - 1];
      else if (e.key === 'Enter' || e.key === ' ') next = row;
      if (!next) return;
      e.preventDefault();
      selectStudyRow(next, next !== row);
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   CHARTS — theme-aware; re-rendered on theme or tab change
   ═══════════════════════════════════════════════════════════════ */
const Charts = (() => {
  let data = null;
  let heroChart = null;

  function palette() {
    return {
      line:     cssVar('--chart-line')   || '#00c8f0',
      green:    cssVar('--green')        || '#00e5a0',
      amber:    cssVar('--amber')        || '#ffb020',
      bench:    cssVar('--chart-bench')  || '#3d526e',
      grid:     cssVar('--chart-grid')   || 'rgba(255,255,255,0.05)',
      zeroLine: cssVar('--border-hi')    || 'rgba(255,255,255,0.24)',
      tick:     cssVar('--chart-tick')   || '#7a92b4',
      fillA:    cssVar('--chart-fill-a') || 'rgba(0,200,240,0.2)',
      fillB:    cssVar('--chart-fill-b') || 'rgba(0,200,240,0)',
      tipBg:    cssVar('--surface')      || '#091326',
      tipBorder:cssVar('--border-md')    || 'rgba(255,255,255,0.15)',
      tipTitle: cssVar('--t0')           || '#f0f4ff',
      tipBody:  cssVar('--t1')           || '#d5e0f2'
    };
  }

  function axisStyle(p) {
    return {
      grid: { color: p.grid, drawBorder: false },
      ticks: { color: p.tick, font: { family: "'JetBrains Mono'", size: 10 } },
      border: { display: false }
    };
  }

  function renderHeroCapitalCurve(p) {
    const canvas = document.getElementById('heroChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const cap = data.capital_curve || FALLBACK_DATA.capital_curve;
    if (!cap || !cap.labels.length) return;

    if (heroChart) heroChart.destroy();
    heroChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: cap.labels,
        datasets: [
          {
            label: 'After fees, ₹15.34 DP & spreads',
            data: cap.net_active_spread,
            borderColor: p.line,
            backgroundColor: p.fillA,
            borderWidth: 2.5,
            pointRadius: 3.5,
            pointBackgroundColor: p.line,
            fill: true,
            tension: 0.35
          },
          {
            label: 'After statutory fees & DP only',
            data: cap.net_active_stat,
            borderColor: p.green,
            borderWidth: 1.8,
            borderDash: [5, 4],
            pointRadius: 2.5,
            fill: false,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        animation: REDUCED_MOTION ? false : { duration: 600, easing: 'easeOutQuart' },
        plugins: {
          legend: {
            display: true,
            labels: { color: p.tick, font: { family: "'JetBrains Mono'", size: 10.5 }, boxWidth: 12, padding: 12 }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: p.tipBg,
            borderColor: p.tipBorder,
            borderWidth: 1,
            titleColor: p.tipTitle,
            bodyColor: p.tipBody,
            callbacks: {
              label: c => ` ${c.dataset.label}: ${c.parsed.y > 0 ? '+' : ''}${c.parsed.y.toFixed(2)}%/yr`
            }
          }
        },
        scales: {
          x: axisStyle(p),
          y: {
            grid: {
              color: ctx => (ctx.tick && ctx.tick.value === 0 ? p.zeroLine : p.grid),
              lineWidth: ctx => (ctx.tick && ctx.tick.value === 0 ? 1.5 : 1),
              drawBorder: false
            },
            ticks: {
              color: p.tick,
              font: { family: "'JetBrains Mono'", size: 10 },
              callback: v => (v > 0 ? '+' : '') + v + '%'
            },
            border: { display: false }
          }
        }
      }
    });
  }


  function renderAll() {
    const p = palette();
    renderHeroCapitalCurve(p);
  }

  let bound = false;
  function init(d) {
    data = d;
    renderAll();
    if (!bound) {
      bound = true;
      document.addEventListener('rlal:theme', () => renderAll());
      document.addEventListener('rlal:tabchange', e => {
        if (e.detail === 'paneCapital') renderHeroCapitalCurve(palette());
      });
    }
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE NSE RETAIL FRICTION, DP FEE & TAX HURDLE SIMULATOR
   100% Public Indian Statutory Law & Microstructure Math
   ═══════════════════════════════════════════════════════════════ */
function initFrictionSimulator() {
  const capSlider = document.getElementById('simCapSlider');
  const freqSlider = document.getElementById('simFreqSlider');
  const kSlider = document.getElementById('simKSlider');
  const modeBtns = document.querySelectorAll('.sim-mode-btn');
  if (!capSlider || !freqSlider || !kSlider) return;

  const CAP_STOPS = [
    { val: 100000,   label: '₹1 Lakh' },
    { val: 200000,   label: '₹2 Lakh' },
    { val: 500000,   label: '₹5 Lakh' },
    { val: 1000000,  label: '₹10 Lakh' },
    { val: 2000000,  label: '₹20 Lakh' },
    { val: 5000000,  label: '₹50 Lakh' },
    { val: 10000000, label: '₹1 Crore' },
    { val: 20000000, label: '₹2 Crore' }
  ];

  const FREQ_STOPS = [
    { rebalances: 52, label: 'Weekly (52×/yr)',    baseTurn: 18.0, stcgShare: 1.00 },
    { rebalances: 12, label: 'Monthly (12×/yr)',   baseTurn: 6.5,  stcgShare: 0.92 },
    { rebalances: 4,  label: 'Quarterly (4×/yr)',  baseTurn: 2.6,  stcgShare: 0.70 },
    { rebalances: 1,  label: 'Annual (1×/yr)',     baseTurn: 0.85, stcgShare: 0.15 }
  ];

  const K_STOPS = [10, 20, 30, 50, 100, 200];

  let gatedMode = false;
  const liveEl = document.getElementById('simLive');
  let liveReady = false;
  let liveTimer = null;

  function syncSliderVisuals(slider) {
    const min = parseFloat(slider.min || '0');
    const max = parseFloat(slider.max || '1');
    const val = parseFloat(slider.value || '0');
    const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
    slider.style.setProperty('--pct', `${pct.toFixed(1)}%`);
    const tickGroup = document.querySelector(`.sim-ticks[data-slider="${slider.id}"]`);
    if (tickGroup) {
      const idxStr = String(Math.round(val));
      tickGroup.querySelectorAll('span[data-idx]').forEach(sp => {
        sp.classList.toggle('is-on', sp.dataset.idx === idxStr);
      });
    }
  }

  function updateSimulator() {
    const capObj = CAP_STOPS[parseInt(capSlider.value, 10)] || CAP_STOPS[3];
    const freqObj = FREQ_STOPS[parseInt(freqSlider.value, 10)] || FREQ_STOPS[2];
    const kVal = K_STOPS[parseInt(kSlider.value, 10)] || 30;

    syncSliderVisuals(capSlider);
    syncSliderVisuals(freqSlider);
    syncSliderVisuals(kSlider);

    document.getElementById('simCapVal').textContent = capObj.label;
    document.getElementById('simFreqVal').textContent = freqObj.label;
    document.getElementById('simKVal').textContent = `${kVal} Stocks`;
    // Range inputs hold stop indices (0–7); give assistive tech the human value instead
    capSlider.setAttribute('aria-valuetext', capObj.label);
    freqSlider.setAttribute('aria-valuetext', freqObj.label);
    kSlider.setAttribute('aria-valuetext', `${kVal} Stocks`);

    // 1. Ticket size per stock position
    const ticketInr = capObj.val / kVal;
    // Public statutory CNC floor: 20 bps STT + 1.5 bps Stamp + ~0.75 bps Exch/SEBI/GST = 22.25 bps
    const statutoryProportionalBps = 22.25;
    // Flat ₹15.34 DP charge per sell scrip at Zerodha (₹3.50 CDSL + ₹9.50 broker, + 18% GST); other brokers differ
    const dpBps = (15.34 / ticketInr) * 10000;
    const statutoryTotalBps = statutoryProportionalBps + dpBps;

    // 2. Typical NSE round-trip spread (33.7 bps top-100/300, rising to 46 bps for wider universes)
    const spreadBps = kVal <= 50 ? 28.0 : (kVal <= 100 ? 33.7 : 46.5);
    // Whole-share lot rounding penalty for tiny tickets (< ₹5,000/leg)
    const lotPenaltyBps = ticketInr < 5000 ? ((5000 - ticketInr) / 5000) * 35.0 : 0;

    const allInRtBps = statutoryTotalBps + spreadBps + lotPenaltyBps;

    // 3. Annualized turnover & tax wedge
    // Hysteresis + LTCG tax gate reduces effective churn by ~58% and shifts gains toward 13.0% LTCG vs 20.8% STCG
    const turnMult = gatedMode ? 0.42 : 1.0;
    const effectiveTurnovers = freqObj.baseTurn * turnMult;

    const annualStatDragPct = (statutoryTotalBps * effectiveTurnovers) / 100;
    const annualSpreadDragPct = ((spreadBps + lotPenaltyBps) * effectiveTurnovers) / 100;

    // Passive NIFTY 500 Index Fund after-tax benchmark (~13.45%/yr net)
    const passiveNetPct = 13.45;
    // Tax wedge between active realization (20.8% STCG vs 13.0% LTCG) and single terminal redemption
    const effectiveStcgShare = gatedMode ? Math.max(0.10, freqObj.stcgShare * 0.45) : freqObj.stcgShare;
    const taxWedgePct = 1.65 + (effectiveStcgShare * 1.95);

    const totalAnnualDragPct = annualStatDragPct + annualSpreadDragPct + taxWedgePct;
    const requiredGrossPct = passiveNetPct + totalAnnualDragPct;

    // Render KPIs
    const fmtTicket = '₹' + Math.round(ticketInr).toLocaleString('en-IN');
    document.getElementById('kpiTicket').textContent = fmtTicket;
    const dpShare = Math.min(99, Math.round((dpBps / statutoryTotalBps) * 100));
    document.getElementById('kpiTicketSub').textContent = `₹15.34 DP fee = +${dpBps.toFixed(1)} bps (${dpShare}% of statutory)`;

    document.getElementById('kpiRtBps').textContent = `${allInRtBps.toFixed(1)} bps`;
    document.getElementById('kpiRtSub').textContent = `${statutoryTotalBps.toFixed(1)} bps statutory + ${spreadBps.toFixed(1)} bps spread`;

    document.getElementById('kpiDragPct').textContent = `-${totalAnnualDragPct.toFixed(2)}%/yr`;
    document.getElementById('kpiDragSub').textContent = `${effectiveTurnovers.toFixed(1)}×/yr turnover + ${taxWedgePct.toFixed(2)}% tax wedge`;

    document.getElementById('kpiGrossReq').textContent = `${requiredGrossPct.toFixed(1)}%/yr`;
    document.getElementById('kpiGrossSub').textContent = `Required gross to tie ${passiveNetPct}%/yr net index fund`;

    const legStat = document.getElementById('legStatVal');
    const legSprd = document.getElementById('legSprdVal');
    const legTax  = document.getElementById('legTaxVal');
    if (legStat) legStat.textContent = `${annualStatDragPct.toFixed(2)}%`;
    if (legSprd) legSprd.textContent = `${annualSpreadDragPct.toFixed(2)}%`;
    if (legTax)  legTax.textContent  = `${taxWedgePct.toFixed(2)}%`;

    const detailsMeta = document.getElementById('simDetailsMeta');
    if (detailsMeta) {
      detailsMeta.textContent = `${fmtTicket}/stock · ${allInRtBps.toFixed(1)} bps RT`;
    }

    // Stacked bar proportions
    const totalBar = requiredGrossPct;
    document.getElementById('segBase').style.width = `${(passiveNetPct / totalBar) * 100}%`;
    document.getElementById('segStat').style.width = `${(annualStatDragPct / totalBar) * 100}%`;
    document.getElementById('segSprd').style.width = `${(annualSpreadDragPct / totalBar) * 100}%`;
    document.getElementById('segTax').style.width  = `${(taxWedgePct / totalBar) * 100}%`;

    const verdictEl = document.getElementById('simVerdictPill');
    const insightEl = document.getElementById('simInsightText');

    if (totalAnnualDragPct <= 3.6 && ticketInr >= 15000) {
      verdictEl.className = 'sim-verdict-pill good';
      verdictEl.textContent = 'VIABLE HURDLE';
      insightEl.textContent = `At ₹${Math.round(ticketInr).toLocaleString('en-IN')}/stock and ${effectiveTurnovers.toFixed(1)}×/yr turnover, the flat ₹15.34 DP charge shrinks to ${dpBps.toFixed(1)} bps and low-turnover fundamental signals can realistically clear the ${requiredGrossPct.toFixed(1)}%/yr gross bar.`;
    } else if (totalAnnualDragPct <= 7.5) {
      verdictEl.className = 'sim-verdict-pill warn';
      verdictEl.textContent = 'HIGH FRICTION HURDLE';
      insightEl.textContent = `Notice the squeeze: needing ${requiredGrossPct.toFixed(1)}%/yr gross just to tie a passive index fund means weak technical signals (IC < 0.02) lose money net of ${allInRtBps.toFixed(0)} bps round-trip friction and the 20.8% STCG tax wedge.`;
    } else {
      verdictEl.className = 'sim-verdict-pill bad';
      verdictEl.textContent = 'UNVIABLE — CHURN & DP FEE WALL';
      insightEl.textContent = `Mathematical trap: at ₹${Math.round(ticketInr).toLocaleString('en-IN')} per position and ${effectiveTurnovers.toFixed(1)}× annual turnover, statutory fees (${statutoryTotalBps.toFixed(0)} bps/trade) + spreads bleed ${totalAnnualDragPct.toFixed(1)}%/yr—requiring an impossible ${requiredGrossPct.toFixed(1)}%/yr gross return just to match an index fund.`;
    }

    // Debounced, polite summary for screen readers (silent on page load / deep links)
    if (liveEl && liveReady) {
      clearTimeout(liveTimer);
      liveTimer = setTimeout(() => {
        liveEl.textContent = `Gross hurdle ${requiredGrossPct.toFixed(1)}%/yr to tie the index fund. ${verdictEl.textContent}.`;
      }, 600);
    }
  }

  const PRESETS = {
    'ai-churn':     { cap: 1, freq: 0, k: 2, gated: false, label: 'Weekly AI Trader (₹2L · 52×)' },
    'retail-swing': { cap: 2, freq: 1, k: 2, gated: false, label: 'Retail Swing (₹5L · 12×)' },
    'default-qtr':  { cap: 3, freq: 2, k: 2, gated: false, label: 'Mid-Sized Quarterly (₹10L)' },
    'direct-basket':{ cap: 3, freq: 2, k: 5, gated: false, label: '200-Stock Basket (₹10L · 200)' },
    'tax-gated':    { cap: 4, freq: 2, k: 1, gated: true,  label: 'Tax-Gated Low-Churn (₹20L)' }
  };

  const presetBtns = [...document.querySelectorAll('.sim-preset-btn[data-preset]')];
  const presetStatus = document.getElementById('simPresetStatus');

  function syncModeButtons() {
    modeBtns.forEach(b => {
      const on = (b.dataset.mode === 'gated') === gatedMode;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function syncPresetButtons(activeKey) {
    const prevStop = presetBtns.find(b => b.tabIndex === 0);
    let active = null;
    presetBtns.forEach(b => {
      const on = b.dataset.preset === activeKey;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) active = b;
    });
    // APG toolbar: one Tab stop — the active preset, else wherever the stop already was
    const stop = active || prevStop || presetBtns[0];
    presetBtns.forEach(b => { b.tabIndex = b === stop ? 0 : -1; });
  }

  function markCustomState() {
    syncPresetButtons(null);
    if (presetStatus) presetStatus.textContent = 'Preset: Custom Configuration';
    replaceUrlParam('sim', 'custom');
  }

  function applyPreset(key, syncUrl = true) {
    if (!Object.prototype.hasOwnProperty.call(PRESETS, key)) return; // allow-list (?sim= is user-controlled)
    const p = PRESETS[key];
    capSlider.value = String(p.cap);
    freqSlider.value = String(p.freq);
    kSlider.value = String(p.k);
    gatedMode = p.gated;
    syncModeButtons();
    syncPresetButtons(key);
    if (presetStatus) presetStatus.textContent = `Preset: ${p.label}`;
    if (syncUrl) replaceUrlParam('sim', key);
    updateSimulator();
  }

  [capSlider, freqSlider, kSlider].forEach(s => {
    s.addEventListener('input', () => {
      markCustomState();
      updateSimulator();
    });
  });

  document.querySelectorAll('.sim-ticks[data-slider] span[data-idx]').forEach(tick => {
    tick.addEventListener('click', () => {
      const group = tick.closest('.sim-ticks[data-slider]');
      const slider = group ? document.getElementById(group.dataset.slider) : null;
      if (!slider) return;
      slider.value = tick.dataset.idx;
      markCustomState();
      updateSimulator();
    });
  });

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gatedMode = btn.dataset.mode === 'gated';
      syncModeButtons();
      markCustomState();
      updateSimulator();
    });
  });

  presetBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset, true));
    btn.addEventListener('keydown', e => {
      let next = null;
      if (e.key === 'ArrowRight') next = presetBtns[(idx + 1) % presetBtns.length];
      else if (e.key === 'ArrowLeft') next = presetBtns[(idx - 1 + presetBtns.length) % presetBtns.length];
      else if (e.key === 'Home') next = presetBtns[0];
      else if (e.key === 'End') next = presetBtns[presetBtns.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus();
      applyPreset(next.dataset.preset, true);
    });
  });

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-sim-preset]');
    if (!trigger) return;
    const key = trigger.dataset.simPreset;
    if (PRESETS[key]) applyPreset(key, true);
  });

  window.rlalApplySimPreset = applyPreset;
  syncModeButtons();
  syncPresetButtons((presetBtns.find(b => b.classList.contains('active')) || {}).dataset?.preset || null);
  updateSimulator();
  // start announcing only after boot (incl. ?sim= deep links applied by initUrlState) has finished
  setTimeout(() => { liveReady = true; }, 0);
}

/* ═══════════════════════════════════════════════════════════════
   USER-CONTROLLED QUANT INTUITION QUIZ (1-at-a-Time Stepper + Grid Toggle)
   ═══════════════════════════════════════════════════════════════ */
function initIntuitionQuiz() {
  const grid = document.getElementById('guessGrid');
  const cards = [...document.querySelectorAll('.guess-card')];
  const dots = [...document.querySelectorAll('.qdot[data-step]')];
  const prevBtn = document.getElementById('quizPrevBtn');
  const nextBtn = document.getElementById('quizNextBtn');
  const viewModeBtn = document.getElementById('quizViewModeBtn');
  const scoreEl = document.getElementById('quizScore');
  const revealAllBtn = document.getElementById('revealAllBtn');
  const toolbar = document.querySelector('#intuition .quiz-toolbar');
  const skipRow = document.getElementById('quizSkip');
  const doneEl = document.getElementById('quizDone');
  const doneScoreEl = document.getElementById('quizDoneScore');
  const liveEl = document.getElementById('quizLive');
  if (!cards.length) return;

  let currentStep = 0;
  let answered = 0;
  let hits = 0;
  let revealedAll = false;

  const isSingle = () => !grid || grid.classList.contains('single-mode');
  const scrollBehavior = () => (REDUCED_MOTION ? 'auto' : 'smooth');

  function announce(msg) {
    if (!liveEl) return;
    liveEl.textContent = '';
    setTimeout(() => { liveEl.textContent = msg; }, 60);
  }

  function updateScore() {
    if (!scoreEl) return;
    if (revealedAll && answered === 0) {
      scoreEl.textContent = `All ${cards.length} Empirical Verdicts Revealed`;
    } else if (answered === 0) {
      scoreEl.textContent = `Study ${currentStep + 1} of ${cards.length} · 0 / ${cards.length} Answered`;
    } else {
      scoreEl.textContent = `Study ${currentStep + 1} of ${cards.length} · Score: ${hits}/${answered} Correct`;
    }
  }

  function setSingleMode(single) {
    if (!grid) return;
    grid.classList.toggle('single-mode', single);
    if (toolbar) toolbar.classList.toggle('is-grid', !single);
    if (viewModeBtn) viewModeBtn.textContent = single ? 'View all 6 as a grid' : 'Back to one at a time';
  }

  function showDone(message) {
    if (!doneEl) return;
    if (doneScoreEl) doneScoreEl.textContent = message;
    doneEl.hidden = false;
    announce(message);
  }

  function goToStep(idx, focusCard = false) {
    currentStep = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach((c, i) => c.classList.toggle('active-step', i === currentStep));
    dots.forEach((d, i) => {
      const on = i === currentStep;
      d.classList.toggle('active', on);
      if (on) d.setAttribute('aria-current', 'step');
      else d.removeAttribute('aria-current');
    });
    updateScore();
    if (focusCard && isSingle()) {
      // The previous card just disappeared: keep the new question in view and hand it focus (no focus loss to <body>)
      const card = cards[currentStep];
      const top = card.getBoundingClientRect().top;
      if (top < 72) window.scrollTo({ top: top + window.scrollY - 88, behavior: scrollBehavior() });
      const heading = card.querySelector('h3');
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  function revealAnswer(card) {
    const ans = card.querySelector('.guess-ans');
    if (!ans) return;
    ans.focus({ preventScroll: true });
    const r = ans.getBoundingClientRect();
    const overflow = r.bottom - window.innerHeight + 24;
    if (overflow > 0) {
      // bring the verdict + next step into view without pushing the question under the sticky nav
      const room = card.getBoundingClientRect().top - 80;
      const delta = Math.min(overflow, room);
      if (delta > 0) window.scrollBy({ top: delta, behavior: scrollBehavior() });
    }
  }

  cards.forEach(card => {
    const heading = card.querySelector('h3');
    const ans = card.querySelector('.guess-ans');
    if (heading) heading.tabIndex = -1;
    if (ans) ans.tabIndex = -1;
  });

  if (prevBtn) prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToStep(currentStep + 1));
  dots.forEach(d => {
    d.addEventListener('click', () => goToStep(parseInt(d.dataset.step, 10) || 0));
  });

  document.querySelectorAll('.guess-next-btn[data-next-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextIdx = parseInt(btn.dataset.nextStep, 10) || 0;
      goToStep(nextIdx, true);
    });
  });

  document.addEventListener('click', e => {
    const trig = e.target.closest('[data-quiz-step]');
    if (!trig) return;
    const stepIdx = parseInt(trig.dataset.quizStep, 10);
    if (!Number.isNaN(stepIdx)) {
      if (!isSingle()) setSingleMode(true);
      goToStep(stepIdx);
    }
  });

  if (viewModeBtn && grid) {
    viewModeBtn.addEventListener('click', () => setSingleMode(!isSingle()));
  }

  cards.forEach((card, cardIdx) => {
    const rightAns = card.dataset.answer;
    const buttons = [...card.querySelectorAll('.gopt')];
    const mark = card.querySelector('.guess-mark');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (card.classList.contains('told')) return;
        card.classList.add('told');
        const choice = btn.dataset.choice;
        const isHit = choice === rightAns;

        answered += 1;
        if (isHit) hits += 1;

        buttons.forEach(b => {
          b.setAttribute('aria-disabled', 'true');
          if (b.dataset.choice === rightAns) b.classList.add('right');
          else if (b === btn) b.classList.add('wrong');
        });

        if (dots[cardIdx]) {
          dots[cardIdx].classList.add(isHit ? 'done-hit' : 'done-miss');
        }

        if (mark) {
          mark.className = 'guess-mark ' + (isHit ? 'hit' : 'miss');
          mark.textContent = isHit
            ? '✓ Spot on — your intuition matched the NSE data'
            : `✗ Surprising result — you guessed "${btn.textContent.trim()}"`;
        }
        updateScore();
        revealAnswer(card);
        if (answered === cards.length) {
          showDone(`Quiz complete · you matched ${hits} of ${cards.length}`);
        }
      });
    });
  });

  if (revealAllBtn) {
    revealAllBtn.addEventListener('click', () => {
      revealedAll = true;
      setSingleMode(false);
      cards.forEach((card, cardIdx) => {
        if (card.classList.contains('told')) return;
        card.classList.add('told');
        const rightAns = card.dataset.answer;
        card.querySelectorAll('.gopt').forEach(b => {
          b.setAttribute('aria-disabled', 'true');
          if (b.dataset.choice === rightAns) b.classList.add('right');
        });
        if (dots[cardIdx]) dots[cardIdx].classList.add('done-reveal');
        const mark = card.querySelector('.guess-mark');
        if (mark) {
          mark.className = 'guess-mark';
          mark.textContent = 'Revealed — Empirical NSE Verdict';
        }
      });
      if (skipRow) skipRow.classList.add('is-revealed');
      updateScore();
      showDone(answered
        ? `All ${cards.length} verdicts revealed · you matched ${hits} of ${answered} you answered`
        : `All ${cards.length} verdicts revealed`);
      if (viewModeBtn) viewModeBtn.focus({ preventScroll: true });
    });
  }

  updateScore();
}

/* ═══════════════════════════════════════════════════════════════
   COUNTERS — render authoritative figures immediately (no load jitter)
   ═══════════════════════════════════════════════════════════════ */
function initCounters() {
  const els = document.querySelectorAll('[data-target]');
  if (!els.length) return;
  const fmt = (val, dec, sfx) => {
    if (dec > 0) return val.toFixed(dec) + sfx;
    const n = Math.round(val);
    return (n >= 1000 ? n.toLocaleString('en-IN') : String(n)) + sfx;
  };
  els.forEach(el => {
    const end = parseFloat(el.dataset.target);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const sfx = el.dataset.sfx || '';
    if (!Number.isNaN(end)) {
      el.textContent = fmt(end, dec, sfx);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (REDUCED_MOTION) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const parent = entry.target.parentElement;
      const pending = parent ? [...parent.querySelectorAll('.reveal:not(.visible)')] : [];
      const i = pending.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), Math.min(i * 60, 300));
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU — disclosure inside #navbar: Esc / backdrop / link /
   focus-out close it, focus returns to ☰, page scroll locks while open
   ═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  const nav = document.getElementById('navbar');
  btn.setAttribute('aria-controls', menu.id);
  btn.setAttribute('aria-expanded', 'false');

  const backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  const isOpen = () => menu.classList.contains('open');
  const setOpen = (open, returnFocus = false) => {
    menu.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.classList.toggle('menu-open', open);
    if (!open && returnFocus) btn.focus();
  };
  btn.addEventListener('click', () => setOpen(!isOpen()));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen()) setOpen(false, true);
  });
  menu.addEventListener('click', e => {
    if (e.target.closest('a')) setOpen(false);
  });
  if (nav && nav.contains(menu)) {
    nav.addEventListener('focusout', e => {
      if (isOpen() && e.relatedTarget && !nav.contains(e.relatedTarget)) setOpen(false);
    });
  }
  const desktop = window.matchMedia('(min-width: 1021px)');
  const closeOnDesktop = () => { if (desktop.matches && isOpen()) setOpen(false); };
  if (desktop.addEventListener) desktop.addEventListener('change', closeOnDesktop);
  else if (desktop.addListener) desktop.addListener(closeOnDesktop);
  window.addEventListener('resize', closeOnDesktop, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   ANCHORS — native fragment scrolling (smooth via CSS, clears the
   sticky nav via html { scroll-padding-top }); the skip link also
   moves keyboard focus into its target
   ═══════════════════════════════════════════════════════════════ */
function initAnchors() {
  document.querySelectorAll('a.skip-link[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const id = decodeURIComponent(link.getAttribute('href').slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.classList.add('skip-target');
      requestAnimationFrame(() => target.focus({ preventScroll: true }));
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   FORMS — bind the mailto composer without inline on* handlers
   ═══════════════════════════════════════════════════════════════ */
function initForms() {
  document.querySelectorAll('form#contactForm, form#joinForm').forEach(form => {
    form.removeAttribute('onsubmit');
    form.addEventListener('submit', handleSubmit);
  });
}

/* ═══════════════════════════════════════════════════════════════
   STICKY BOTTOM CTA — mobile only (CSS), home only
   Calm + contextual: shown only in the reading stretch, never over the
   hero, the interactive steps, the verdicts' own CTA, the form or the footer.
   ═══════════════════════════════════════════════════════════════ */
function initMobileCta() {
  const contact = document.getElementById('contact');
  if (!contact || !('IntersectionObserver' in window)) return;

  const bar = document.createElement('div');
  bar.id = 'mobileCta';
  const link = document.createElement('a');
  link.href = '#contact';
  link.className = 'btn-primary';
  link.textContent = 'Collaborate →';
  bar.appendChild(link);
  document.body.appendChild(bar);

  const blockers = ['#hero', '#simulator', '#intuition', '#ledger', '#contact', 'footer']
    .map(sel => document.querySelector(sel))
    .filter(Boolean);
  const onScreen = new Set();
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)));
    bar.classList.toggle('show', onScreen.size === 0);
  });
  blockers.forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE NAV HIGHLIGHT (home page sections + inner page routes)
   ═══════════════════════════════════════════════════════════════ */
function initActiveNav() {
  const path = window.location.pathname || '/';
  const isHome = path === '/' || path.endsWith('/index.html') && !/\/(research|notes|blog|experiments|about|join|traction|privacy)\//.test(path);
  if (!isHome) {
    // Highlight matching section in desktop/mobile nav on inner pages
    const matchKey = /\/(research|notes|blog)\//.test(path) ? 'research/'
      : /\/experiments\//.test(path) ? 'experiments/'
      : /\/traction\//.test(path) ? 'traction/'
      : /\/join\//.test(path) ? 'join/'
      : /\/about\//.test(path) ? 'about/'
      : '';
    if (matchKey) {
      document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href.endsWith(matchKey)) {
          if (a.closest('.nav-links')) a.classList.add('nav-on');
          a.setAttribute('aria-current', 'page');
        }
      });
    }
    return;
  }

  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
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
   ARTICLE ENHANCEMENTS — TOC scrollspy, heading anchors, reading time
   ═══════════════════════════════════════════════════════════════ */
function initArticleEnhancements() {
  const prose = document.querySelector('.article-prose');
  if (!prose) return;
  const headings = [...prose.querySelectorAll('h2, h3')];

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

  const toc = document.getElementById('tocList');
  const tocHeadings = headings.filter(h => h.parentElement === prose);
  if (toc && tocHeadings.length) {
    toc.replaceChildren();
    tocHeadings.forEach(h => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      if (h.tagName === 'H3') a.className = 'toc-h3';
      a.textContent = h.textContent.replace('#', '').trim();
      li.appendChild(a);
      toc.appendChild(li);
    });
    const tocLinks = [...toc.querySelectorAll('a')];
    // Scrollspy: the current section is the last heading that has scrolled past
    // 30% of the viewport (the last one once the page bottom is reached). Position
    // based, so fast scrolls and TOC jumps never leave a stale highlight.
    let current;
    const setCurrent = (id) => {
      if (id === current) return;
      current = id;
      tocLinks.forEach(l => {
        const on = id !== null && l.getAttribute('href') === `#${id}`;
        l.classList.toggle('on', on);
        if (on) l.setAttribute('aria-current', 'location');
        else l.removeAttribute('aria-current');
      });
    };
    let spyQueued = false;
    const spy = () => {
      spyQueued = false;
      const line = window.innerHeight * 0.3;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let id = null;
      for (const h of tocHeadings) {
        if (atBottom || h.getBoundingClientRect().top <= line) id = h.id;
        else break;
      }
      setCurrent(id);
    };
    const queueSpy = () => {
      if (!spyQueued) { spyQueued = true; requestAnimationFrame(spy); }
    };
    window.addEventListener('scroll', queueSpy, { passive: true });
    window.addEventListener('resize', queueSpy, { passive: true });
    spy();

    const sidebar = toc.closest('.research-sidebar');
    const toggle = sidebar ? sidebar.querySelector('.toc-toggle') : null;
    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = !sidebar.classList.contains('toc-open');
        sidebar.classList.toggle('toc-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  const rt = document.querySelector('[data-reading-time]');
  if (rt) {
    const words = prose.textContent.trim().split(/\s+/).length;
    rt.textContent = `~${Math.max(1, Math.round(words / 200))} min read`;
  }

  // Q&A disclosure lists: one quiet "Expand all" control instead of N clicks
  const qaItems = [...prose.querySelectorAll('details.qa')];
  const firstList = prose.querySelector('.qa-list');
  if (qaItems.length > 3 && firstList) {
    const bar = document.createElement('div');
    bar.className = 'qa-toolbar';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'qa-toggle-all';
    const sync = () => {
      const allOpen = qaItems.every(d => d.open);
      btn.textContent = allOpen ? 'Collapse all questions' : `Expand all ${qaItems.length} questions`;
    };
    btn.addEventListener('click', () => {
      const open = !qaItems.every(d => d.open);
      qaItems.forEach(d => { d.open = open; });
      sync();
    });
    qaItems.forEach(d => d.addEventListener('toggle', sync));
    sync();
    bar.appendChild(btn);
    const anchor = firstList.previousElementSibling && firstList.previousElementSibling.tagName === 'H2'
      ? firstList.previousElementSibling : firstList;
    anchor.before(bar);
  }
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT FORM (Full Name + Email + Role + Message + Instant Copy Fallback)
   ═══════════════════════════════════════════════════════════════ */
function handleSubmit(e) {
  e.preventDefault();
  const f = e.target;
  const name = f.name ? f.name.value.trim() : '';
  const mail = f.email ? f.email.value.trim() : '';
  const type = f.type ? f.type.value : 'Inquiry';
  const msg  = f.message ? f.message.value.trim() : '';
  if (!name || !mail) return;

  const sub  = encodeURIComponent(`[RLAlphaLabs] ${type || 'Inquiry'} from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${mail}\nType: ${type}\n\n${msg}`);
  window.location.href = `mailto:connect@rlalphalabs.com?subject=${sub}&body=${body}`;

  setTimeout(() => {
    // Swap the submitted form (home or /join/) for its own success panel and
    // move focus there so keyboard and screen-reader users hear the outcome.
    const succEl = (f.parentElement && f.parentElement.querySelector('.cform-success')) ||
      document.getElementById('formSuccess');
    if (!succEl) return;
    f.style.display = 'none';
    succEl.style.display = 'block';
    const heading = succEl.querySelector('h2, h3') || succEl;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus();
  }, 300);
}

/* ═══════════════════════════════════════════════════════════════
   PROGRESSIVE DISCLOSURE ACCORDIONS (Engineering Specs & 8 Traps)
   ═══════════════════════════════════════════════════════════════ */
function initProgressiveSections() {
  // One helper for both sections: the button's label + aria-expanded always mirror the real details state
  function bindExpandAll(btn, items, { noun, keepFirstOpen = false }) {
    if (!btn || !items.length) return;
    const sync = () => {
      const allOpen = items.every(d => d.open);
      btn.setAttribute('aria-expanded', allOpen ? 'true' : 'false');
      btn.textContent = `${allOpen ? 'Collapse' : 'Expand'} All ${items.length} ${noun}`;
    };
    btn.addEventListener('click', () => {
      const openAll = !items.every(d => d.open);
      items.forEach((d, idx) => { d.open = openAll || (keepFirstOpen && idx === 0); });
      sync();
    });
    items.forEach(d => d.addEventListener('toggle', sync));
    sync();
  }

  bindExpandAll(document.getElementById('expandEngBtn'),
    [...document.querySelectorAll('#engineering .fcard-details')], { noun: 'Specs' });
  bindExpandAll(document.getElementById('expandTrapsBtn'),
    [...document.querySelectorAll('#trapAccordion .trap-item')], { noun: 'Traps', keepFirstOpen: true });
}

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE VERDICT LEDGER FILTERING (filter chips + clickable tally)
   ═══════════════════════════════════════════════════════════════ */
function initVerdictLedger() {
  const cards = [...document.querySelectorAll('#verdictBoard .vcard')];
  const filterBtns = [...document.querySelectorAll('.lfilt[data-filter]')];
  const tallyItems = [...document.querySelectorAll('.tally [data-filter]')];
  const countEl = document.getElementById('ledgerCount');
  if (!cards.length || !filterBtns.length) return;

  const CAT_LABELS = {
    pass: 'Survived Gates',
    cost: 'Cost & Tax Wall',
    edge: 'Zero OOS Edge',
    late: 'Timing / Universe Artifact',
    all:  'All Featured'
  };

  let currentFilter = 'pass';

  function applyFilter(cat, syncUrl = true) {
    // allow-list: unknown ?verdict= values fall back to the default view instead of hiding every card
    currentFilter = Object.prototype.hasOwnProperty.call(CAT_LABELS, cat) ? cat : 'pass';
    let shown = 0;
    cards.forEach(c => {
      const match = currentFilter === 'all' || c.dataset.cat === currentFilter;
      c.classList.toggle('is-hidden', !match);
      if (match) {
        c.classList.add('visible');
        shown += 1;
      }
    });
    filterBtns.forEach(b => {
      const on = b.dataset.filter === currentFilter;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1; // APG toolbar: one Tab stop, arrows move between filters
    });
    tallyItems.forEach(el => {
      el.classList.toggle('is-active', currentFilter === 'all' || el.dataset.filter === currentFilter);
    });
    if (countEl) {
      countEl.textContent = `Showing ${shown} of ${cards.length} representative studies (${CAT_LABELS[currentFilter]})`;
    }
    if (syncUrl) replaceUrlParam('verdict', currentFilter);
  }

  filterBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter, true));
    btn.addEventListener('keydown', e => {
      let next = null;
      if (e.key === 'ArrowRight') next = filterBtns[(idx + 1) % filterBtns.length];
      else if (e.key === 'ArrowLeft') next = filterBtns[(idx - 1 + filterBtns.length) % filterBtns.length];
      else if (e.key === 'Home') next = filterBtns[0];
      else if (e.key === 'End') next = filterBtns[filterBtns.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus();
      applyFilter(next.dataset.filter, true);
    });
  });

  tallyItems.forEach(el => {
    el.addEventListener('click', () => applyFilter(el.dataset.filter, true));
  });

  filterBtns.forEach(b => { b.tabIndex = b.classList.contains('active') ? 0 : -1; });
  tallyItems.forEach(el => {
    el.classList.toggle('is-active', el.dataset.filter === currentFilter);
  });
  window.rlalApplyVerdictFilter = applyFilter;
}

/* ═══════════════════════════════════════════════════════════════
   ABOUT — founder avatar fallback (replaces an inline onerror handler)
   ═══════════════════════════════════════════════════════════════ */
function initAboutAvatar() {
  document.querySelectorAll('.avatar-wrap img').forEach(img => {
    const fallback = img.nextElementSibling;
    const showFallback = () => {
      img.style.display = 'none';
      if (fallback) fallback.style.display = 'flex';
    };
    // the image may already have failed before this script ran
    if (img.complete && img.naturalWidth === 0) showFallback();
    else img.addEventListener('error', showFallback, { once: true });
  });
}

/* ═══════════════════════════════════════════════════════════════
   URL QUERY STATE RESTORATION (?tab=, ?sim=, ?verdict=, ?topic=)
   ═══════════════════════════════════════════════════════════════ */
function initUrlState() {
  let params;
  try { params = new URLSearchParams(window.location.search); } catch (e) { return; }
  // Each restore is isolated so one malformed parameter cannot skip the rest.
  const restore = fn => { try { fn(); } catch (e) {} };

  restore(() => {
    // Match ?tab= against the real tab buttons (never interpolate it into a selector).
    const tabParam = params.get('tab');
    if (!tabParam) return;
    const tabBtn = [...document.querySelectorAll('.ctab[data-pane]')].find(t => t.dataset.pane === tabParam);
    if (tabBtn) tabBtn.click();
  });

  restore(() => {
    const simParam = params.get('sim');
    if (simParam && typeof window.rlalApplySimPreset === 'function') {
      window.rlalApplySimPreset(simParam, false);
    }
  });

  restore(() => {
    const verdictParam = params.get('verdict');
    if (verdictParam && typeof window.rlalApplyVerdictFilter === 'function') {
      window.rlalApplyVerdictFilter(verdictParam, false);
    }
  });

  restore(() => {
    const topicParam = (params.get('topic') || '').slice(0, 200);
    if (!topicParam) return;
    const typeSelect = document.getElementById('type');
    const msgArea = document.getElementById('message');
    if (typeSelect) {
      if (topicParam.toLowerCase().includes('challenge') || topicParam.toLowerCase().includes('test')) {
        typeSelect.value = 'Research Collaboration';
      } else {
        typeSelect.value = 'General Inquiry';
      }
    }
    if (msgArea && !msgArea.value.trim()) {
      msgArea.value = `Topic: ${topicParam}\n\n`;
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   START — must stay at the very end of the file: boot() reads
   top-level consts declared above (THEME_KEY, Charts), which are
   in their temporal dead zone until this point is reached.
   ═══════════════════════════════════════════════════════════════ */
boot(FALLBACK_DATA);

fetch(DATA_URL)
  .then(r => r.json())
  .then(data => {
    const merged = Object.assign({}, FALLBACK_DATA, data);
    Charts.init(merged);
  })
  .catch(() => {});
