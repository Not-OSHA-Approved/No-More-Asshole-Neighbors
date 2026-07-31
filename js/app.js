"use strict";

import {
  renderAcquisitionPanel,
  renderPropertyDetail,
  renderQueueItem
} from "./property-view.js";

const PROPERTY_DATA_URL = "data/properties.json";

async function loadProjectFoundation() {
  const status = document.getElementById("system-status");
  const propertyCount = document.getElementById("property-count");

  try {
    const response = await fetch(PROPERTY_DATA_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Property database returned HTTP ${response.status}.`);
    }

    const data = await response.json();

    if (!Array.isArray(data.properties)) {
      throw new TypeError("Property database must contain a properties array.");
    }

    propertyCount.textContent = String(data.properties.length);
    renderCandidates(data.properties);
    status.classList.add("ready");
    status.lastChild.textContent = " Foundation online";
  } catch (error) {
    console.error("Project foundation failed to initialize:", error);
    status.classList.add("error");
    status.lastChild.textContent = " Property database offline";
  }
}

function renderCandidates(properties) {
  const queue = document.getElementById("candidate-queue");
  const detail = document.getElementById("property-detail");
  const acquisition = document.getElementById("acquisition-panel");

  if (!properties.length) {
    queue.innerHTML = "<p>No credible candidates loaded yet.</p>";
    detail.innerHTML = "<p>No property selected.</p>";
    acquisition.innerHTML = "<p>Acquisition evaluation pending.</p>";
    return;
  }

  const selectProperty = id => {
    const property = properties.find(candidate => candidate.id === id) ?? properties[0];
    queue.innerHTML = properties
      .map(candidate => renderQueueItem(candidate, candidate.id === property.id))
      .join("");
    detail.innerHTML = renderPropertyDetail(property);
    acquisition.innerHTML = renderAcquisitionPanel(property);

    queue.querySelectorAll("[data-property-id]").forEach(button => {
      button.addEventListener("click", () => selectProperty(button.dataset.propertyId));
    });
  };

  selectProperty(properties[0].id);
}

loadProjectFoundation();
