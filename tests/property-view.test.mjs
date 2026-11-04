import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  escapeHtml,
  formatMoney,
  propertyViewModel,
  renderAcquisitionPanel,
  renderPropertyDetail,
  renderQueueItem
} from "../js/property-view.js";

const database = JSON.parse(
  await readFile(new URL("../data/properties.json", import.meta.url), "utf8")
);
const property = database.properties[0];
const view = propertyViewModel(property);

assert.equal(escapeHtml('<script>alert("x")</script>'), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
assert.equal(formatMoney(150000), "$150,000");
assert.equal(formatMoney(null), "Unknown");
assert.equal(view.statusLabel, "Priority #1");
assert.equal(view.fitAssessment, "Top choice");
assert.equal(view.acquisitionAssessment, "Terms unverified");

const queue = renderQueueItem(property, true);
assert.match(queue, /16115 Peach Orchard Road/);
assert.match(queue, /aria-pressed="true"/);
assert.match(queue, /Fit: <b>Top choice<\/b>/);
assert.match(queue, /Purchase: <b>Terms unverified<\/b>/);

const detail = renderPropertyDetail(property);
assert.match(detail, /Unknowns &amp; red flags/);
assert.match(detail, /Open current listing/);
assert.match(detail, /INVALID FLOOD ZONE CODE/);
assert.doesNotMatch(detail, /27<small>\/100/);

const acquisition = renderAcquisitionPanel(property);
assert.match(acquisition, /Terms unverified/);
assert.match(acquisition, /None verified/);

console.log("Validated candidate queue and property detail rendering.");
console.log("Confirmed HTML escaping, visible status assessments, and visible research unknowns.");
