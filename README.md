# RLAlphaLabs

**RL-powered trading research for Indian equities (NSE & BSE).**

RLAlphaLabs is a solo research initiative applying deep reinforcement learning to
quantitative trading on Indian markets — built with a focus on realistic costs,
rigorous validation, and honesty about what actually works, rather than overfit
backtests or black-box hype.

**Live site:** https://pctablet505.github.io/RLAlphaLabs/

## Highlights

- **Coverage:** 700+ NSE stocks, 6 market indices, across 8 time granularities
- **Data:** 5,000+ processed data files powering training and evaluation
- **Agents:** actor-critic RL over a discrete, multi-slot portfolio action space, implemented in JAX and trained across many vectorized environments
- **Validation:** walk-forward testing on held-out data (not just backtests), plus
  adversarial stress tests and a paper-trading gate — not single-run backtest metrics
- **Costs modeled explicitly:** NSE/BSE fees, STT, and other transaction costs are
  built into the simulation, not ignored
- **Reward design:** risk-aware rewards rather than raw PnL maximization
- **GPU-accelerated training**

## Status

This project is in an active **research phase** — not a live trading product.
There is no live capital deployed and no performance guarantee. See the
[Research](https://pctablet505.github.io/RLAlphaLabs/research/) page for
published results and methodology, and [About](https://pctablet505.github.io/RLAlphaLabs/about/)
for the project's goals and principles.

## About this repository

This repository hosts the public **GitHub Pages site** for RLAlphaLabs
(features, research write-ups, and experiment logs). The underlying trading
codebase — data pipelines, environments, and training infrastructure — is
private; this site is the public window into that work.

- Site: https://pctablet505.github.io/RLAlphaLabs/
- Author: [github.com/pctablet505](https://github.com/pctablet505)
