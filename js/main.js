/* ═══════════════════════════════════════════════════════════════
  RLAlphaLabs — Main JS v2
   Real data from site-data.json · Grounded charts · Trust-first UX
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ─── Load real data then boot ──────────────────────────────────── */
fetch('data/site-data.json')
  .then(r => r.json())
  .then(data => boot(data))
  .catch(() => {
    // Fallback if fetch fails (local file:// protocol)
    console.warn('Could not fetch site-data.json — using embedded fallback');
    boot(FALLBACK_DATA);
  });

/* ─── Minimal fallback (no network needed for local dev) ────────── */
const FALLBACK_DATA = {
  experiments: [
    { id:'Result', date:'Apr 2026', algo:'Actor-Critic (JAX)', total_steps:5000000, sps:9700, train_time_sec:520, n_envs:64, n_assets:20, test_sharpe:0.49, val_sharpe:1.30, best_val_sharpe:0.99, test_return_pct:10.5, val_return_pct:35.0, test_win_rate:65.0, val_win_rate:64.0, test_sortino:0.47, status:'complete' }
  ],
  data_coverage: { total_stocks:700, total_parquet_files:5000, granularities:{'1min':600,'3min':700,'5min':700,'10min':700,'15min':700,'30min':700,'1hour':600,'daily':700}, indices:['Nifty 50','Nifty 100','Nifty 200','Nifty 500','Nifty Midcap 100','Nifty Smallcap 100'] },
  portfolio_sample: { symbols:['RELIANCE','HDFCBANK','INFY','TCS','ICICIBANK','HINDUNILVR','SBIN','BAJFINANCE','AXISBANK','KOTAKBANK'], names:['Reliance Industries','HDFC Bank','Infosys','TCS','ICICI Bank','Hindustan Unilever','SBI','Bajaj Finance','Axis Bank','Kotak Mahindra'] },
  equity_curves: { labels:[], rl_portfolio:[], nifty50:[] },
  hero_curve: []
};

/* ═══════════════════════════════════════════════════════════════
   BOOT — wires everything up once data is ready
   ═══════════════════════════════════════════════════════════════ */
function boot(data) {
  initNav();
  initTicker(data.portfolio_sample.symbols);
  initParticles();
  initHeroChart(data);
  initPerfChart(data);
  initExperimentTable(data.experiments);
  initStockGrid(data.portfolio_sample);
  initCounters();
  initReveal();
  initMobileMenu();
  initActiveNav();
  initForm();
}

/* ═══════════════════════════════════════════════════════════════
   NAV scroll behavior
   ═══════════════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('navbar');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ═══════════════════════════════════════════════════════════════
   TICKER — real NIFTY 50 symbols with fake but plausible prices
   ═══════════════════════════════════════════════════════════════ */
function initTicker(symbols) {
  const track = document.getElementById('tickerTrack');
  if (!track) return;

  // Generate plausible prices/changes (not real, labeled as portfolio sample)
  const seed_prices = [2850, 1680, 1520, 3940, 1280, 2440, 820, 6890, 1140, 1890,
                       720, 4200, 1360, 4800, 980, 2100, 1890, 430, 2760, 1150];
  const seed_chg    = [1.2, -0.4, 0.8, -1.1, 2.1, 0.3, -0.7, 1.5, -0.2, 0.9,
                       -1.3, 0.6, 1.8, -0.5, 2.3, -0.8, 0.4, -1.6, 0.7, 1.1];

  const buildItems = () => symbols.slice(0, 20).map((sym, i) => {
    const price = seed_prices[i] || 1000;
    const chg   = seed_chg[i] || 0;
    const cls   = chg >= 0 ? 'tick-up' : 'tick-dn';
    const sign  = chg >= 0 ? '+' : '';
    return `<span class="ticker-item"><span class="tick-sym">${sym}</span>₹${price.toLocaleString('en-IN')} <span class="${cls}">${sign}${chg}%</span></span>`;
  }).join('');

  // Duplicate for seamless loop
  const items = buildItems();
  track.innerHTML = items + items;
}

/* ═══════════════════════════════════════════════════════════════
   PARTICLES
   ═══════════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

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
      this.a  = Math.random() * 0.35 + 0.05;
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
  pts = Array.from({ length: 80 }, () => new Pt());
  frame();
  window.addEventListener('resize', () => { resize(); }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   HERO CHART — illustrative equity curve
   ═══════════════════════════════════════════════════════════════ */
function initHeroChart(data) {
  const canvas = document.getElementById('heroChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let curve = data.hero_curve;
  const n   = curve.length;
  if (!n) return;

  const labels = Array.from({ length: n }, (_, i) => i);
  const ret    = ((curve[n - 1] / curve[0]) - 1) * 100;
  const badge  = document.getElementById('heroReturn');
  if (badge) badge.textContent = (ret >= 0 ? '+' : '') + ret.toFixed(1) + '%';

  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, 'rgba(0,200,240,0.25)');
  grad.addColorStop(1, 'rgba(0,200,240,0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: curve,
        borderColor: '#00c8f0',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: grad,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1800, easing: 'easeInOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index', intersect: false,
          backgroundColor: 'rgba(6,13,28,0.95)',
          borderColor: 'rgba(0,200,240,0.2)', borderWidth: 1,
          titleColor: '#c5d0e8', bodyColor: '#7a92b4',
          callbacks: { label: c => ` Portfolio: ${c.parsed.y.toFixed(1)}` }
        }
      },
      scales: {
        x: { display: false },
        y: {
          display: true,
          grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
          ticks: { color: '#3d526e', font: { family: "'JetBrains Mono'", size: 10 }, callback: v => v.toFixed(0) },
          border: { display: false },
        }
      },
      interaction: { mode: 'nearest', axis: 'x', intersect: false }
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   PERFORMANCE CHART — equity curves from real stats
   ═══════════════════════════════════════════════════════════════ */
function initPerfChart(data) {
  const canvas = document.getElementById('perfChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const { labels, rl_portfolio, nifty50 } = data.equity_curves;
  if (!rl_portfolio.length) return;

  const gradRL = ctx.createLinearGradient(0, 0, 0, 320);
  gradRL.addColorStop(0, 'rgba(0,200,240,0.18)');
  gradRL.addColorStop(1, 'rgba(0,200,240,0)');

  const gradBench = ctx.createLinearGradient(0, 0, 0, 320);
  gradBench.addColorStop(0, 'rgba(61,82,110,0.12)');
  gradBench.addColorStop(1, 'rgba(61,82,110,0)');

  // Build month labels
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const n = labels.length;
  const monthLabels = labels.map((_, i) => {
    const m = Math.floor(i / (n / 12));
    return i % Math.round(n / 12) === 0 ? months[Math.min(m, 11)] : '';
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [
        { label: 'RL Portfolio', data: rl_portfolio, borderColor: '#00c8f0', borderWidth: 2, pointRadius: 0, fill: true, backgroundColor: gradRL, tension: 0.4 },
        { label: 'NIFTY 50',    data: nifty50,       borderColor: '#3d526e', borderWidth: 1.5, pointRadius: 0, fill: true, backgroundColor: gradBench, tension: 0.4, borderDash: [5, 4] }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 1400, easing: 'easeInOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index', intersect: false,
          backgroundColor: 'rgba(6,13,28,0.95)',
          borderColor: 'rgba(0,200,240,0.2)', borderWidth: 1,
          titleColor: '#c5d0e8', bodyColor: '#7a92b4',
          callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toFixed(1)}` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: '#3d526e', font: { family: "'JetBrains Mono'", size: 10 } }, border: { display: false } },
        y: { grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: '#3d526e', font: { family: "'JetBrains Mono'", size: 10 }, callback: v => v.toFixed(0) }, border: { display: false } }
      },
      interaction: { mode: 'nearest', axis: 'x', intersect: false }
    }
  });
}

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
      <td style="color:var(--t2)">${e.train_time_sec}s</td>
      <td style="color:var(--t3)">${e.n_envs}</td>
      <td class="${e.test_sharpe >= 0.45 ? 'val-good' : 'val-ok'}">${e.test_sharpe.toFixed(4)}</td>
      <td class="${e.val_sharpe >= 1.0 ? 'val-good' : 'val-ok'}">${e.val_sharpe.toFixed(4)}</td>
      <td class="${e.test_win_rate >= 60 ? 'val-good' : 'val-ok'}">${e.test_win_rate.toFixed(1)}%</td>
      <td style="color:var(--t2)">${e.test_sortino.toFixed(4)}</td>
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
    `<div class="stock-chip">${sym}</div>`
  ).join('');
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTERS (easeOut cubic)
   ═══════════════════════════════════════════════════════════════ */
function initCounters() {
  const els = document.querySelectorAll('[data-target]');
  const ease = t => 1 - Math.pow(1 - t, 3);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseFloat(el.dataset.target);
      const dec = parseInt(el.dataset.dec || '0');
      const sfx = el.dataset.sfx || '';
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
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Stagger siblings
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
   MOBILE MENU
   ═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const tgt = document.querySelector(a.getAttribute('href'));
      if (!tgt) return;
      e.preventDefault();
      window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE NAV HIGHLIGHT
   ═══════════════════════════════════════════════════════════════ */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.style.color = '');
        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (a) a.style.color = 'var(--cyan)';
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT FORM (mailto for static hosting)
   ═══════════════════════════════════════════════════════════════ */
function initForm() {
  // exposed globally for onsubmit=""
}

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
  window.location.href = `mailto:pctablet505@gmail.com?subject=${sub}&body=${body}`;

  setTimeout(() => {
    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('formSuccess').style.display  = 'block';
  }, 300);
}
