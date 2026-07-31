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
assert.equal(view.statusLabel, "Maybe");
assert.equal(view.retirementScore, 29);
assert.equal(view.acquisitionScore, 32);

const queue = renderQueueItem(property, true);
assert.match(queue, /8608 Hamster Drive/);
assert.match(queue, /aria-pressed="true"/);
assert.match(queue, /Retirement <b>29<\/b>/);
assert.match(queue, /Acquisition <b>32<\/b>/);

const detail = renderPropertyDetail(property);
assert.match(detail, /Unknowns &amp; red flags/);
assert.match(detail, /Open current listing/);
assert.match(detail, /reported \$20,000 sale/);

const acquisition = renderAcquisitionPanel(property);
assert.match(acquisition, /32\/100 acquisition/);
assert.match(acquisition, /None verified/);

console.log("Validated candidate queue and property detail rendering.");
console.log("Confirmed HTML escaping, independent scores, and visible research unknowns.");
