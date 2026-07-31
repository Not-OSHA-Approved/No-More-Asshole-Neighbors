"use strict";

import {
  renderAcquisitionPanel,
  renderPropertyDetail,
  renderQueueItem
} from "./property-view.js";

const PROPERTY_DATA_URL = "data/properties.json";
const DEFAULT_MAP_CENTER = [28.3, -82.2];

let propertyMap;
let propertyMarker;

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
    showPropertyOnMap(property);

    queue.querySelectorAll("[data-property-id]").forEach(button => {
      button.addEventListener("click", () => selectProperty(button.dataset.propertyId));
    });
  };

  selectProperty(properties[0].id);
}

function showPropertyOnMap(property) {
  const { latitude, longitude, coordinateAccuracy } = property.location;
  const accuracy = document.getElementById("map-accuracy");

  if (!propertyMap) {
    propertyMap = L.map("map", { zoomControl: true }).setView(DEFAULT_MAP_CENTER, 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(propertyMap);
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    accuracy.textContent = "Coordinates unknown";
    if (propertyMarker) {
      propertyMarker.remove();
      propertyMarker = undefined;
    }
    propertyMap.setView(DEFAULT_MAP_CENTER, 8);
    return;
  }

  const location = [latitude, longitude];
  const popup = document.createElement("strong");
  popup.textContent = property.name;

  if (!propertyMarker) {
    propertyMarker = L.marker(location).addTo(propertyMap);
  } else {
    propertyMarker.setLatLng(location);
  }

  propertyMarker.bindPopup(popup).openPopup();
  propertyMap.setView(location, coordinateAccuracy === "exact" ? 16 : 14);
  accuracy.textContent = `${coordinateAccuracy ?? "Unknown"} coordinates`;
  window.setTimeout(() => propertyMap.invalidateSize(), 0);
}

loadProjectFoundation();
