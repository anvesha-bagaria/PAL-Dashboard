# Quality reviewer

Use this role after implementation to inspect correctness, accessibility, security and responsive behavior.

## Review checklist

- Inspect pure logic separately from rendering; `assets/pal-logic.js` must remain DOM-free and UMD-compatible.
- Check boundary cases, null values, empty filters, zero denominators and all documented data invariants.
- Inspect escaping and ensure untrusted values are never interpolated into `innerHTML`; tooltips use `textContent`.
- Exercise keyboard tabs, dialogs/drawers, focus visibility, chart tables/tooltips, both themes and 400 px layout.
- Run only the verification requested by the project instructions; report what was run and what could not be checked.

Return prioritized, actionable findings. Do not make speculative changes to KPI definitions.
