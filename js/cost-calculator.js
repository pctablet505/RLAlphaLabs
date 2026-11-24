/* Browser-only NSE cash-equity transaction cost & tax-drag calculator.
   Rates align with NSE circulars NSE/FA/64232, 56129, 73061 and Zerodha's
   published NSE equity delivery (CNC) and intraday (MIS) fee schedule.
   Strictly DOM-API rendering (safe text nodes only). */
(function () {
  "use strict";

  const DEFAULT_DP_FEE_INR = 15.34; // CDSL Rs 3.50 + Zerodha Rs 9.50 + 18% GST = Rs 15.34/sell scrip
  const PASSIVE_FUND_TER = 0.002;   // 0.20%/yr benchmark NIFTY 500 index fund expense ratio
  const PASSIVE_EXIT_TAX = 0.125 * 1.04; // 13.0% LTCG incl. 4% cess (excl. surcharge & Rs 1.25L exemption)

  const RATES = {
    CNC: {
      brokeragePct: 0.0,
      brokerageCap: 0.0,
      sttBuyPct: 0.001,        // 0.10% buy
      sttSellPct: 0.001,       // 0.10% sell
      exchangePct: 0.0000307,  // Rs 307/crore per side (NSE txn + IPFT)
      sebiPct: 0.000001,       // Rs 10/crore per side
      stampBuyPct: 0.00015,    // 0.015% buy only
      gstRate: 0.18,           // 18% on (brokerage + exchange + SEBI)
    },
    MIS: {
      brokeragePct: 0.0003,    // min(0.03%, Rs 20) per executed order
      brokerageCap: 20.0,
      sttBuyPct: 0.0,
      sttSellPct: 0.00025,     // 0.025% sell only
      exchangePct: 0.0000307,
      sebiPct: 0.000001,
      stampBuyPct: 0.00003,    // 0.003% buy only
      gstRate: 0.18,
    },
  };

  const TAX_MODES_CNC = [
    { value: "STCG", label: "STCG (20.8% incl. 4% cess)", rate: 0.20 * 1.04, desc: "yearly at 20.8% STCG" },
    { value: "LTCG", label: "LTCG (13.0% incl. 4% cess)", rate: 0.125 * 1.04, desc: "yearly at 13.0% LTCG" },
  ];

  // Intraday cash equity is speculative business income (s.43(5)), taxed at investor slab + 4% cess.
  const TAX_MODES_MIS = [
    { value: "SLAB30", label: "30% slab (31.2% incl. 4% cess)", rate: 0.30 * 1.04, desc: "yearly at 31.2% slab (s.43(5))" },
    { value: "SLAB20", label: "20% slab (20.8% incl. 4% cess)", rate: 0.20 * 1.04, desc: "yearly at 20.8% slab (s.43(5))" },
    { value: "SLAB15", label: "15% slab (15.6% incl. 4% cess)", rate: 0.15 * 1.04, desc: "yearly at 15.6% slab (s.43(5))" },
    { value: "SLAB10", label: "10% slab (10.4% incl. 4% cess)", rate: 0.10 * 1.04, desc: "yearly at 10.4% slab (s.43(5))" },
    { value: "SLAB0", label: "0% slab (exempt)", rate: 0.0, desc: "at 0% slab (exempt)" },
  ];

  let lastProduct = null;

  function parseFiniteInput(id, fallback) {
    const node = document.getElementById(id);
    if (!node) return fallback;
    const raw = String(node.value).trim();
    if (raw === "") return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  function syncTaxOptions(product) {
    const sel = document.getElementById("calcTaxMode");
    const dpInput = document.getElementById("calcDpFee");
    const dpLabel = document.getElementById("calcDpFeeLabel");
    const ladderCol = document.getElementById("ladderSecondCol");
    const opts = product === "MIS" ? TAX_MODES_MIS : TAX_MODES_CNC;

    if (lastProduct !== product) {
      const prev = sel.value;
      sel.replaceChildren();
      for (const item of opts) {
        const o = document.createElement("option");
        o.value = item.value;
        o.textContent = item.label;
        sel.appendChild(o);
      }
      if (opts.some((item) => item.value === prev)) {
        sel.value = prev;
      } else {
        sel.value = opts[0].value;
      }
      lastProduct = product;
    }

    if (dpInput) {
      dpInput.disabled = product === "MIS";
    }
    if (dpLabel) {
      dpLabel.textContent = product === "MIS" ? "DP Sell Fee (₹0 for MIS intraday)" : "DP Sell Fee / Scrip (₹)";
    }
    if (ladderCol) {
      ladderCol.textContent = product === "MIS" ? "Brokerage Drag" : "DP Fee Drag";
    }
  }

  function calcRoundTrip(product, legValue, customDp) {
    const r = RATES[product] || RATES.CNC;
    const brokSide = r.brokerageCap > 0
      ? Math.min(legValue * r.brokeragePct, r.brokerageCap)
      : legValue * r.brokeragePct;
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
      brokerageBps: legValue > 0 ? (totalBrokerage / legValue) * 10000 : 0,
    };
  }

  function formatINR(n, dec) {
    if (!Number.isFinite(n)) return "—";
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function formatSignedPp(n) {
    if (!Number.isFinite(n)) return "—";
    const rounded = Math.abs(n) < 0.005 ? 0 : n;
    const sign = rounded >= 0 ? "+" : "-";
    return sign + Math.abs(rounded).toFixed(2) + " pp/yr";
  }

  function el(tag, cls, txt) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (txt !== undefined) node.textContent = String(txt);
    return node;
  }

  function update() {
    const product = document.getElementById("calcProduct").value === "MIS" ? "MIS" : "CNC";
    syncTaxOptions(product);

    const capital = Math.max(1000, parseFiniteInput("calcCapital", 100000));
    const stocks = Math.max(1, Math.min(1000, Math.round(parseFiniteInput("calcStocks", 20))));
    const turnover = Math.max(0, parseFiniteInput("calcTurnover", 1.0));
    const spreadBps = Math.max(0, parseFiniteInput("calcSpread", 0));
    const grossCagrPct = Math.max(0, Math.min(50, parseFiniteInput("calcGrossCagr", 13.0)));
    const years = Math.max(1, Math.min(30, Math.round(parseFiniteInput("calcYears", 20))));
    const dpFee = Math.max(0, parseFiniteInput("calcDpFee", DEFAULT_DP_FEE_INR));

    const opts = product === "MIS" ? TAX_MODES_MIS : TAX_MODES_CNC;
    const selectedMode = document.getElementById("calcTaxMode").value;
    const taxMeta = opts.find((item) => item.value === selectedMode) || opts[0];
    const activeTaxRate = taxMeta.rate;

    const legValue = capital / stocks;
    const rt = calcRoundTrip(product, legValue, dpFee);
    const allInBps = rt.statutoryBps + spreadBps;
    const annualCostDragPct = (allInBps / 100.0) * turnover;
    const annualCostDragDec = annualCostDragPct / 100.0;

    // Benchmark: deferred passive NIFTY 500 index fund (0.20% TER, taxed once on positive exit gain at 13.0%).
    const g = grossCagrPct / 100.0;
    const passiveGrossStep = Math.max(0.01, 1 + g - PASSIVE_FUND_TER);
    const passiveGrossMultiple = Math.pow(passiveGrossStep, years);
    const passiveGain = Math.max(0, passiveGrossMultiple - 1);
    const passiveNetMultiple = passiveGrossMultiple - passiveGain * PASSIVE_EXIT_TAX;
    const passivePreTaxCagr = (passiveGrossStep - 1) * 100.0;
    const passiveNetCagr = (Math.pow(Math.max(0.01, passiveNetMultiple), 1 / years) - 1) * 100.0;
    const passiveTerDragPp = grossCagrPct - passivePreTaxCagr;
    const passiveExitTaxDragPp = Math.max(0, passivePreTaxCagr - passiveNetCagr);

    // Active portfolio paying tax yearly on 100% of positive post-cost return (losses un-refunded).
    const activeZeroCostAfterTax = g > 0 ? g * (1 - activeTaxRate) : g;
    const activePostCostReturn = g - annualCostDragDec;
    const activeAfterTaxAnnual = activePostCostReturn > 0
      ? activePostCostReturn * (1 - activeTaxRate)
      : activePostCostReturn;
    const totalAnnualGap = passiveNetCagr - activeAfterTaxAnnual * 100.0;

    // Exact after-tax additive decomposition: afterTaxCostDragPp + taxTimingWedgePp === totalAnnualGap.
    const afterTaxCostDragPp = (activeZeroCostAfterTax - activeAfterTaxAnnual) * 100.0;
    const taxTimingWedgePp = passiveNetCagr - activeZeroCostAfterTax * 100.0;

    // Exact gross active return needed to match passiveNetCagr after costs and yearly tax (no refund on loss).
    const passiveNetDec = passiveNetCagr / 100.0;
    const reqActiveGrossDec = passiveNetDec > 0
      ? passiveNetDec / Math.max(1e-6, 1 - activeTaxRate) + annualCostDragDec
      : passiveNetDec + annualCostDragDec;
    const excessAlphaNeeded = reqActiveGrossDec * 100.0 - grossCagrPct;

    document.getElementById("outLegSize").textContent = formatINR(legValue, 0);
    document.getElementById("outStatBps").textContent = rt.statutoryBps.toFixed(2) + " bps";
    document.getElementById("outStatSub").textContent =
      product === "CNC"
        ? "DP fee alone: " + rt.dpBps.toFixed(2) + " bps (" + formatINR(rt.dp, 2) + "/sell)"
        : "Brokerage alone: " + rt.brokerageBps.toFixed(2) + " bps (" + formatINR(rt.brokerage, 2) + "/RT)";
    document.getElementById("outAllInBps").textContent = allInBps.toFixed(2) + " bps";
    document.getElementById("outAnnualDrag").textContent =
      annualCostDragPct.toFixed(2) + " pp/yr pre-tax drag @ " + turnover.toFixed(2) + " RT/yr";
    document.getElementById("outAlphaNeeded").textContent = formatSignedPp(excessAlphaNeeded);
    document.getElementById("outAlphaSub").textContent =
      "Need " + (reqActiveGrossDec * 100).toFixed(2) + "%/yr gross to match " + passiveNetCagr.toFixed(2) + "%/yr net index fund";

    // Component breakdown table
    const body = document.getElementById("breakdownBody");
    body.replaceChildren();
    const rows = [
      ["Brokerage (both legs)", rt.brokerage, false],
      ["Securities Transaction Tax (STT)", rt.stt, false],
      ["NSE Exchange Txn + IPFT", rt.exchange, false],
      ["SEBI Turnover Fee", rt.sebi, false],
      ["Stamp Duty (buy side only)", rt.stamp, false],
      ["GST (18% on brok + exch + SEBI)", rt.gst, false],
      ["CDSL/Broker DP Fee (sell, incl. GST)", rt.dp, false],
      ["Total Statutory Floor", rt.statutoryINR, true],
      ["Bid-Ask Spread Assumption", legValue * (spreadBps / 10000.0), false],
      ["All-in Round-Trip Friction", rt.statutoryINR + legValue * (spreadBps / 10000.0), true],
    ];
    for (let i = 0; i < rows.length; i++) {
      const [label, amt, isTotal] = rows[i];
      const bps = legValue > 0 ? (amt / legValue) * 10000 : 0;
      const tr = el("tr", isTotal ? "is-total" : "");
      tr.appendChild(el("td", "", label));
      tr.appendChild(el("td", "num", formatINR(amt, 2)));
      tr.appendChild(el("td", "num", bps.toFixed(2) + " bps"));
      body.appendChild(tr);
    }

    // Leg-size ladder table — highlight strictly the single closest bucket.
    const ladderBody = document.getElementById("ladderBody");
    ladderBody.replaceChildren();
    const sizes = [1000, 2500, 5000, 10000, 20000, 30000, 50000, 100000];
    let closestIdx = 0;
    let bestDiff = Math.abs(sizes[0] - legValue);
    for (let i = 1; i < sizes.length; i++) {
      const diff = Math.abs(sizes[i] - legValue);
      if (diff < bestDiff) {
        bestDiff = diff;
        closestIdx = i;
      }
    }
    for (let i = 0; i < sizes.length; i++) {
      const sz = sizes[i];
      const m = calcRoundTrip(product, sz, dpFee);
      const tr = el("tr", i === closestIdx ? "is-win" : "");
      tr.appendChild(el("td", "num", formatINR(sz, 0)));
      const secondColVal = product === "MIS" ? m.brokerageBps : m.dpBps;
      tr.appendChild(el("td", "num", secondColVal.toFixed(2) + " bps"));
      tr.appendChild(el("td", "num", m.statutoryBps.toFixed(2) + " bps"));
      tr.appendChild(el("td", "num", (m.statutoryBps + spreadBps).toFixed(2) + " bps"));
      tr.appendChild(el("td", "num", formatINR(m.statutoryINR, 2)));
      ladderBody.appendChild(tr);
    }

    const yrLabel = years === 1 ? "1 yr" : years + " yrs";
    const gapRounded = Math.abs(totalAnnualGap) < 0.005 ? 0 : totalAnnualGap;
    const wedgeDisplay = Math.abs(taxTimingWedgePp) < 0.005 ? 0 : taxTimingWedgePp;
    const gapPhrase = gapRounded >= 0
      ? "trails a deferred NIFTY 500 index fund by " + gapRounded.toFixed(2) + " pp/yr"
      : "leads a deferred NIFTY 500 index fund by " + Math.abs(gapRounded).toFixed(2) + " pp/yr";
    const wedgeSigned = (wedgeDisplay >= 0 ? "+" : "-") + Math.abs(wedgeDisplay).toFixed(2);
    const exitTaxNote = years === 1 ? " exit tax (13.0% LTCG rate, assumes >12m hold)" : " exit tax";
    const line =
      "Over " + yrLabel + " at " + grossCagrPct.toFixed(1) + "% gross CAGR (taxed " + taxMeta.desc +
      ", assuming 100% annual realization, no ₹1.25L exemption, no surcharge), the active basket " +
      gapPhrase + " after tax (" +
      afterTaxCostDragPp.toFixed(2) + " pp/yr after-tax cost drag " +
      (wedgeDisplay >= 0 ? "+ " + wedgeDisplay.toFixed(2) : "- " + Math.abs(wedgeDisplay).toFixed(2)) +
      " pp/yr tax/TER wedge; benchmark fund: " + passiveTerDragPp.toFixed(2) +
      " pp/yr TER + " + passiveExitTaxDragPp.toFixed(2) + " pp/yr" + exitTaxNote + ").";
    document.getElementById("outGapLine").textContent = line;
    const liveNode = document.getElementById("calcLiveStatus");
    if (liveNode) {
      liveNode.textContent =
        product + " leg " + formatINR(legValue, 0) + ": statutory floor " +
        rt.statutoryBps.toFixed(2) + " bps, all-in " + allInBps.toFixed(2) +
        " bps, excess gross return needed " + formatSignedPp(excessAlphaNeeded) +
        " (wedge " + wedgeSigned + " pp/yr).";
    }
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
        if (cap !== null) document.getElementById("calcCapital").value = cap;
        if (k !== null) document.getElementById("calcStocks").value = k;
        if (rt !== null) document.getElementById("calcTurnover").value = rt;
        if (spr !== null) document.getElementById("calcSpread").value = spr;
        update();
      });
    }
    update();
  });
})();
