# Property schema

Each record in `data/properties.json` follows
`data/property.schema.json`, a JSON Schema Draft 2020-12 document.

## Qualification states

### `match`

The property meets every required criterion:

- at least 2 acres
- an existing dwelling or existing utilities
- no HOA
- rural or semi-rural setting
- comfortable affordability fit

A match cannot list missed requirements, exception strengths, or rejection
reasons.

### `exception`

The property misses at least one required criterion but has an exceptional
strength that makes it worth considering. Every exception must record the
missed requirement, a plain-language reason, and at least one exceptional
strength.

An HOA cannot receive an exception.

### `rejected`

The property is not a realistic candidate. Every rejection retains at least
one reason so the same property is not researched repeatedly.

## Hard HOA rule

If `restrictions.hoa` is `present`, the schema requires:

- `qualification.status` to be `rejected`
- `missedRequirements` to contain `no-hoa`
- at least one rejection reason

Unknown HOA status may remain under investigation, but it cannot qualify as a
full match.

## Unknown information

The schema supports `unknown` and `null` where listing research is incomplete.
Research confidence and explicit unknowns distinguish missing information from
verified negative facts.

## Research discipline

Listing claims are recorded without silently promoting them to verified facts.
For example, advertised owner financing may remain `negotiable` until the down
payment, interest, amortization, balloon, prepayment, and closing terms are
confirmed. Contradictory MLS fields belong in `research.unknowns`.

## Scoring

The schema records facts, qualification decisions, and research confidence.
The independent scoring engine consumes these facts without storing calculated
scores in the database.
