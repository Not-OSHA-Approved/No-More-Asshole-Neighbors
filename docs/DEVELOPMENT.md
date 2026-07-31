# Development workflow

Every change follows this sequence:

1. Design one feature.
2. Explain the design and meaningful trade-offs.
3. Implement only that feature.
4. Test the implementation.
5. Validate the result.
6. Update documentation.
7. Commit the completed feature.

Do not combine unrelated features or refactor unrelated code.

## Architecture

The project uses a static GitHub Pages architecture:

- `index.html` provides the semantic page structure.
- `css/` owns presentation and responsive layout.
- `js/` owns dashboard behavior.
- `data/` is the authoritative property database.
- `tests/` contains dependency-free structural validation.
- `docs/` records development decisions and project status.

This structure is informed by Joe Vision, but its data, scoring, branding,
language, and business purpose are not shared with this project.

## Feature boundaries

Version `0.1.0` includes only the foundation:

- responsive dashboard shell
- Leaflet asset boundary
- empty JSON property database
- database loading and health status
- dependency-free validation
- initial project documentation

It does not include:

- property records or listing presentation
- property scoring
- affordability calculations
- filters
- map initialization or markers
- automated property acquisition

## Property data contract

Beginning with version `0.2.0`, every property record must conform to
`data/property.schema.json`. See `docs/PROPERTY-SCHEMA.md` for qualification
rules and the hard HOA veto.

## Map contract

Beginning with version `0.7.0`, the selected candidate is plotted on a
persistent Leaflet map. Candidate changes must recenter the existing map and
marker rather than create another map instance. Approximate coordinates must be
labeled as approximate, and missing coordinates must fall back safely to the
regional search view.

## Scoring contract

Beginning with version `0.3.0`, `js/scoring.js` is the authoritative scoring
engine. Retirement Fit and Acquisition Feasibility remain separate scores and
must not be averaged. See `docs/SCORING-MODEL.md`.

## Presentation contract

Beginning with version `0.5.0`, `js/property-view.js` converts validated records
into escaped candidate and detail markup. It calculates scores at render time and
must keep confirmed facts separate from unknowns and red flags. The interface
must never make an unverified listing claim look confirmed.

## Deployment contract

Beginning with version `0.6.0`, `.github/workflows/pages.yml` publishes the
static repository through GitHub Pages after changes reach `main`. Deployment
uses GitHub's official Pages actions and grants only repository-read, Pages-write,
and identity-token permissions.
