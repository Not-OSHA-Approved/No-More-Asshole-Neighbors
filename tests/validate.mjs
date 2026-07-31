import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const requiredFiles = [
  ".github/workflows/pages.yml",
  "index.html",
  "css/main.css",
  "js/app.js",
  "js/property-view.js",
  "js/scoring.js",
  "data/properties.json",
  "data/property.schema.json",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "docs/DEVELOPMENT.md",
  "docs/PROPERTY-SCHEMA.md",
  "docs/SCORING-MODEL.md",
  "docs/PROJECT-STATUS.md"
];

const contents = new Map();

for (const path of requiredFiles) {
  contents.set(path, await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
}

const index = contents.get("index.html");
const app = contents.get("js/app.js");
const pagesWorkflow = contents.get(".github/workflows/pages.yml");
const database = JSON.parse(contents.get("data/properties.json"));
const schema = JSON.parse(contents.get("data/property.schema.json"));
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
assert.equal(database.metadata.version, "0.6.0");
assert.equal(database.metadata.schemaVersion, "1.1.0");
assert.equal(database.metadata.schema, "property.schema.json");
assert.equal(database.properties.length, 1);
assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
assert.equal(schema.additionalProperties, false);
assert.match(pagesWorkflow, /branches: \[main\]/);
assert.match(pagesWorkflow, /pages: write/);
assert.match(pagesWorkflow, /id-token: write/);
assert.match(pagesWorkflow, /actions\/configure-pages@v5/);
assert.match(pagesWorkflow, /enablement: true/);
assert.match(pagesWorkflow, /actions\/deploy-pages@v4/);

const hoaRule = schema.allOf.find(rule =>
  rule.if?.properties?.restrictions?.properties?.hoa?.const === "present"
);
assert.ok(hoaRule, "Schema must define the hard HOA rule.");
assert.equal(
  hoaRule.then.properties.qualification.properties.status.const,
  "rejected"
);
assert.deepEqual(
  hoaRule.then.properties.qualification.properties.missedRequirements.contains,
  { const: "no-hoa" }
);

const matchRule = schema.allOf.find(rule =>
  rule.if?.properties?.qualification?.properties?.status?.const === "match"
);
assert.ok(matchRule, "Schema must define the full-match rule.");
assert.equal(matchRule.then.properties.land.properties.acres.minimum, 2);
assert.equal(matchRule.then.properties.restrictions.properties.hoa.const, "none");
assert.equal(matchRule.then.properties.affordability.properties.fit.const, "comfortable");

const exceptionRule = schema.allOf.find(rule =>
  rule.if?.properties?.qualification?.properties?.status?.const === "exception"
);
assert.ok(exceptionRule, "Schema must define the exception rule.");
assert.equal(
  exceptionRule.then.properties.qualification.properties.missedRequirements.minItems,
  1
);
assert.equal(
  exceptionRule.then.properties.qualification.properties.exceptionalStrengths.minItems,
  1
);
assert.deepEqual(
  exceptionRule.then.properties.restrictions.properties.hoa.enum,
  ["none", "unknown"]
);

function qualificationViolations(record) {
  const violations = [];
  const status = record.qualification.status;

  if (record.restrictions.hoa === "present" && status !== "rejected") {
    violations.push("hoa-must-reject");
  }

  if (status === "match") {
    if (record.land.acres < 2) violations.push("minimum-acreage");
    if (record.restrictions.hoa !== "none") violations.push("no-hoa");
    if (!["rural", "semi-rural"].includes(record.location.setting)) {
      violations.push("rural-setting");
    }
    if (record.affordability.fit !== "comfortable") {
      violations.push("affordability");
    }
    if (!record.dwelling.exists && record.utilities.overall !== "existing") {
      violations.push("existing-utilities-or-dwelling");
    }
  }

  if (status === "exception") {
    if (record.restrictions.hoa === "present") violations.push("hoa-cannot-be-exception");
    if (!record.qualification.missedRequirements.length) violations.push("missing-exception-failure");
    if (!record.qualification.exceptionReason) violations.push("missing-exception-reason");
    if (!record.qualification.exceptionalStrengths.length) violations.push("missing-exception-strength");
  }

  if (status === "rejected" && !record.qualification.rejectionReasons.length) {
    violations.push("missing-rejection-reason");
  }

  return violations;
}

const representativeMatch = {
  location: { setting: "rural" },
  land: { acres: 3.2 },
  dwelling: { exists: true },
  utilities: { overall: "existing" },
  restrictions: { hoa: "none" },
  affordability: { fit: "comfortable" },
  qualification: {
    status: "match",
    missedRequirements: [],
    exceptionReason: null,
    exceptionalStrengths: [],
    rejectionReasons: []
  }
};

const representativeException = structuredClone(representativeMatch);
representativeException.land.acres = 1.8;
representativeException.qualification = {
  status: "exception",
  missedRequirements: ["minimum-acreage"],
  exceptionReason: "Slightly under acreage but otherwise unusually strong.",
  exceptionalStrengths: ["No visible neighbors and existing workshop"],
  rejectionReasons: []
};

const representativeHoaRejection = structuredClone(representativeMatch);
representativeHoaRejection.restrictions.hoa = "present";
representativeHoaRejection.qualification = {
  status: "rejected",
  missedRequirements: ["no-hoa"],
  exceptionReason: null,
  exceptionalStrengths: [],
  rejectionReasons: ["HOA present"]
};

assert.deepEqual(qualificationViolations(representativeMatch), []);
assert.deepEqual(qualificationViolations(representativeException), []);
assert.deepEqual(qualificationViolations(representativeHoaRejection), []);

const firstCandidate = database.properties[0];
assert.equal(firstCandidate.id, "NMAN-001");
assert.equal(firstCandidate.name, "8608 Hamster Drive");
assert.equal(firstCandidate.listing.status, "active");
assert.equal(firstCandidate.listing.price, 150000);
assert.equal(firstCandidate.land.acres, 2);
assert.equal(firstCandidate.restrictions.hoa, "none");
assert.equal(firstCandidate.acquisition.ownerFinancing, "negotiable");
assert.equal(firstCandidate.qualification.status, "exception");
assert.deepEqual(firstCandidate.qualification.missedRequirements, ["affordability"]);
assert.deepEqual(qualificationViolations(firstCandidate), []);
assert.ok(firstCandidate.research.unknowns.length >= 10);
assert.match(firstCandidate.research.notes, /do not confuse advertised owner financing/i);

const invalidHoaException = structuredClone(representativeException);
invalidHoaException.restrictions.hoa = "present";
assert.deepEqual(
  qualificationViolations(invalidHoaException).sort(),
  ["hoa-cannot-be-exception", "hoa-must-reject"]
);
assert.doesNotMatch(publicSource, /JOE VISION|Joe Vision|joe-vision/);
assert.doesNotMatch(app, /L\.map|L\.marker/);

console.log(`Validated ${requiredFiles.length} project files.`);
console.log("Confirmed match, exception, rejection, and hard HOA schema rules.");
