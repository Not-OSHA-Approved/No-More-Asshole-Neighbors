# Changelog

All notable changes to this project will be documented here.

## [0.9.0] - 2026-08-03

### Added

- 626 NE 816th Avenue as a five-acre, fiber-connected workshop candidate
- 65 SE 153rd Avenue as a wooded five-acre short-sale candidate

### Changed

- Treat the roughly $900 monthly target as the stabilized retirement goal rather than an immediate transition-payment veto
- Record payoff, principal-recast, refinance, and prepayment questions when evaluating a temporarily higher payment
- Candidate count increased to five

## [0.8.0] - 2026-08-01

### Added

- 225 NE 544th Street in Old Town as a powered-workshop project candidate
- 1668 NE 592nd Street in Old Town as an updated move-in candidate
- Verified listing facts and explicit RV, privacy, restriction, insurance, and acquisition unknowns for both properties

### Changed

- Candidate count increased to three, with all new entries retained in the Maybe queue until financing and site verification survive scrutiny

## [0.7.1] - 2026-07-31

### Fixed

- Serve Leaflet locally so CDN failures cannot leave the persistent map blank
- Cache-bust local dashboard assets during GitHub Pages deployments

## [0.7.0] - 2026-07-31

### Added

- Persistent Leaflet map for the selected property
- Automatic map recentering and marker updates when candidate selection changes
- Coordinate-accuracy label and safe fallback for missing coordinates

### Changed

- Map remains pinned beside the evaluation on desktop and prominent in the mobile flow

## [0.6.0] - 2026-07-31

### Added

- Automated GitHub Pages deployment from the `main` branch
- Workflow validation for required Pages permissions and official actions
- Published dashboard URL documentation

## [0.5.0] - 2026-07-31

### Added

- Database-driven candidate queue and selected-property evaluation
- Independent Retirement Fit and Acquisition Feasibility score cards
- Confirmed fact, unknown, red-flag, and research-confidence presentation
- Direct current-listing and map links
- Dependency-free rendering and HTML-escaping regression tests

### Changed

- Replaced the placeholder workspace with a responsive decision dashboard

## [0.4.0] - 2026-07-31

### Added

- First researched candidate: 8608 Hamster Drive in Zephyrhills, Florida
- Verified listing facts and explicit unresolved financing, condition, access,
  privacy, legal-use, and utility questions
- Validation coverage for the first real property record

### Changed

- Owner financing remains unverified when public remarks conflict with formal
  MLS financing terms

## [0.3.0] - 2026-07-31

### Added

- Independent 100-point Retirement Fit scoring engine
- Independent 100-point Acquisition Feasibility scoring engine
- Privacy-dominant weighting based on the Tascosa benchmark
- No-overlap acquisition scoring and owner-financing terms
- Hard vetoes for HOA, access, affordability, title, legal occupancy, and evacuation
- Schema fields for RV access, legal use, outdoor storage, water, internet, and acquisition terms
- Automated regression tests for ideal, exposed, unobtainable, and vetoed properties

## [0.2.0] - 2026-07-30

### Added

- Formal JSON Schema Draft 2020-12 property contract
- Match, exception, and rejection qualification states
- Required exception reasons and exceptional strengths for near-matches
- Hard HOA rule that forces rejection
- Property schema documentation and automated rule validation

## [0.1.0] - 2026-07-30

### Added

- Initial GitHub Pages-compatible dashboard foundation
- Distinct visual identity and responsive layout
- Empty JSON property database and database health check
- Leaflet asset boundary for future map work
- Dependency-free structural validation
- Initial project documentation and MIT license
