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
    ["Brooksville location", isKnown(property.location.city), property.location.city.toLowerCase() === "brooksville"],
    ["At least 2 acres", typeof property.land.acres === "number", property.land.acres >= 2],
    ["No HOA", isKnown(property.restrictions.hoa), property.restrictions.hoa === "none"],
    ["Agricultural/rural zoning", isKnown(property.restrictions.zoning), ["AG", "AR2"].includes(property.restrictions.zoning)],
    ["Existing residential structure", isKnown(property.legalUse.residentialPath), property.legalUse.residentialPath === "existing-dwelling"],
    ["Well on property", isKnown(property.utilities.water), property.utilities.water === "well"],
    ["Septic installed", isKnown(property.utilities.septic), property.utilities.septic === "installed"],
    ["Solar potential rated good or better", isKnown(property.lifestyle.solarPotential), ["good", "excellent"].includes(property.lifestyle.solarPotential)],
    ["Privacy from neighbors verified", isKnown(property.lifestyle.visibleNeighbors), ["none", "few"].includes(property.lifestyle.visibleNeighbors)],
    ["Full-time RV occupancy authorized", isKnown(property.legalUse.fullTimeRvOccupancy), property.legalUse.fullTimeRvOccupancy === "allowed"],
    ["Flood risk verified low", isKnown(property.land.floodRisk), property.land.floodRisk === "low"],
    ["Electricity connected", isKnown(property.utilities.power), property.utilities.power === "connected"]
  ];
  const fit = { met: checks.filter(c => c[1] && c[2]).length, total: checks.length, open: checks.filter(c => !c[1]).length, unmet: checks.filter(c => c[1] && !c[2]).length };
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
    fitChecks: checks.map(([label, known, pass]) => ({ label, status: !known ? "Open" : pass ? "Met" : "Not met" })),
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
        <span>Financing: <b>${view.checks.financing.met}/${view.checks.financing.total} verified</b></span>
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
      <article><span>Retirement Fit Checks</span><strong>${view.checks.fit.met}<small> / ${view.checks.fit.total} met</small></strong><small>${view.checks.fit.open} open · ${view.checks.fit.unmet} not met. Counts include advertised features and assessments, not independent verification.</small></article>
      <article><span>Financing Terms Verified</span><strong>${view.checks.financing.met}<small> / ${view.checks.financing.total}</small></strong><small>A seller-financing advertisement is not a confirmed financing agreement.</small></article>
    </div>
    <p class="decision-summary">${escapeHtml(view.exceptionReason ?? view.notes)}</p>
    <details class="assessment-checks"><summary>How these numbers are calculated</summary><div class="assessment-lists"><div><h3>Retirement fit</h3><ul>${view.checks.fitChecks.map(c => `<li>${escapeHtml(c.label)} — ${escapeHtml(c.status)}</li>`).join("")}</ul></div><div><h3>Financing</h3><ul>${view.checks.financingChecks.map(c => `<li>${escapeHtml(c.label)} — ${escapeHtml(c.status)}</li>`).join("")}</ul></div></div></details>
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
      <div><dt>Research confidence</dt><dd>${view.confidence}%</dd></div>
      <div><dt>Owner financing</dt><dd>${escapeHtml(view.financing)}</dd></div>
      <div><dt>Hard veto</dt><dd>${view.eligible ? "None verified" : escapeHtml(view.vetoes.join(", "))}</dd></div>
    </dl>`;
}
