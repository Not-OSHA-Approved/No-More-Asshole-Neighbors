import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "css/main.css",
  "js/app.js",
  "data/properties.json",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "docs/DEVELOPMENT.md",
  "docs/PROJECT-STATUS.md"
];

const contents = new Map();

for (const path of requiredFiles) {
  contents.set(path, await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
}

const index = contents.get("index.html");
const app = contents.get("js/app.js");
const database = JSON.parse(contents.get("data/properties.json"));
const publicSource = [
  index,
  contents.get("css/main.css"),
  app,
  contents.get("data/properties.json")
].join("\n");

assert.match(index, /<title>No More Asshole Neighbors<\/title>/);
assert.match(index, /leaflet@1\.9\.4/);
assert.match(index, /css\/main\.css/);
assert.match(index, /js\/app\.js/);
assert.match(app, /data\/properties\.json/);
assert.equal(database.metadata.project, "No More Asshole Neighbors");
assert.equal(database.metadata.version, "0.1.0");
assert.deepEqual(database.properties, []);
assert.doesNotMatch(publicSource, /JOE VISION|Joe Vision|joe-vision/);
assert.doesNotMatch(app, /L\.map|L\.marker|score/i);

console.log(`Validated ${requiredFiles.length} foundation files.`);
console.log("Confirmed empty property database and deferred map/scoring behavior.");
