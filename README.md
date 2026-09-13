# No More Asshole Neighbors

A web-based decision-support dashboard for evaluating affordable rural retirement
properties for Chris and Becky.

This is not a real-estate listing service. It answers one practical question:

> Could we happily retire here?

## Project priorities

- Privacy over luxury
- Freedom over square footage
- Affordability over appearances
- Existing utilities over fancy finishes
- Trees over visible neighbors
- Land, infrastructure, and RV camouflage over a livable house
- A workable buy-prep-move-sell transaction over a conventional closing

## Required property criteria

- Minimum 2 acres
- Existing usable power, water, and septic
- No HOA
- Rural or semi-rural setting
- Legal path to occupy Grace while a house provides address and visual cover
- High-and-dry, usefully shaped land with room for the fleet and outbuildings
- No active condemnation or demolition order
- Monthly housing cost compatible with an approximately $3,000 household
  retirement income

## Technology

- HTML, CSS, and JavaScript
- Leaflet
- JSON property database
- GitHub Pages

## Current status

Version `0.12.0` renders researched candidates directly from the JSON database,
including independent scores, confirmed facts, unknowns, red flags, direct
listing links, a persistent Leaflet map, the move sequence, and explicit fit and
rejection criteria. The live Match count is intentionally allowed to be zero.
Filtering remains intentionally deferred.

## Live dashboard

The project publishes from `main` at:

https://not-osha-approved.github.io/No-More-Asshole-Neighbors/

## Local preview

Because the dashboard loads JSON with `fetch`, serve the repository through a
local web server instead of opening `index.html` directly:

```text
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Validation

Run:

```text
npm test
```

The validation script uses only Node.js built-in modules and installs no
dependencies.

## License

MIT
