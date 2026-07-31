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

export function propertyViewModel(property) {
  const scores = scoreProperty(property);

  return {
    id: property.id,
    name: property.name,
    nickname: property.nickname,
    place: `${property.location.city}, ${property.location.state}`,
    price: formatMoney(property.listing.price),
    acres: property.land.acres === null ? "Unknown" : `${property.land.acres} acres`,
    status: property.qualification.status,
    statusLabel: STATUS_LABELS[property.qualification.status],
    retirementScore: scores.retirement.total,
    acquisitionScore: scores.acquisition.total,
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
        <span>Retirement <b>${view.retirementScore}</b></span>
        <span>Acquisition <b>${view.acquisitionScore}</b></span>
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
    <div class="score-pair" aria-label="Independent property scores">
      <article><span>Retirement Fit</span><strong>${view.retirementScore}<small>/100</small></strong></article>
      <article><span>Acquisition Feasibility</span><strong>${view.acquisitionScore}<small>/100</small></strong></article>
    </div>
    <p class="decision-summary">${escapeHtml(view.exceptionReason ?? view.notes)}</p>
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
    <h2>${view.acquisitionScore}/100 acquisition</h2>
    <p>${escapeHtml(view.notes)}</p>
    <dl class="reality-list">
      <div><dt>Research confidence</dt><dd>${view.confidence}%</dd></div>
      <div><dt>Owner financing</dt><dd>${escapeHtml(view.financing)}</dd></div>
      <div><dt>Hard veto</dt><dd>${view.eligible ? "None verified" : escapeHtml(view.vetoes.join(", "))}</dd></div>
    </dl>`;
}
