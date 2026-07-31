import assert from "node:assert/strict";
import {
  ACQUISITION_WEIGHTS,
  RETIREMENT_WEIGHTS,
  scoreProperty
} from "../js/scoring.js";

assert.equal(Object.values(RETIREMENT_WEIGHTS).reduce((sum, value) => sum + value, 0), 100);
assert.equal(Object.values(ACQUISITION_WEIGHTS).reduce((sum, value) => sum + value, 0), 100);

function idealProperty() {
  return {
    location: { region: "west-coast-florida" },
    land: {
      wooded: "heavily",
      roadAccess: "legal-unpaved",
      rvAccess: "verified-year-round",
      evacuationAccess: "verified",
      usableSpace: "excellent"
    },
    utilities: {
      overall: "existing",
      power: "connected",
      water: "well",
      septic: "installed"
    },
    restrictions: {
      hoa: "none",
      deedRestrictions: "none-known",
      outdoorStorage: "unrestricted"
    },
    affordability: {
      fit: "comfortable",
      estimatedMonthlyHousingCost: 400
    },
    legalUse: {
      residentialPath: "existing-dwelling",
      fullTimeRvOccupancy: "allowed"
    },
    lifestyle: {
      visibleNeighbors: "none",
      driveway: "long",
      gatePotential: "excellent",
      workshopPotential: "existing",
      solarPotential: "excellent",
      waterAccessMiles: 5,
      internet: "fiber"
    },
    acquisition: {
      overlapSolution: "verified",
      upfrontCashRequired: 5000,
      ownerFinancing: "available",
      monthlyPayment: 900,
      balloonYears: 5,
      prepaymentPenalty: "none",
      closingFlexibility: "high"
    },
    research: { titleStatus: "clear" }
  };
}

const ideal = scoreProperty(idealProperty());
assert.equal(ideal.eligible, true);
assert.deepEqual(ideal.vetoes, []);
assert.equal(ideal.retirement.total, 100);
assert.equal(ideal.acquisition.total, 100);

const visibleNeighborProperty = idealProperty();
visibleNeighborProperty.lifestyle.visibleNeighbors = "many";
const visibleNeighborResult = scoreProperty(visibleNeighborProperty);
assert.equal(visibleNeighborResult.retirement.total, 82);
assert.equal(visibleNeighborResult.acquisition.total, 100);

const impossibleDeal = idealProperty();
impossibleDeal.acquisition.overlapSolution = "none";
impossibleDeal.acquisition.upfrontCashRequired = 50000;
impossibleDeal.acquisition.ownerFinancing = "unavailable";
impossibleDeal.acquisition.closingFlexibility = "none";
const impossibleDealResult = scoreProperty(impossibleDeal);
assert.equal(impossibleDealResult.retirement.total, 100);
assert.equal(impossibleDealResult.acquisition.total, 18);

const hoaProperty = idealProperty();
hoaProperty.restrictions.hoa = "present";
const hoaResult = scoreProperty(hoaProperty);
assert.equal(hoaResult.eligible, false);
assert.ok(hoaResult.vetoes.includes("hoa"));

const trappedRvProperty = idealProperty();
trappedRvProperty.land.rvAccess = "impossible";
trappedRvProperty.land.evacuationAccess = "blocked";
const trappedRvResult = scoreProperty(trappedRvProperty);
assert.equal(trappedRvResult.eligible, false);
assert.ok(trappedRvResult.vetoes.includes("rv-access-impossible"));
assert.ok(trappedRvResult.vetoes.includes("evacuation-blocked"));

const noLegalResidence = idealProperty();
noLegalResidence.legalUse.residentialPath = "none";
const noLegalResidenceResult = scoreProperty(noLegalResidence);
assert.equal(noLegalResidenceResult.eligible, false);
assert.ok(noLegalResidenceResult.vetoes.includes("no-legal-residential-path"));

console.log("Validated independent 100-point retirement and acquisition scores.");
console.log("Confirmed privacy penalties and all scoring hard vetoes.");
