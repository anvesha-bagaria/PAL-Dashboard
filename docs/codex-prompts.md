# Staged Codex prompts

Use these as separate sessions or checkpoints so the work stays reviewable. `AGENTS.md` governs the repository. The planning pack and synthetic data are present; do not recreate or replace them.

## P1 — Understand and plan

Read `AGENTS.md`, `docs/PRD.md`, `docs/kpis.md`, `docs/ui-spec.md`, `docs/data-dictionary.md`, `docs/work-items.md`, and `docs/test-plan.md`. Summarise the domain and dashboard in 10 lines. List ambiguity and record assumptions in PRD Open questions. Inspect existing code and data without changing generated JSON.

## P2 — Foundation and pure logic

Review the static HTML/CSS/JS shell, fetch plus bundled fallback, filters, theme, tabs, pure UMD logic and chart helpers. Work through E1–E2. Write logic tests before changing formulas. Keep `pal-logic.js` DOM-free and run `node tests/run-node.js`.

## P3 — Overview

Complete E3 against `docs/ui-spec.md` and KPI sections 1–2: headline KPIs, takeaways, status mix, histogram, activity and grouped mastery. Provide accessible labels and a data-table twin. Test empty filters and window boundaries.

## P4 — Schools and students

Complete E4–E5. Check zero-learner school behavior, search/filter/sort/paging, risk reasons, keyboard detail dialog and focus handling. Test each formula against `docs/kpis.md`.

## P5 — Chapters and challenge

Complete E6–E7: chapter heatmap, weakest concepts, prerequisite graph, challenge funnel, tiers, ready concepts and diagnostic outcomes. Preserve specified denominators and null behavior.

## P6 — Operations views

Complete E8–E9: book pipeline, question bank and generator, LLM use, platform errors/recoveries/latency and school sync. Confirm source totals against JSON.

## P7 — Quality and handoff

Complete E10–E11. Run Node and browser suites, inspect all seven tabs in light and dark themes, open the file fallback, verify 400 px layout and console, review escaping and keyboard access, and update work-item status with evidence. Do not invent performance, time-saved, recipient or deadline-confirmation data. If transcript export is unavailable, say so and leave a clear user action.
