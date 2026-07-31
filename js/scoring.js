"use strict";

export const RETIREMENT_WEIGHTS = Object.freeze({
  privacy: 30,
  utilities: 15,
  legalFreedom: 15,
  usableLand: 12,
  affordability: 10,
  access: 8,
  water: 5,
  internet: 3,
  location: 2
});

export const ACQUISITION_WEIGHTS = Object.freeze({
  overlapSolution: 35,
  upfrontCash: 25,
  sellerFlexibility: 20,
  paymentTerms: 15,
  titleAndClosing: 5
});

const value = (table, key) => table[key] ?? 0;

function hardVetoes(property) {
  const vetoes = [];

  if (property.restrictions.hoa === "present") vetoes.push("hoa");
  if (property.land.roadAccess === "landlocked") vetoes.push("no-legal-access");
  if (property.affordability.fit === "unaffordable") vetoes.push("unaffordable");
  if (property.research.titleStatus === "serious-problem") vetoes.push("serious-title-problem");
  if (property.legalUse.residentialPath === "none") vetoes.push("no-legal-residential-path");
  if (property.land.rvAccess === "impossible") vetoes.push("rv-access-impossible");
  if (property.land.evacuationAccess === "blocked") vetoes.push("evacuation-blocked");

  return vetoes;
}

function scorePrivacy(property) {
  return Math.min(30,
    value({ none: 18, few: 9, several: 3, many: 0, unknown: 2 }, property.lifestyle.visibleNeighbors) +
    value({ heavily: 6, partially: 4, cleared: 0, unknown: 1 }, property.land.wooded) +
    value({ long: 3, moderate: 2, short: 1, none: 0, unknown: 0 }, property.lifestyle.driveway) +
    value({ excellent: 3, possible: 1, poor: 0, unknown: 0 }, property.lifestyle.gatePotential)
  );
}

function scoreUtilities(property) {
  return Math.min(15,
    value({ existing: 6, partial: 2, none: 0, unknown: 0 }, property.utilities.overall) +
    value({ connected: 3, available: 1, "solar-only": 0, none: 0, unknown: 0 }, property.utilities.power) +
    value({ public: 3, well: 3, available: 1, none: 0, unknown: 0 }, property.utilities.water) +
    value({ installed: 3, sewer: 3, permitted: 1, none: 0, unknown: 0 }, property.utilities.septic)
  );
}

function scoreLegalFreedom(property) {
  return Math.min(15,
    value({ none: 5, unknown: 1, present: 0 }, property.restrictions.hoa) +
    value({ "none-known": 3, unknown: 1, present: 0 }, property.restrictions.deedRestrictions) +
    value({ unrestricted: 3, limited: 1, prohibited: 0, unknown: 0 }, property.restrictions.outdoorStorage) +
    value({ allowed: 4, conditional: 2, prohibited: 0, unknown: 1 }, property.legalUse.fullTimeRvOccupancy)
  );
}

function scoreUsableLand(property) {
  return Math.min(12,
    value({ excellent: 4, adequate: 3, limited: 1, poor: 0, unknown: 0 }, property.land.usableSpace) +
    value({ existing: 2, excellent: 2, possible: 1, poor: 0, unknown: 0 }, property.lifestyle.workshopPotential) +
    value({ excellent: 2, good: 2, limited: 1, poor: 0, unknown: 0 }, property.lifestyle.solarPotential) +
    value({ unrestricted: 4, limited: 1, prohibited: 0, unknown: 0 }, property.restrictions.outdoorStorage)
  );
}

function scoreAffordability(property) {
  const monthly = property.affordability.estimatedMonthlyHousingCost;
  if (monthly === null) return 0;
  if (monthly <= 400) return 10;
  if (monthly <= 600) return 8;
  if (monthly <= 750) return 6;
  if (monthly <= 900) return 5;
  if (monthly <= 1200) return 2;
  return 0;
}

function scoreAccess(property) {
  return Math.min(8,
    value({ "verified-year-round": 5, likely: 3, difficult: 1, impossible: 0, unknown: 0 }, property.land.rvAccess) +
    value({ verified: 3, likely: 1, blocked: 0, unknown: 0 }, property.land.evacuationAccess)
  );
}

function scoreWater(property) {
  const miles = property.lifestyle.waterAccessMiles;
  if (miles === null) return 0;
  if (miles <= 5) return 5;
  if (miles <= 10) return 4;
  if (miles <= 20) return 3;
  if (miles <= 30) return 2;
  return 0;
}

function scoreInternet(property) {
  return value({ fiber: 3, cable: 3, "5g": 2, starlink: 1, dsl: 0, none: 0, unknown: 0 }, property.lifestyle.internet);
}

function scoreLocation(property) {
  return value({ "west-coast-florida": 2, "other-florida": 1, "snow-country": 0, other: 0, unknown: 0 }, property.location.region);
}

function scoreAcquisition(property) {
  const acquisition = property.acquisition;
  const upfront = acquisition.upfrontCashRequired;
  const payment = acquisition.monthlyPayment;
  const balloon = acquisition.balloonYears;

  const categories = {
    overlapSolution: value({ verified: 35, possible: 18, none: 0, unknown: 0 }, acquisition.overlapSolution),
    upfrontCash: upfront === null ? 0 : upfront <= 5000 ? 25 : upfront <= 10000 ? 20 : upfront <= 25000 ? 10 : 0,
    sellerFlexibility:
      value({ available: 15, negotiable: 8, unavailable: 0, unknown: 0 }, acquisition.ownerFinancing) +
      value({ high: 5, some: 2, none: 0, unknown: 0 }, acquisition.closingFlexibility),
    paymentTerms:
      (payment === null ? 0 : payment <= 900 ? 5 : payment <= 1200 ? 2 : 0) +
      (balloon === null ? 5 : balloon >= 3 ? 5 : 2) +
      value({ none: 5, unknown: 1, present: 0 }, acquisition.prepaymentPenalty),
    titleAndClosing:
      value({ clear: 3, concerns: 1, "serious-problem": 0, unknown: 0 }, property.research.titleStatus) +
      value({ high: 2, some: 1, none: 0, unknown: 0 }, acquisition.closingFlexibility)
  };

  return { categories, total: Object.values(categories).reduce((sum, points) => sum + points, 0) };
}

export function scoreProperty(property) {
  const retirementCategories = {
    privacy: scorePrivacy(property),
    utilities: scoreUtilities(property),
    legalFreedom: scoreLegalFreedom(property),
    usableLand: scoreUsableLand(property),
    affordability: scoreAffordability(property),
    access: scoreAccess(property),
    water: scoreWater(property),
    internet: scoreInternet(property),
    location: scoreLocation(property)
  };
  const acquisition = scoreAcquisition(property);
  const vetoes = hardVetoes(property);

  return {
    eligible: vetoes.length === 0,
    vetoes,
    retirement: {
      categories: retirementCategories,
      total: Object.values(retirementCategories).reduce((sum, points) => sum + points, 0)
    },
    acquisition
  };
}
