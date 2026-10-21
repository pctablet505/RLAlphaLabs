# RL Alpha Labs

**Judged after real costs and tax, not by the best backtest.** RL Alpha Labs is a one-person research lab for
Indian stock markets. This repository is its website, not code: the trading code is private. Each idea is tested on
data from NSE, India's National Stock Exchange, with the companies that later failed kept in, and must beat an index
fund or a simpler method after real costs and tax. No live capital is deployed.

## Did any idea work?

Most trading ideas fail, the lab's notes say; the useful part is knowing why. One that closed: holding 300 stocks
yourself instead of an index fund. In a 20.7-year backtest (2006 to 2026), rebalancing them every quarter lost 2.14%
a year to trading costs and yearly capital-gains tax, and trailed the index fund in 69 of 70 combinations of account
size and number of stocks. The cause is built in: a fund rebalances inside itself, so its investor pays the tax once,
at the end.

Twelve ideas are [closed](https://rlalphalabs.com/notes/ideas-we-closed/), each with its reason: costs and taxes
closed four; five showed no edge or only luck; in one, prices rose before the news, not after; two AI models missed
the bar set for them.

**[Start with the eight backtest traps that fooled us →](https://rlalphalabs.com/notes/backtest-traps/)**

## What one trade costs

Many backtests assume 10 to 15 basis points a trade. A buy and a later sale on NSE cost this, from the lab's
[costs note](https://rlalphalabs.com/notes/trading-costs/) (rates read on 22 October 2026; a basis point is 0.01%):

| Cost | Basis points |
|---|---|
| Taxes and exchange fees | 22.25 |
| A flat ₹15.34 fee for each stock sold, on a ₹5,000 position | 30.68 |
| The same fee on a ₹50,000 position | 3.07 |
| The spread between buying and selling prices, large to smaller companies | 24 to 55.4 |

## The eight traps

Each made a result look better, or a check look passed, without an error message:

1. Trading at the price you decided on
2. Testing only the companies that survived (roughly 2.4 to 4.2 points a year, in the lab's estimate)
3. Prices of zero at the start of history
4. Dropping what you cannot match
5. A pass mark mistaken for power
6. A control that cannot fail
7. A broken measurement that looks like progress
8. A language model that already knows the answer

## What it is not

- **Not a product or advice.** No signals and no managed money. RL Alpha Labs is not registered with SEBI as an
  investment adviser or research analyst; nothing here is investment advice.
- **Not live.** Simulation and paper trading (orders recorded, never sent) only. No live capital is deployed, and no
  AI model places trades.

## How it works

<p>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/diagram-dark.svg">
  <img src="assets/diagram-light.svg" width="100%" alt="The research loop. An idea gets a plan fixed before any result is read, is tested on NSE data with failed firms kept in, after costs and tax, and is judged against a bar, usually an index fund. If it clears the bar it goes to paper trading only. If it falls short it is closed and published with the reason.">
</picture>
</p>

The stages are in [Methodology](https://rlalphalabs.com/research/methodology.html).

## Where next

- [Open problems](https://rlalphalabs.com/research/open-problems.html): twenty research problems the lab has not
  solved, open to collaborators.
- [Join the lab](https://rlalphalabs.com/join/): what working with it looks like, and the open projects.
- [What is in this repository](docs/repository.md): the site's files, and how to preview a change on your own machine.
- Other tools from the same lab: [Servedeck](https://github.com/pctablet505/servedeck),
  [GLM-5.3 on one GPU](https://github.com/pctablet505/glm53-flash-single-gpu) and
  [hostops](https://github.com/pctablet505/hostops).

---

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/mark-dark.svg"><img src="assets/mark-light.svg" width="16" height="16" alt=""></picture>
<sub>**Real numbers, failures left in.** RL Alpha Labs is built by [pctablet505](https://github.com/pctablet505). Past simulation results do not guarantee future live performance.</sub>
