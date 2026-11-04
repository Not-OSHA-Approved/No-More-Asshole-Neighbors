"use strict";

import { scoreProperty } from "./scoring.js";

const STATUS_LABELS = Object.freeze({
  match: "Match",
  exception: "Maybe",
  rejected: "Rejected"
});

const text = value => String(value ?? "Unknown");

export function escapeHtml(value) {
  return text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatMoney(value) {
  return value === null || value === undefined
    ? "Unknown"
    : new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
}


function evaluateChecks(property) {
  const isKnown = v => v !== null && v !== undefined && v !== "unknown";
  const checks = [
    ["location", "Brooksville location", isKnown(property.location.city), property.location.city.toLowerCase() === "brooksville"],
    ["acreage", "At least 2 acres", typeof property.land.acres === "number", property.land.acres >= 2],
    ["hoa", "No HOA", isKnown(property.restrictions.hoa), property.restrictions.hoa === "none"],
    ["zoning", "Agricultural/rural zoning", isKnown(property.restrictions.zoning), ["AG", "AR2"].includes(property.restrictions.zoning)],
    ["residential", "Existing residential structure", isKnown(property.legalUse.residentialPath), property.legalUse.residentialPath === "existing-dwelling"],
    ["well", "Well on property", isKnown(property.utilities.water), property.utilities.water === "well"],
    ["septic", "Septic installed", isKnown(property.utilities.septic), property.utilities.septic === "installed"],
    ["solar", "Solar potential rated good or better", isKnown(property.lifestyle.solarPotential), ["good", "excellent"].includes(property.lifestyle.solarPotential)],
    ["privacy", "Privacy from neighbors verified", isKnown(property.lifestyle.visibleNeighbors), ["none", "few"].includes(property.lifestyle.visibleNeighbors)],
    ["rv", "Full-time RV occupancy authorized", isKnown(property.legalUse.fullTimeRvOccupancy), property.legalUse.fullTimeRvOccupancy === "allowed"],
    ["flood", "Flood risk verified low", isKnown(property.land.floodRisk), property.land.floodRisk === "low"],
    ["electric", "Electricity connected", isKnown(property.utilities.power), property.utilities.power === "connected"]
  ];
  const evidenceWeights = { "county-record": 1, observed: .8, listing: .6, assessment: .4 };
  const evidenceSources = property.research.evidenceSources ?? {};
  const known = checks.filter(c => c[2]);
  const evidencePoints = known.reduce((sum, [key]) => sum + (evidenceWeights[evidenceSources[key]] ?? 0), 0);
  const fit = {
    met: checks.filter(c => c[2] && c[3]).length,
    total: checks.length,
    open: checks.filter(c => !c[2]).length,
    unmet: checks.filter(c => c[2] && !c[3]).length,
    known: known.length,
    maturity: Math.round(100 * evidencePoints / checks.length),
    quality: known.length ? Math.round(100 * evidencePoints / known.length) : 0
  };
  const acquisition = property.acquisition;
  const financing = [
    ["Down payment confirmed", acquisition.upfrontCashRequired !== null],
    ["Interest and repayment term confirmed", acquisition.interestRate != null && acquisition.amortizationYears != null],
    ["Mortgage payment ≤ $1,000 confirmed", acquisition.monthlyPayment !== null && acquisition.monthlyPayment <= 1000],
    ["Prepayment terms confirmed", acquisition.prepaymentPenalty !== "unknown"],
    ["Buy-before-sell arrangement confirmed", acquisition.overlapSolution === "verified"]
  ];
  return {
    fit, financing: { met: financing.filter(x => x[1]).length, total: financing.length },
    fitChecks: checks.map(([key, label, known, pass]) => ({
      label, status: !known ? "Open" : pass ? "Met" : "Not met",
      evidence: known ? (evidenceSources[key] ?? "source unclassified").replaceAll("-", " ") : "not established"
    })),
    financingChecks: financing.map(([label, met]) => ({ label, status: met ? "Verified" : "Open" }))
  };
}

export function propertyViewModel(property) {
  const scores = scoreProperty(property);
  const checks = evaluateChecks(property);

  return {
    id: property.id,
    name: property.name,
    nickname: property.nickname,
    place: `${property.location.city}, ${property.location.state}`,
    price: formatMoney(property.listing.price),
    acres: property.land.acres === null ? "Unknown" : `${property.land.acres} acres`,
    status: property.qualification.status,
    statusLabel: property.id === "NMAN-013" ? "Priority #1" : STATUS_LABELS[property.qualification.status],
    retirementScore: scores.retirement.total,
    acquisitionScore: scores.acquisition.total,
    checks,
    fitAssessment: property.id === "NMAN-013" ? "Top choice" : "Needs review",
    acquisitionAssessment: property.acquisition.ownerFinancing === "available" || property.acquisition.ownerFinancing === "negotiable"
      ? "Terms unverified" : "Financing unverified",
    eligible: scores.eligible,
    vetoes: scores.vetoes,
    confirmed: property.research.confirmed,
    unknowns: property.research.unknowns,
    notes: property.research.notes,
    listingUrl: property.links.listing,
    mapUrl: property.links.map,
    financing: property.acquisition.ownerFinancing,
    utilities: property.utilities.overall,
    dwellingCondition: property.dwelling.condition,
    confidence: property.research.confidence,
    exceptionReason: property.qualification.exceptionReason
  };
}

export function renderQueueItem(property, selected = false) {
  const view = propertyViewModel(property);

  return `
    <button class="candidate-card${selected ? " selected" : ""}" type="button"
      data-property-id="${escapeHtml(view.id)}" aria-pressed="${selected}">
      <span class="candidate-status ${escapeHtml(view.status)}">${escapeHtml(view.statusLabel)}</span>
      <strong>${escapeHtml(view.name)}</strong>
      <small>${escapeHtml(view.place)}</small>
      <span class="candidate-facts">${escapeHtml(view.price)} · ${escapeHtml(view.acres)}</span>
      <span class="mini-scores">
        <span>Fit: <b>${view.checks.fit.met}/${view.checks.fit.total} matched</b></span>
        <span>Evidence: <b>${view.checks.fit.maturity}/100</b></span>
      </span>
    </button>`;
}

function renderList(items) {
  return items.map(item => `<li>${escapeHtml(item)}</li>`).join("");
}

export function renderPropertyDetail(property) {
  const view = propertyViewModel(property);
  const links = [
    view.listingUrl ? `<a href="${escapeHtml(view.listingUrl)}" target="_blank" rel="noreferrer">Open current listing</a>` : "",
    view.mapUrl ? `<a href="${escapeHtml(view.mapUrl)}" target="_blank" rel="noreferrer">Open map</a>` : ""
  ].filter(Boolean).join("");

  return `
    <div class="detail-heading">
      <div>
        <p class="eyebrow">${escapeHtml(view.statusLabel)} · ${escapeHtml(view.id)}</p>
        <h2>${escapeHtml(view.name)}</h2>
        <p>${escapeHtml(view.nickname)} · ${escapeHtml(view.place)}</p>
      </div>
      <strong class="detail-price">${escapeHtml(view.price)}</strong>
    </div>
    <div class="score-pair" aria-label="Property assessment and financing status">
      <article><span>Retirement Fit</span><strong>${view.checks.fit.met}<small> / ${view.checks.fit.total} matched</small></strong><small>${view.checks.fit.open} open · ${view.checks.fit.unmet} not met. Fit includes listing claims and observed assessments.</small></article>
      <article><span>Evidence Maturity</span><strong>${view.checks.fit.maturity}<small> / 100</small></strong><small>${view.checks.fit.known}/${view.checks.fit.total} assessed · ${view.checks.fit.quality}% average source strength for known items. Unknowns receive zero credit.</small></article>
    </div>
    <p class="financing-snapshot">Financing: <strong>${view.checks.financing.met}/${view.checks.financing.total} terms verified</strong> — payment target $1,000/month; actual seller terms unconfirmed.</p>
    <p class="decision-summary">${escapeHtml(view.exceptionReason ?? view.notes)}</p>
    <details class="assessment-checks"><summary>How these numbers are calculated</summary><div class="assessment-lists"><div><h3>Retirement fit</h3><ul>${view.checks.fitChecks.map(c => `<li>${escapeHtml(c.label)} — ${escapeHtml(c.status)} (${escapeHtml(c.evidence)})</li>`).join("")}</ul></div><div><h3>Financing</h3><ul>${view.checks.financingChecks.map(c => `<li>${escapeHtml(c.label)} — ${escapeHtml(c.status)}</li>`).join("")}</ul></div></div></details>
    <div class="fact-strip">
      <span><small>Land</small>${escapeHtml(view.acres)}</span>
      <span><small>Dwelling</small>${escapeHtml(view.dwellingCondition)}</span>
      <span><small>Utilities</small>${escapeHtml(view.utilities)}</span>
      <span><small>Seller terms</small>${escapeHtml(view.financing)}</span>
    </div>
    <div class="research-grid">
      <section>
        <h3>Confirmed</h3>
        <ul class="confirmed-list">${renderList(view.confirmed)}</ul>
      </section>
      <section>
        <h3>Unknowns &amp; red flags</h3>
        <ul class="unknown-list">${renderList(view.unknowns)}</ul>
      </section>
    </div>
    <div class="detail-links">${links}</div>`;
}

export function renderAcquisitionPanel(property) {
  const view = propertyViewModel(property);

  return `
    <p class="eyebrow">Reality check</p>
    <h2>${view.checks.financing.met}/${view.checks.financing.total} financing terms verified</h2>
    <p>${escapeHtml(view.notes)}</p>
    <dl class="reality-list">
      <div><dt>Evidence maturity</dt><dd>${view.checks.fit.maturity}/100</dd></div>
      <div><dt>Owner financing</dt><dd>${escapeHtml(view.financing)}</dd></div>
      <div><dt>Hard veto</dt><dd>${view.eligible ? "None verified" : escapeHtml(view.vetoes.join(", "))}</dd></div>
    </dl>`;
}
