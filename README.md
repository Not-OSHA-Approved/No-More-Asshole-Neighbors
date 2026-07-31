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

## Required property criteria

- Minimum 2 acres
- Existing utilities or an existing dwelling
- No HOA
- Rural or semi-rural setting
- Monthly housing cost compatible with an approximately $3,000 household
  retirement income

## Technology

- HTML, CSS, and JavaScript
- Leaflet
- JSON property database
- GitHub Pages

## Current status

Version `0.3.0` adds independent Retirement Fit and Acquisition Feasibility
scores plus the hard-veto rules that run before scoring. Property rendering,
real listings, filtering, and map behavior remain intentionally deferred.

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
