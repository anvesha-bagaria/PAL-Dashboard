# PAL Insights Dashboard

A static dashboard for PAL (Personalized Adaptive Learning), built with HTML, CSS and plain JavaScript. It uses fictional data only and has no backend, database, build step or runtime dependencies.

## Run

Open `index.html`, or serve the folder with `python3 -m http.server 8000` and visit `http://localhost:8000/`. Dashboard data loads from `data/*.json`; when opened directly from disk, `data/pal-data.js` supplies the offline fallback. The footer shows the active data source.

Run the logic and data-integrity suite with `node tests/run-node.js`. Open `tests/test-runner.html` in a browser for the browser suite.

## Project files

| Path | Purpose |
|---|---|
| `AGENTS.md` | Scope, conventions and definition of done |
| `docs/PRD.md` | Product requirements and recorded decisions |
| `docs/kpis.md` | KPI formulas and thresholds |
| `docs/data-dictionary.md` | Synthetic data schema and invariants |
| `docs/ui-spec.md` | Dashboard behavior, design and accessibility |
| `docs/work-items.md` | Delivery sequence and acceptance criteria |
| `docs/test-plan.md` | Test coverage mapped to requirements |
| `docs/codex-prompts.md` | Staged prompts for future work and review |
| `docs/ai-usage-and-submission.md` | AI-use notes and submission template |
| `assets/` | Pure logic, chart helpers, renderer and themes |
| `tests/` | Browser and Node checks |
| `data/` | Fictional JSON and bundled offline copy |
| `tools/generate_data.py` | Deterministic data generator |

The dataset contains six fictional schools, 328 synthetic learners, 30 concepts and 60 days of activity. Regenerate it with `python3 tools/generate_data.py`; do not edit generated JSON files by hand.

## Status and submission

It uses a sidebar to navigate the seven dashboard sections on desktop, collapsing into a horizontal scrollable section nav on narrower screens. Platform health keeps the latest-week 422 count and reduction metrics; it does not include a weekly 422 chart. Weekly recoveries remain charted by type.

Current work-item status and verification evidence are tracked in `docs/work-items.md` and `docs/test-plan.md`. Recorded Node and browser suites each pass 48/48. Chrome smoke covered `file://` and HTTP data sources, all sections in both themes at 400 px, and zero console errors. Performance timing and KPI-code coverage percentage were not measured.

Run `node tests/run-node.js` for the Node suite. Open `tests/test-runner.html` in a browser to run the browser logic suite.

The assignment date listed in the brief is 15 October 2026. Confirm the late submission timing with the assignment recipient before submitting. Human hands-on time, a no-AI baseline, recipient details and time saved were not measured; fill them in from actual records rather than estimating.

The complete project is committed and pushed to [PAL-Dashboard](https://github.com/anvesha-bagaria/PAL-Dashboard) on `main`.
