# Test plan — PAL Insights Dashboard

Tests are split between pure logic (Node and browser), data integrity, and browser smoke/accessibility checks. Keep fixtures synthetic. Write each logic test before adding the function it covers. Every displayed number must be traceable to `docs/kpis.md`.

## Test inventory

| ID | Type | Cases | Requirements |
|---|---|---|---|
| TP-01 | Logic | School/class/subject filters compose; “all” retains rows; empty selection returns empty | FR-01, US-01 |
| TP-02 | Logic | Window filter boundaries include exactly `as_of - (window - 1)`; null last_active is inactive; membership unaffected by window | FR-01; KPI §1–4; PRD §12 |
| TP-03 | Logic | K1 distinct learners; K2 active learners and share | FR-02; KPI §1 |
| TP-04 | Logic | K3 attempts, K4 correct/attempts, null when zero attempts; correct never exceeds denominator for valid fixture | FR-02; KPI §1 |
| TP-05 | Logic | K5 excludes null scores; K6 passed rows; K7 attempted denominator; K8 support count/share | FR-02; KPI §1 |
| TP-06 | Logic | Concept status precedence: passed, weak, in-progress, not-started; student status boundaries 0.40/0.70 | KPI thresholds/statuses |
| TP-07 | Logic | Histogram has 10 buckets; 0 and 1.0 land in first/last; per-student mean excludes null | KPI §2 |
| TP-08 | Logic | Activity by date and trailing average use shorter initial window and selected schools | KPI §2 |
| TP-09 | Logic | School metrics, active-7d boundary, weak denominator; zero learner ratios null and omitted from ranking | KPI §3; US-04 |
| TP-10 | Logic | Student mastery, mastered/weak/started, accuracy, last-active labels and all risk-reason boundaries | KPI §4; US-05 |
| TP-11 | Logic | Focus next ranks weak then lowest, max four; ready concepts highest first, max four | KPI §4; US-06 |
| TP-12 | Logic | Heatmap grouping, null exclusion, weak count, section-vs-school columns | KPI §5; US-07 |
| TP-13 | Logic | Weakest concepts order/count and prerequisite graph includes direct external prerequisites | KPI §5; US-08–09 |
| TP-14 | Logic | Challenge funnel membership and step conversions; passed row can be ready; stuck count/share | KPI §6; US-10 |
| TP-15 | Logic | Tier pass rates and tries-to-pass buckets 1–3 | KPI §6; US-10 |
| TP-16 | Logic | Diagnostic completion, weighted averages, outcome shares, stop reasons | KPI §6; US-11 |
| TP-17 | Logic | Pipeline fully processed/attention, stage totals and errors | KPI §7; US-12 |
| TP-18 | Logic | Question-bank source/difficulty/verified sums; generator funnel, failure and provider shares | KPI §7; US-13 |
| TP-19 | Logic | Latest-week 422 count and first-to-last reduction, weekly recovery totals, latency/error threshold comparisons; no 422 chart is required | KPI §8; US-14–16 |
| TP-20 | Logic | Formatting: percentages, mastery, dates; null/undefined never display as 0/NaN | KPI display rules |
| TP-21 | Data integrity | Referential integrity across schools, students, progress, curriculum, activity, diagnostics, pipeline and health | NFR-02; data dictionary |
| TP-22 | Data integrity | Scores in range; correct ≤ attempts; challenge invariants; activity totals equal progress totals per school | Data dictionary invariants |
| TP-23 | Data integrity | Pipeline composition totals, generator provider total and diagnostic stop-reason totals reconcile | Data dictionary invariants |
| TP-24 | Browser smoke | Load all seven sidebar sections, switch sections and filters, no uncaught console errors | FR-01–FR-10; success metric |
| TP-25 | Browser smoke | HTTP fetch succeeds; file-open failure falls back to bundled `PAL_DATA`; source label correct | FR-13; NFR-05 |
| TP-26 | Browser smoke | Light/dark manual and system themes; theme persistence failure tolerated | FR-11; US-17 |
| TP-27 | Browser/accessibility | Sidebar section arrow/Home/End navigation in desktop and narrow layouts, hash deep link, visible focus, drawer Esc/close/focus return | FR-12; NFR-03 |
| TP-28 | Browser/accessibility | Chart accessible summary, tooltip hover and focus, data table twin, legend for multi-series | FR-10; NFR-03 |
| TP-29 | Browser/security | Render hostile HTML-like synthetic string as text; verify no unsafe data interpolation or `eval` | NFR-07 |
| TP-30 | Responsive | At 400 px no document horizontal overflow; tables and concept graph scroll only internally | NFR-04; UI §4 |
| TP-31 | Browser | Empty filters and S106 display explanatory empty states without broken chart output | US-18; data edge cases |
| TP-32 | Performance | Initial render and representative filter change each under 500 ms on stated test machine | NFR-01 |
| TP-33 | Responsive/navigation | Sidebar is persistent at desktop widths and becomes a horizontally scrollable section nav at ≤800 px; no page-level overflow at 400 px | FR-12; NFR-04; UI §1, §4 |

## Execution and evidence

1. Run `node tests/run-node.js` for UMD logic and data integrity tests.
2. Open `tests/test-runner.html` in a browser for the same logic suite and report pass/fail counts.
3. Serve the folder with `python3 -m http.server`; inspect each tab and both themes, then open `dashboard.html` directly to exercise the bundled-data fallback.
4. Use browser devtools to inspect console errors, focus behavior, accessible names, 400 px overflow, and representative render/filter timings.
5. Record only observed results (browser/version, viewport, theme, source mode and duration) in the implementation report or session notes. Do not claim a visual or accessibility check that was not actually performed.

## Coverage target

The PRD target is at least 40 passing automated cases and at least 90% coverage of KPI logic. Keep deterministic table-driven boundary cases for each KPI. If no coverage tool is available without adding dependencies, report the KPI cases covered by the suite instead of adding a build dependency.

## Current execution record

- Recorded results: Node suite **48 passed, 0 failed**; browser suite **48 passed, 0 failed**.
- Chrome smoke covered `file://` bundled data and HTTP JSON loading, all seven sidebar sections in light and dark themes at 400 px, and zero console errors.
- Render-time targets and the PRD's ≥90% KPI-code coverage percentage were not separately measured. Do not infer those results from the passing case counts.
- The test inventory remains a plan, not a claim that every TP-01–TP-33 case is automated. The Chrome checks are smoke evidence, not substitutes for automated performance or coverage measurement.
