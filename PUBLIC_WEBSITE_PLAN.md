# Public Website Plan — RLAlphaLabs

> **Goal:** Expand `RLAlphaLabs.github.io` from a single landing page into a credible public presence that showcases our research, attracts collaborators/investors, and shares educational content — without exposing proprietary trading logic, source code, or operational secrets.
>
> **Constraint:** Everything published must be safe to share. When in doubt, leave it out.

---

## 1. Current State

| Item | Status |
|------|--------|
| **Site** | Single-page static HTML (`index.html`) |
| **Deploy** | GitHub Pages via `.github/workflows/deploy-pages.yml` |
| **Domain** | `https://pctablet505.github.io/RLAlphaLabs` |
| **Content** | Hero, problem statement, features, pipeline, performance charts, research log (EXP-001/002), technology badges, contact form |
| **Missing** | About section (placeholder), blog/docs, multi-page structure, research papers, open problems, literature reviews |

### What's Already Public-Safe
- High-level capability descriptions (RL agents, walk-forward validation, GPU training)
- Experiment summary metrics (Sharpe, win rate, SPS — no code or checkpoints)
- Technology stack badges (Python, JAX, PyTorch, Gymnasium)
- NSE market context (public knowledge)
- Pipeline stages (generic research → paper → live)

---

## 2. Proprietary vs. Public-Safe — The Boundary

### 🔒 NEVER PUBLIC — Proprietary

| Category | Examples | Why |
|----------|----------|-----|
| **Source code** | `algotrading/src/**/*.py`, test files | Core IP — trading logic, model implementations |
| **Specific hyperparameters** | Exact `target_entropy_scale`, layer dims, LR schedules | Reveals how we trade; competitors can replicate |
| **Internal architecture docs** | `ARCHITECTURE_DESIGN_DOCUMENT.md`, module maps, ABC interfaces | Internal design patterns; not useful externally |
| **Agent prompts / AI wiki** | `.github/copilot/wiki/`, `.github/prompts/`, `AGENTS.md` | Internal dev tooling; irrelevant to public |
| **Secrets & infra** | API keys, `.env`, WSL paths, Windows paths, `C:\Projects\...` | Security risk |
| **Live trading ops** | `LIVE_TRADING_RUNBOOK.md`, `INCIDENT_RESPONSE.md`, kill-switch design | Operational security |
| **Security findings** | `CODE_REVIEW.md` vulns, `SECURITY_AUDIT_*.md` | Attack surface exposure |
| **Internal backlogs** | `PENDING_WORK_BACKLOG.md`, `AGENT_TASKS.md`, deviation reports | Internal process noise |
| **Autorl KB / checkpoints** | `autorl_kb.db`, model checkpoint files | Contains optimization landscape = alpha leakage |
| **Vendor specifics** | Detailed Zerodha integration code, rate limits, API quirks | Vendor relationships + exploit vectors |

### ✅ SAFE TO PUBLIC — With Sanitization

| Category | Sanitization Required | Source Doc |
|----------|----------------------|------------|
| **Research problem statement** | Remove specific hyperparameters (Section 23.3), hardware specs (Section 20), code snippets | `docs/RESEARCH_PROBLEM_STATEMENT.md` |
| **Market microstructure** | Already public knowledge; keep NSE fee structure | Same as above (Section 2) |
| **General methodology** | Describe *what* we do, not *how* in code | `docs/DESIGN_DOCUMENT.md` Section A1 (high-level only) |
| **Validated findings** | Keep insights (entropy collapse, ATR predictive power), remove exact configs | `RESEARCH_PROBLEM_STATEMENT.md` Section 14 |
| **Open research questions** | Fully public — this is our intellectual contribution | Same as above (Section 16) |
| **Literature review** | Fully public — academic references | Same as above (Section 22) |
| **Experiment narratives** | Describe learning journey, not code paths | Training logs, campaign summaries |
| **Educational content** | Write fresh: "RL for Trading 101", "Why Indian Markets Are Hard" | Original content |

---

## 3. Proposed Site Structure

Keep the single-page scroll experience as the **landing page**, but add a **multi-page docs/blog section** linked from the nav.

```
RLAlphaLabs.github.io/
├── index.html                    # Existing landing page (updated)
├── css/style.css                 # Existing
├── js/main.js                    # Existing
├── data/site-data.json           # Existing (sanitized experiments)
│
├── about/                        # NEW — About the builder
│   └── index.html
│
├── research/                     # NEW — Public research hub
│   ├── index.html                # Research overview + paper list
│   ├── problem-statement.html    # Sanitized version of research doc
│   ├── methodology.html          # High-level approach (no code)
│   ├── findings.html             # Validated insights
│   ├── open-problems.html        # Open questions (recruiting tool)
│   └── literature.html           # Literature review
│
├── experiments/                  # NEW — Experiment blog
│   ├── index.html                # List of experiment write-ups
│   ├── exp-001.html              # Deep-dive on EXP-001
│   ├── exp-002.html              # Deep-dive on EXP-002
│   └── exp-003+.html             # Future experiments
│
├── blog/                         # NEW — Opinion/educational posts
│   └── index.html                # List of posts
│
└── assets/                       # NEW — Photos, diagrams, charts
    ├── photos/
    └── diagrams/
```

### Nav Update
Replace current nav with:
```
RLAlphaLabs  →  Features  Research  Experiments  Blog  About  Contact
```

---

## 4. Content Migration Plan

### 4.1 Landing Page (`index.html`) — Minor Updates

| Section | Change | Effort |
|---------|--------|--------|
| **Hero** | Keep. Update status pill if stage advances. | 5 min |
| **Problem** | Keep. These are generic industry pain points. | None |
| **Features** | Keep. Remove specific meta-tags that reveal internals (e.g., exact "12 reward components" can stay; it's vague enough). | 10 min |
| **Pipeline** | Keep. Update stage status as project progresses. | 5 min |
| **Performance** | Keep. Update `site-data.json` with new experiments only. | 10 min |
| **Technology** | Keep. Add badges for new tools if any. | 5 min |
| **About** | **FILL PLACEHOLDER** — this is critical for credibility. Add name, role, background, why this project exists. No need for photo if privacy concerns. | 30 min |
| **Use Cases** | Keep. Tone is appropriate. | None |
| **Contact** | Keep. Consider adding Calendly link. | 10 min |
| **Footer** | Change "Proprietary & Confidential" to "Research Stage. Not Financial Advice." | 5 min |

### 4.2 Research Hub — Major New Content

#### `/research/problem-statement.html`
**Source:** `docs/RESEARCH_PROBLEM_STATEMENT.md`
**Sanitization rules:**
- Keep: Sections 1 (Problem Definition), 2 (Market Context), 3 (System Overview — high-level diagram only, no internal module names), 11 (Walk-Forward), 12 (Transaction Costs), 21 (Baseline Benchmarks), 22 (Literature)
- **REMOVE:** Section 3.2 Technology Stack table (reveals internal versions/paths), Section 4 (Observation Space — reveals feature engineering), Section 5 (Action Space), Section 6 (Reward Function — reveals strategy), Section 7 (SAC Architecture), Section 8 (Training Infrastructure details), Section 9 (Feature Engineering), Section 10 (Risk Management specifics), Section 13 (What Has Been Tried — too specific), Section 14 (Validated Findings — keep high-level only), Section 15 (Known Failure Modes — engineering failures are internal), Section 17 (Proposed Directions — keep high-level only), Section 20 (Hardware), Section 23 (Appendix — all constants/hyperparameters)
- **REWRITE:** Section 3.1 System Overview — replace internal diagram with a generic "Data → Features → Agent → Execution" flow. No internal filenames.

#### `/research/methodology.html`
**Write fresh.** High-level narrative:
- Why SAC? (Maximum entropy, sample efficiency)
- Why walk-forward? (Prevent curve fitting)
- Why JAX + PyTorch? (Speed + flexibility)
- Why NSE-realistic costs? (Backtest honesty)
- **NO:** Network diagrams, layer sizes, exact hyperparameters, code snippets, internal file paths.

#### `/research/findings.html`
**Source:** `RESEARCH_PROBLEM_STATEMENT.md` Section 14
**Sanitization:**
- Keep insight narratives ("entropy collapse is a real problem on low-SNR data")
- Remove: exact values that can be reverse-engineered (e.g., "target_entropy_scale = 0.1" → "we found that dramatically reducing the entropy target was critical")
- Remove: training time budgets, GPU memory usage

#### `/research/open-problems.html`
**Source:** `RESEARCH_PROBLEM_STATEMENT.md` Section 16
**Sanitization:** Almost none needed. These are research questions.
- Remove any that reference internal limitations (e.g., "No options chain data" — that's an infra limitation, not a research problem)
- Keep: fundamental questions, algorithm design questions, feature questions, risk questions
- Add call-to-action: "If you're working on any of these, let's talk."

#### `/research/literature.html`
**Source:** `RESEARCH_PROBLEM_STATEMENT.md` Section 22
**Sanitization:** None. Academic references are public.
- Add our own commentary on each paper's relevance to Indian markets.

### 4.3 Experiments Hub — Major New Content

#### `/experiments/index.html`
- Table of all experiments with links
- Filter by status: Complete / In Progress / Planned

#### `/experiments/exp-001.html` & `/experiments/exp-002.html`
**Source:** `data/site-data.json` + training logs
**Content template:**
```
Title: EXP-001 — First SAC Validation on NIFTY 50
What we tested: Does SAC learn meaningful policies on NSE daily data?
Setup (high-level): 20-stock universe, 5M steps, JAX backend
What worked: Agent learned to avoid excessive trading; Sharpe > 0.4
What didn't: Win rate below 60%; some entropy instability
Lessons learned: [insight]
Next: EXP-002 with longer training and adjusted entropy
Metrics table: (from site-data.json)
Chart: equity curve
```
**NEVER INCLUDE:**
- Code snippets
- Exact hyperparameter tables
- Internal file paths to checkpoints
- Feature names beyond generic "technical indicators"

### 4.4 Blog — Original Content

**Purpose:** SEO + credibility + recruiting.
**Topics (suggested):**
1. "Why Most RL Trading Projects Fail in Production" — expand the Problem section into an article
2. "The Hidden Cost of Ignoring Transaction Fees in Indian Markets" — NSE fee breakdown
3. "Walk-Forward Validation: The Only Honest Way to Evaluate Trading Strategies" — methodology deep-dive
4. "Entropy Collapse in SAC: A Lesson from Low-SNR Financial Data" — sanitized finding
5. "From PyTorch to JAX: Why We Train on Two Backends" — technical decision
6. "Open Problems in RL for Indian Equities" — recruiting post

**Tone:** Educational, honest, technically rigorous. No hype. No "we beat the market" claims.

---

## 5. Sanitization Checklist (Apply to Every Page)

Before publishing any content, verify:

- [ ] No Python code snippets from the repo
- [ ] No file paths (especially `C:\`, `/home/`, `algotrading/src/`)
- [ ] No API keys, tokens, secrets (even in examples)
- [ ] No specific hyperparameters (learning rates, layer sizes, buffer sizes, entropy targets)
- [ ] No internal module names (e.g., `TorchSACAgent`, `NiftyPortfolioEnv`, `CanaryBroker`)
- [ ] No vendor integration details (rate limits, API quirks, specific endpoints)
- [ ] No security findings or vulnerabilities
- [ ] No live trading operational details (kill-switch logic, circuit breakers, position limits)
- [ ] No internal backlogs, agent tasks, or deviation reports
- [ ] No model checkpoint locations or file hashes
- [ ] No exact hardware specs beyond "consumer GPU" level of detail
- [ ] No proprietary data source names beyond what's already public (NSE, Zerodha is fine at high level)

**Safe placeholders:**
- Instead of `target_entropy_scale = 0.1` → "we reduced the entropy target by an order of magnitude"
- Instead of `hidden_dims = [256, 256, 256]` → "a standard multi-layer network"
- Instead of `algotrading train --backend jax` → "our JAX training pipeline"
- Instead of `NiftyPortfolioEnv` → "our custom trading environment"

---

## 6. Implementation Phases

### Phase 1 — Foundation (Week 1)
- [ ] Fill "About" section on landing page
- [ ] Update footer legal text
- [ ] Add multi-page nav structure
- [ ] Create page templates (reuse CSS/JS from landing)
- [ ] Set up page routing (simple HTML files in subdirs)

### Phase 2 — Research Hub (Week 2)
- [ ] Write `/research/problem-statement.html` (sanitized from source doc)
- [ ] Write `/research/methodology.html` (fresh content)
- [ ] Write `/research/open-problems.html` (lightly edited from source)
- [ ] Write `/research/literature.html` (from source + commentary)

### Phase 3 — Experiments Hub (Week 3)
- [ ] Write `/experiments/exp-001.html` deep-dive
- [ ] Write `/experiments/exp-002.html` deep-dive
- [ ] Create `/experiments/index.html` listing page
- [ ] Update `site-data.json` with any new experiment data

### Phase 4 — Blog Launch (Week 4)
- [ ] Write first 2 blog posts
- [ ] Create `/blog/index.html`
- [ ] Add RSS feed (`/feed.xml` or `/rss.xml`)
- [ ] Add OpenGraph meta tags to all pages for social sharing

### Phase 5 — Polish (Week 5)
- [ ] Add diagrams (create sanitized, generic versions of architecture diagrams)
- [ ] Add photos to `assets/`
- [ ] Run through sanitization checklist on every page
- [ ] Test all links and mobile responsiveness
- [ ] Submit sitemap to Google Search Console

---

## 7. Content Source Mapping

| Public Page | Primary Source | Sanitization Effort |
|-------------|---------------|---------------------|
| Landing page | Existing `index.html` | Low (already safe) |
| About | New | Write fresh |
| Problem Statement | `docs/RESEARCH_PROBLEM_STATEMENT.md` | **High** — remove Sections 4-10, 13, 15, 17-23 |
| Methodology | `docs/DESIGN_DOCUMENT.md` (Section A only) | **Medium** — remove internal names, keep flow |
| Open Problems | `RESEARCH_PROBLEM_STATEMENT.md` Section 16 | **Low** — just remove infra-related questions |
| Literature | `RESEARCH_PROBLEM_STATEMENT.md` Section 22 | None |
| Findings | `RESEARCH_PROBLEM_STATEMENT.md` Section 14 | **Medium** — generalize specific values |
| EXP-001/002 | `data/site-data.json` + training logs | **Low** — metrics are already public |
| Blog posts | Original content | Write fresh |

---

## 8. SEO & Marketing Notes

- **Keywords:** "reinforcement learning trading India", "RL NSE", "algorithmic trading research", "SAC trading", "walk forward validation"
- **No claims:** Avoid "guaranteed returns", "beat the market", "AI trading bot". Use "research stage", "simulation results", "not yet live".
- **Disclaimers:** Every page with metrics should have "Past simulation results do not guarantee future performance. Not financial advice."
- **Recruiting CTA:** Research pages should end with "Interested in collaborating? [Contact us]"

---

## 9. Maintenance Policy

- Update experiment log after each completed experiment
- Update pipeline status as stages complete
- Publish blog post after each major milestone
- Review all pages quarterly against sanitization checklist
- Keep internal docs in `AlgoTrading` repo, public docs in `AlgoTradingGithubIO` repo — never cross-commit

---

*Plan version: 2026-04-30*
*Next step: Approve plan → Phase 1 implementation*
