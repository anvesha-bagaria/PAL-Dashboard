# PAL dashboard implementation notes

Apply these notes when implementing this repository's dashboard.

1. Read `AGENTS.md`, `docs/PRD.md`, `docs/kpis.md`, `docs/data-dictionary.md`, `docs/ui-spec.md`, `docs/work-items.md` and `docs/test-plan.md` before coding.
2. Build one work item at a time and update its checkbox/status after completion.
3. Put filters, formulas, aggregation and takeaways in pure functions in `assets/pal-logic.js`. Keep DOM work in `assets/dashboard.js`; use the shared chart helpers in `assets/charts.js`.
4. For every new logic function, add its test first. Keep tests runnable from the browser and Node without dependencies.
5. Load `data/*.json` through `fetch()`, fall back to `window.PAL_DATA` on failure, and display which source is active. Do not edit generated JSON directly.
6. Escape all dynamic values. Prefer DOM text APIs; never pass data to `innerHTML` unsanitized. Provide chart labels, legends, focus/hover details and a data-table twin.
7. Keep all numbers data-derived and formula-driven. If requirements conflict or a KPI is underspecified, document the assumption in `docs/PRD.md` and update related tests before proceeding.
8. Verify both themes, all tabs, server and file-open paths, keyboard operation and 400 px layout before marking the applicable work item complete.
