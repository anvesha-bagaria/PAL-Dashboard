# Work items — PAL Insights Dashboard

Statuses: **Done** = present and reviewed; **In progress** = underway; **Not started** = pending. Update a status and note evidence when finishing each item.

## Delivery sequence

| Epic | Milestone | Outcome | Status |
|---|---|---|---|
| E1 | M1 | Data loading, shared dashboard shell, filters, KPI strip and theme | Done; Chrome smoke covered JSON and bundled-data paths |
| E2 | M1 | Pure PAL logic and tests | Done; Node and browser suites each pass 48 cases |
| E3 | M2 | Overview section | Done; included in seven-section Chrome smoke |
| E4 | M2 | Schools section | Done; included in seven-section Chrome smoke |
| E5 | M2 | Students table and learner detail dialog | Done; included in seven-section Chrome smoke |
| E6 | M3 | Chapters, heatmap, weakest concepts and prerequisite graph | Done; included in seven-section Chrome smoke |
| E7 | M3 | Challenge and diagnostic section | Done; included in seven-section Chrome smoke |
| E8 | M4 | AI content pipeline section | Done; included in seven-section Chrome smoke |
| E9 | M4 | Platform health section | Done; 422 metrics and weekly recovery chart included |
| E10 | M5 | Integrity, browser, accessibility and responsive verification | Done for recorded checks: Node/browser suites 48/0, Chrome file/HTTP smoke, all sections in light/dark at 400 px, zero console errors |
| E11 | M5 | Documentation and submission materials | Partial; project docs are updated, owner timing and submission destination are pending |

## E1 — Foundation: shell and data (M1)

- [x] **WI-1.1** Build `index.html` landing page with clear entry to the dashboard and synthetic-data disclaimer. (PRD: goals §3, NFR-02, NFR-05)
- [x] **WI-1.2** Complete `dashboard.html` shell: topbar, desktop sidebar that collapses to horizontal navigation, global filters, 8 KPI slots, seven ARIA tabs, active panel and footer metadata. (PRD: FR-01, FR-02, FR-12–FR-14; UI §1)
- [x] **WI-1.3** Add `assets/app.css` with Geneo tokens, intentional light and dark themes, focus styles and responsive layout through 400 px. (PRD: FR-11, US-17, NFR-03–04; UI §4–5)
- [x] **WI-1.4** Add data loader in `assets/dashboard.js`: fetch all required `data/*.json`; on failure use `window.PAL_DATA`; display active source; tolerate storage failures. (PRD: FR-13, NFR-05; AGENTS.md data rules)
- [x] **WI-1.5** Implement filter state (school/class/subject/window), reset, deep links and keyboard tab movement; render only active tab. (PRD: FR-01, FR-12; UI §1)

**Acceptance:** server and `file://` paths show synthetic data and source; filters synchronize across views; tab hashes and ARIA selection stay in sync; theme toggle persists when storage is available and remains usable when it is not; shell fits 400 px without page-level horizontal scrolling.

## E2 — Pure logic and shared chart helpers (M1)

- [x] **WI-2.1** Write logic tests first, then complete `assets/pal-logic.js` as DOM-free UMD (`window.PALLogic` and `module.exports`). (PRD: FR-02, NFR-06; AGENTS.md)
- [x] **WI-2.2** Implement filtering, KPI calculations, status bands, aggregates, sorting and takeaway generation exactly as `docs/kpis.md` specifies. (PRD: FR-01–FR-02, US-03, NFR-06)
- [x] **WI-2.3** Add `assets/charts.js` reusable SVG/HTML chart helpers for bars, stacked bars, histogram, line, heatmap and graph, plus accessible tooltip and data-table patterns. (PRD: FR-10, NFR-03; UI §2)

**Acceptance:** logic has no DOM dependency; browser and Node load the same exported API; null/zero/empty inputs follow KPI display rules; tests cover formulas and boundaries before implementation; chart labels, legends, focus/hover tips and “Show data” twins are available.

## E3 — Overview (M2)

- [x] **WI-3.1** Render filtered headline KPIs, status mix, mastery histogram, answers by activity, daily activity with 7-day average, mastery by subject/class. (PRD: FR-02–FR-03; US-02–US-03; KPI §1–2)
- [x] **WI-3.2** Generate 5–6 evidence-based takeaways with links to relevant tabs, including support, chapter/concept comparisons, school gap, ready learners and inactivity. (PRD: FR-03; US-03; UI §3.1)

**Acceptance:** all values derive from JSON and defined formulas; filters update every affected panel; empty scopes have an explanatory empty state.

## E4 — Schools (M2)

- [x] **WI-4.1** Build sortable school comparison table and ranked average-mastery/active-7-day bars. (PRD: FR-04; US-04; KPI §3)
- [x] **WI-4.2** Make View/select apply the global school filter and navigate to Overview; show S106 with dashes and its no-learners message, excluding it from ranked bars. (PRD: FR-04; US-04, US-18; UI §3.2)

**Acceptance:** school ratios use the documented denominators; zero-learner school never renders NaN or a misleading zero ratio.

## E5 — Students and detail drawer (M2)

- [x] **WI-5.1** Add search, status/inactive chips with counts, four sort choices, result count, 100-row paging and student table. (PRD: FR-05; US-05; KPI §4)
- [x] **WI-5.2** Add keyboard-accessible detail drawer with summary, risk reasons, Focus next, Ready for a challenge and full concept table; close by button/Esc/outside click and return focus. (PRD: FR-05; US-05–US-06; UI §3.3)

**Acceptance:** all risk, status, focus and readiness rules match `kpis.md`; null activity is “never”; data is escaped; no action writes data.

## E6 — Chapters and concepts (M3)

- [x] **WI-6.1** Build chapter-by-school/section heatmap with All column, printed values and student/weak counts. (PRD: FR-06; US-07; KPI §5)
- [x] **WI-6.2** Add top-12 weakest concepts table and chapter selector/prerequisite graph including greyed external prerequisites. (PRD: FR-06; US-08–US-09; KPI §5)

**Acceptance:** averages exclude null mastery; empty cells are explicit; graph arrows and labels remain legible and graph scrolls only in its own container.

## E7 — Challenge and diagnostic (M3)

- [x] **WI-7.1** Render started→ready→tried→passed funnel, conversions, pass rate by tier, tries-to-pass and stuck-after-3-tries. (PRD: FR-07; US-10; KPI §6)
- [x] **WI-7.2** Add ready-now concepts and school diagnostic completion/outcomes, weighted questions/minutes and stop reasons. (PRD: FR-07; US-11; KPI §6)

**Acceptance:** ready includes passed rows as documented; all rates use specified denominators and render “—” when undefined.

## E8 — AI content pipeline (M4)

- [x] **WI-8.1** Add book stage matrix, full/attention totals and pipeline aggregate KPIs. (PRD: FR-08; US-12; KPI §7)
- [x] **WI-8.2** Add question bank composition, verification, difficulty/chapter counts, generator funnel/failures/provider mix and LLM usage table. (PRD: FR-08; US-13; KPI §7)

**Acceptance:** failed stage errors are discoverable without hover alone; all source totals and funnel steps match the data definitions.

## E9 — Platform health (M4)

- [x] **WI-9.1** Add uptime, this-week 422 count and reduction metrics, weekly recovery series, latency/error table and threshold flags. The 422 time-series chart is intentionally omitted. (PRD: FR-09; US-14–US-15; KPI §8)
- [x] **WI-9.2** Add school-sync coverage/status table, including S106 waiting-for-first-learner state. (PRD: FR-09; US-16; KPI §8)

**Acceptance:** latest-week 422 count and first-to-last reduction use the documented values; weekly recovery series is shown by type; slow/error flags use strict documented thresholds; sync pending and coverage are shown clearly. A weekly 422 chart is not required.

## E10 — Quality and review (M5)

- [x] **WI-10.1** Complete browser test runner, Node test runner, logic and data integrity tests (at least 40 assertions/cases). (PRD: NFR-06; success metric §9)
- [x] **WI-10.2** Smoke every tab in both themes with zero console errors; verify `file://` fallback and HTTP-served loading. (PRD: FR-13; NFR-05; AGENTS.md DoD)
- [x] **WI-10.3** Review escaping, keyboard operation, contrast, reduced motion, chart alternatives and 400 px layout; fix findings. (PRD: NFR-02–NFR-04, NFR-07; UI §5)

**Acceptance:** `node tests/run-node.js` exits 0; browser runner is green; evidence and remaining limitations are recorded.

## E11 — Documentation and submission (M5)

- [x] **WI-11.1** Update README and relevant docs with run instructions, architecture and decisions; keep work-item statuses current. (PRD: NFR-06; AGENTS.md)
- [ ] **WI-11.2** Prepare `docs/ai-usage-and-submission.md` with actual observed time inputs clearly marked, AI-use summary and submission email table; do not invent personal timing or recipient details. (PRD: success metric §9)
- [ ] **WI-11.3** Save session transcript in `SESSION-CHATS.md` when the environment makes it available; otherwise document that the user must export/paste it. (AGENTS.md session convention)

**Acceptance:** docs match delivered behavior; no synthetic data is replaced or edited by hand; submission details that require the user's real knowledge are labeled for completion.

## Decisions and assumptions

- The three defaults already stated in PRD §12 are adopted: student counts use `last_active`, the time window affects activity and active KPIs rather than membership of the student table, and empty schools remain in comparisons but not ranked bars.
- “Under 10 seconds” is treated as the success target for finding an answer, not a runtime performance threshold; NFR-01 covers render time.
- Requirement references use the IDs in PRD (`US`, `FR`, `NFR`), KPI section numbers in `kpis.md`, and section numbers in `ui-spec.md`.
- No missing product behavior is inferred beyond those defaults. Log further decisions in PRD §12 and this file when implementation exposes ambiguity.

## Review notes for this implementation checkpoint

- Recorded verification: Node suite **48 passed, 0 failed**; browser suite **48 passed, 0 failed**. Chrome smoke covered `file://` bundled data and HTTP JSON sources, all seven sections in light/dark themes at 400 px, and zero console errors.
- The smoke pass establishes page-level overflow and runtime behavior for those cases. KPI-code coverage percentage and measured render-time targets were not separately reported.
- Platform health displays latest-week 422 count and reduction as KPI tiles, plus weekly stacked recoveries; the weekly 422 chart is intentionally omitted by product decision.
- No GitHub repository was created and no push was performed. Owner-specific submission timing, destination and time-saved inputs remain open.
