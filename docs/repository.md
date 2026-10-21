# What is in this repository

These sections were on the README until October 2026; they are kept here word for word. The README is the front
page; this page keeps who the site is for, how to preview a change, the notes, the files and where to read more.

## Is it for you?

For anyone who builds or judges trading backtests, above all on Indian markets, and for engineers curious how one
person runs a research lab with AI agents.

What it is not:

- **Not a trading product.** No signals and no managed money.
- **Not live.** Simulation and paper trading only. No live capital is deployed, and no AI model places trades.
- **Not advice.** RL Alpha Labs is not registered with SEBI as an investment adviser or research analyst; nothing
  here is investment advice.
- **Not the trading code.** That stays private. This repository is the public website.

## Quick start

This repository is the static site at [rlalphalabs.com](https://rlalphalabs.com/), served by GitHub Pages from
`main`. To preview a change:

```bash
git clone https://github.com/pctablet505/RLAlphaLabs
cd RLAlphaLabs
python3 -m http.server 8000      # then open http://localhost:8000
```

## The notes

The lab's findings, written as short notes:

| Note | What it answers |
| --- | --- |
| [Backtest traps that fooled us](https://rlalphalabs.com/notes/backtest-traps/) | Eight traps that fooled us or nearly did, and how we check for each one now |
| [Ideas we closed](https://rlalphalabs.com/notes/ideas-we-closed/) | Which kinds of idea fell short after costs and tax, and why |
| [What trading really costs on NSE](https://rlalphalabs.com/notes/trading-costs/) | The fees, spreads and taxes a delivery trade pays, in basis points |
| [How one person runs a lab with AI agents](https://rlalphalabs.com/notes/how-we-run-ai-agents/) | The rules, guards and reviews behind every number |

One of the eight traps: a test decided on the closing price and then filled at that same close, which no live
order can do.

## The files

| Path | What it holds |
| --- | --- |
| `index.html` | the home page, with the cost calculator |
| `research/` | problem statement, methodology, open problems, literature review |
| `experiments/` | experiment write-ups |
| `notes/` | the four notes above |
| `tools/` | the open-source tools the lab runs on |
| `about/`, `blog/`, `join/`, `traction/`, `privacy/` | the rest of the site |
| `css/`, `js/`, `data/` | style, scripts and the data the pages read |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `feed.xml` | for search engines, feed readers and AI assistants |

## Where to read more

| To | Read |
| --- | --- |
| See the method | [Problem statement](https://rlalphalabs.com/research/problem-statement.html) · [Methodology](https://rlalphalabs.com/research/methodology.html) · [Open problems](https://rlalphalabs.com/research/open-problems.html) |
| See the results | [Experiments](https://rlalphalabs.com/experiments/) · [Ideas we closed](https://rlalphalabs.com/notes/ideas-we-closed/) |
| Meet the lab | [About](https://rlalphalabs.com/about/) · [Open-source tools](https://rlalphalabs.com/tools/) · [Join](https://rlalphalabs.com/join/) |
