/* Pure-JS port of RL Alpha Labs canonical Indian equity / F&O cost calculator.
   Matches algotrading/src/utils/transaction_costs.py & utils/constants.py exactly.
   Strictly DOM-API rendering (safe text nodes only). */
(function () {
  "use strict";

  // Statutory rates (NSE / Zerodha discount schedule; F&O STT reflects post-2026-04-01 rates)
  const RATES = {
    CNC: {
      label: "Equity Delivery (CNC)",
      brokeragePct: 0.0,
      brokerageCap: 0.0,
      sttBuyPct: 0.001,        // 0.10% buy
      sttSellPct: 0.001,       // 0.10% sell
      exchangePct: 0.0000307,  // Rs 307/crore per side (NSE + IPFT)
      sebiPct: 0.000001,       // Rs 10/crore per side
      stampBuyPct: 0.00015,    // 0.015% buy only
      gstRate: 0.18,
      dpSellFlat: 15.34,       // CDSL + broker DP charge incl. 18% GST
    },
    MIS: {
      label: "Equity Intraday (MIS)",
      brokeragePct: 0.0003,    // min(0.03%, Rs 20) per order
      brokerageCap: 20.0,
      sttBuyPct: 0.0,
      sttSellPct: 0.00025,     // 0.025% sell only
      exchangePct: 0.0000307,
      sebiPct: 0.000001,
      stampBuyPct: 0.00003,    // 0.003% buy only
      gstRate: 0.18,
      dpSellFlat: 0.0,
    },
    FUT: {
      label: "NSE Futures (post Apr 2026 STT)",
      brokeragePct: 0.0003,
      brokerageCap: 20.0,
      sttBuyPct: 0.0,
      sttSellPct: 0.0005,      // 0.05% sell (Finance Act 2026 effective 2026-04-01)
      exchangePct: 0.0000183,
      sebiPct: 0.000001,
      stampBuyPct: 0.00002,
      gstRate: 0.18,
      dpSellFlat: 0.0,
    },
    OPT: {
      label: "NSE Options (premium, post Apr 2026 STT)",
      brokeragePct: 0.0,
      brokerageFlat: 20.0,     // Rs 20 flat per order
      brokerageCap: 20.0,
      sttBuyPct: 0.0,
      sttSellPct: 0.0015,      // 0.15% sell premium (Finance Act 2026 effective 2026-04-01)
      exchangePct: 0.0003503,
      sebiPct: 0.000001,
      stampBuyPct: 0.00003,
      gstRate: 0.18,
      dpSellFlat: 0.0,
    },
  };

  function calcRoundTrip(product, legValue, customDp) {
    const r = RATES[product];
    const brokSide = r.brokerageFlat
      ? r.brokerageFlat
      : (r.brokerageCap > 0 ? Math.min(legValue * r.brokeragePct, r.brokerageCap) : legValue * r.brokeragePct);
    const sttBuy = legValue * r.sttBuyPct;
    const sttSell = legValue * r.sttSellPct;
    const exchSide = legValue * r.exchangePct;
    const sebiSide = legValue * r.sebiPct;
    const stampBuy = legValue * r.stampBuyPct;
    const gstSide = (brokSide + exchSide + sebiSide) * r.gstRate;
    const dpSell = product === "CNC" && legValue > 0 ? customDp : 0.0;

    const totalBrokerage = brokSide * 2;
    const totalStt = sttBuy + sttSell;
    const totalExchange = exchSide * 2;
    const totalSebi = sebiSide * 2;
    const totalGst = gstSide * 2;
    const statutory = totalBrokerage + totalStt + totalExchange + totalSebi + stampBuy + totalGst + dpSell;

    return {
      brokerage: totalBrokerage,
      stt: totalStt,
      exchange: totalExchange,
      sebi: totalSebi,
      stamp: stampBuy,
      gst: totalGst,
      dp: dpSell,
      statutoryINR: statutory,
      statutoryBps: legValue > 0 ? (statutory / legValue) * 10000 : 0,
      dpBps: legValue > 0 ? (dpSell / legValue) * 10000 : 0,
    };
  }

  function formatINR(n, dec) {
    if (!Number.isFinite(n)) return "—";
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function el(tag, cls, txt) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (txt !== undefined) node.textContent = String(txt);
    return node;
  }

  function update() {
    const product = document.getElementById("calcProduct").value;
    const capital = Math.max(1000, Number(document.getElementById("calcCapital").value) || 100000);
    const stocks = Math.max(1, Math.min(1000, Math.round(Number(document.getElementById("calcStocks").value) || 20)));
    const turnover = Math.max(0, Number(document.getElementById("calcTurnover").value) || 1.0);
    const spreadBps = Math.max(0, Number(document.getElementById("calcSpread").value) || 0);
    const grossCagrPct = Math.max(0, Number(document.getElementById("calcGrossCagr").value) || 13.0);
    const holdingMode = document.getElementById("calcTaxMode").value;
    const years = Math.max(1, Math.min(30, Number(document.getElementById("calcYears").value) || 10));
    const dpFee = Math.max(0, Number(document.getElementById("calcDpFee").value) || 15.34);

    const legValue = capital / stocks;
    const rt = calcRoundTrip(product, legValue, dpFee);
    const allInBps = rt.statutoryBps + spreadBps;
    const annualCostDragPct = (allInBps / 100.0) * turnover;

    // Compare deferred passive index fund (taxed once at exit at 12.5% * 1.04 = 13.0%)
    // against an active portfolio paying taxes yearly on realized gains.
    const g = grossCagrPct / 100.0;
    const fundTer = 0.002; // 0.20% NIFTY 500 index fund TER
    const passiveTaxRate = 0.125 * 1.04;
    const passiveGrossMultiple = Math.pow(1 + Math.max(-0.99, g - fundTer), years);
    const passiveNetMultiple = 1 + (passiveGrossMultiple - 1) * (1 - passiveTaxRate);
    const passiveNetCagr = (Math.pow(passiveNetMultiple, 1 / years) - 1) * 100.0;

    const activeTaxRate = holdingMode === "STCG" ? 0.20 * 1.04 : 0.125 * 1.04;
    const activePostCostReturn = g - annualCostDragPct / 100.0;
    const activeAfterTaxAnnual = activePostCostReturn > 0
      ? activePostCostReturn * (1 - activeTaxRate)
      : activePostCostReturn;
    const taxDragVsPassive = (Math.pow(1 + g, 1) - 1) * 100 - passiveNetCagr;
    const totalAnnualGap = passiveNetCagr - activeAfterTaxAnnual * 100.0;

    // Required gross active CAGR to tie the passive index fund after costs and yearly tax
    const reqActiveGross = (passiveNetCagr / 100.0) / (1 - activeTaxRate) + annualCostDragPct / 100.0;
    const excessAlphaNeeded = reqActiveGross * 100.0 - grossCagrPct;

    document.getElementById("outLegSize").textContent = formatINR(legValue, 0);
    document.getElementById("outStatBps").textContent = rt.statutoryBps.toFixed(2) + " bps";
    document.getElementById("outStatSub").textContent =
      product === "CNC"
        ? "DP fee alone: " + rt.dpBps.toFixed(2) + " bps (" + formatINR(rt.dp, 2) + "/sell)"
        : formatINR(rt.statutoryINR, 2) + " per round trip";
    document.getElementById("outAllInBps").textContent = allInBps.toFixed(2) + " bps";
    document.getElementById("outAnnualDrag").textContent = annualCostDragPct.toFixed(2) + " pp/yr cost drag @ " + turnover.toFixed(2) + " RT/yr";
    document.getElementById("outAlphaNeeded").textContent = "+" + Math.max(0, excessAlphaNeeded).toFixed(2) + " pp/yr";
    document.getElementById("outAlphaSub").textContent =
      "Need " + (reqActiveGross * 100).toFixed(2) + "%/yr gross to match " + passiveNetCagr.toFixed(2) + "%/yr net index fund";

    // Component breakdown table
    const body = document.getElementById("breakdownBody");
    body.replaceChildren();
    const rows = [
      ["Brokerage (both legs)", rt.brokerage],
      ["Securities Transaction Tax (STT)", rt.stt],
      ["NSE Exchange Txn + IPFT", rt.exchange],
      ["SEBI Turnover Fee", rt.sebi],
      ["Stamp Duty (buy side only)", rt.stamp],
      ["GST (18% on brok + exch + SEBI)", rt.gst],
      ["CDSL/Broker DP Fee (sell, incl. GST)", rt.dp],
      ["Total Statutory Floor", rt.statutoryINR],
      ["Bid-Ask Spread Assumption", legValue * (spreadBps / 10000.0)],
      ["All-in Round-Trip Friction", rt.statutoryINR + legValue * (spreadBps / 10000.0)],
    ];
    for (let i = 0; i < rows.length; i++) {
      const [label, amt] = rows[i];
      const bps = legValue > 0 ? (amt / legValue) * 10000 : 0;
      const tr = el("tr", i === 7 || i === 9 ? "is-win" : "");
      tr.appendChild(el("td", "", label));
      tr.appendChild(el("td", "num", formatINR(amt, 2)));
      tr.appendChild(el("td", "num", bps.toFixed(2) + " bps"));
      body.appendChild(tr);
    }

    // Leg-size ladder table
    const ladderBody = document.getElementById("ladderBody");
    ladderBody.replaceChildren();
    const sizes = [1000, 2500, 5000, 10000, 20000, 30000, 50000, 100000];
    for (const sz of sizes) {
      const m = calcRoundTrip(product, sz, dpFee);
      const tr = el("tr", Math.abs(sz - legValue) < sz * 0.25 ? "is-win" : "");
      tr.appendChild(el("td", "num", formatINR(sz, 0)));
      tr.appendChild(el("td", "num", m.dpBps.toFixed(2) + " bps"));
      tr.appendChild(el("td", "num", m.statutoryBps.toFixed(2) + " bps"));
      tr.appendChild(el("td", "num", (m.statutoryBps + spreadBps).toFixed(2) + " bps"));
      tr.appendChild(el("td", "num", formatINR(m.statutoryINR, 2)));
      ladderBody.appendChild(tr);
    }

    document.getElementById("outGapLine").textContent =
      "Over " + years + " yrs at " + grossCagrPct.toFixed(1) + "% gross CAGR (taxed " +
      (holdingMode === "STCG" ? "yearly at 20.8% STCG" : "yearly at 13.0% LTCG") +
      "), an active basket trails a deferred NIFTY 500 index fund by " +
      totalAnnualGap.toFixed(2) + " pp/yr (" +
      annualCostDragPct.toFixed(2) + " pp/yr trading costs + " +
      Math.max(0, totalAnnualGap - annualCostDragPct).toFixed(2) + " pp/yr compounding tax deferral drag; fund tax " +
      taxDragVsPassive.toFixed(2) + " pp/yr implicit).";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const ids = ["calcProduct", "calcCapital", "calcStocks", "calcTurnover", "calcSpread", "calcGrossCagr", "calcTaxMode", "calcYears", "calcDpFee"];
    for (const id of ids) {
      const node = document.getElementById(id);
      if (node) {
        node.addEventListener("input", update);
        node.addEventListener("change", update);
      }
    }
    for (const btn of document.querySelectorAll(".preset-chip")) {
      btn.addEventListener("click", () => {
        const cap = btn.getAttribute("data-cap");
        const k = btn.getAttribute("data-k");
        const rt = btn.getAttribute("data-rt");
        const spr = btn.getAttribute("data-spread");
        if (cap) document.getElementById("calcCapital").value = cap;
        if (k) document.getElementById("calcStocks").value = k;
        if (rt) document.getElementById("calcTurnover").value = rt;
        if (spr) document.getElementById("calcSpread").value = spr;
        update();
      });
    }
    update();
  });
})();
