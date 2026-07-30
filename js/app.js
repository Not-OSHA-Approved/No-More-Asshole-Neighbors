"use strict";

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
    status.classList.add("ready");
    status.lastChild.textContent = " Foundation online";
  } catch (error) {
    console.error("Project foundation failed to initialize:", error);
    status.classList.add("error");
    status.lastChild.textContent = " Property database offline";
  }
}

loadProjectFoundation();
