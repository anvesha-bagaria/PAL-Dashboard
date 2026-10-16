# AGENTS.md — instructions for Codex

You are helping build the **PAL Insights Dashboard** in this repository. Read this file first, then the documents listed under "Read before coding".

## What PAL is (one paragraph)

PAL (Personalized Adaptive Learning) decides what each learner practises next. For every learner and concept it tracks a mastery estimate and a **Mastery Score** (0–1, shown to learners). At **0.80** a learner may take a **challenge** (2–5 questions; pass = at least 3 correct). Concepts belong to chapters; schools see their students' progress on a dashboard. Behind it, an **AI content pipeline** turns textbooks into a concept graph and tags questions, and an AI generator tops up questions. This dashboard is for school leaders, teachers, the PAL team and content ops.

## Scope — hard rules

1. **Static pages only:** HTML, CSS and plain JavaScript. **No framework, no build step, no backend, no database, no npm dependencies.**
2. **Data from JSON only:** read `data/*.json` with `fetch()`. If `fetch()` fails (page opened by double-click, `file://`), fall back to `window.PAL_DATA` from `data/pal-data.js`. Show which source is in use.
3. **Synthetic data only.** Never add real names, emails, school data or credentials. The data is fictional; keep it that way.
4. **No external network calls** except Google Fonts (optional, with system-font fallbacks). No CDN scripts.
5. Every number on screen must come from the JSON through the formulas in `docs/kpis.md`. No hard-coded results.

## Read before coding

| File | Why |
|---|---|
| `docs/PRD.md` | What and why |
| `docs/kpis.md` | Exact KPI formulas and thresholds |
| `docs/data-dictionary.md` | JSON fields and invariants |
| `docs/ui-spec.md` | Layout, charts, interactions, tokens |
| `docs/work-items.md` | What to build, in what order, with acceptance criteria |
| `docs/test-plan.md` | Test cases to implement |
| `.codex/agents/*.md`, `.codex/skills/*/SKILL.md` | Roles and domain notes to follow |

## Target file layout

```
index.html              landing page
dashboard.html          the dashboard (shell + 7 tabs)
assets/app.css          tokens, layout, components, light + dark themes
assets/pal-logic.js     pure functions (no DOM): filters, KPIs, aggregation, takeaways
assets/charts.js        chart helpers (SVG / HTML): bars, stack, histogram, line, heatmap, graph
assets/dashboard.js     state, data loading, tabs, rendering, events
tests/test-runner.html  runs every test in the browser
tests/*.test.js         tests; pal-logic.js must also load under Node (UMD) for headless runs
```

`pal-logic.js` must have **no DOM access** and export through a UMD wrapper (`window.PALLogic` and `module.exports`), so the same tests run in the browser and in Node.

## Design tokens (Geneo look)

Light is the base; dark must be designed too (not a simple invert). Define every colour as a CSS variable on `:root`, then redefine under `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`, with a manual toggle.

| Token | Light | Dark |
|---|---|---|
| Page / card | `#f4f7fb` / `#ffffff` | `#0e141d` / `#151d29` |
| Ink / secondary / muted | `#1e293b` / `#475569` / `#64748b` | `#e6ebf2` / `#b4bfcd` / `#8a97a8` |
| Accent (Geneo blue) | `#007cdc` | `#4da3ff` |
| Brand navy | `#3f4d8f` | `#9aa6e6` |
| Good / in progress / weak / none (chart fills) | `#077d4d` / `#007cdc` / `#f47a7a` / `#cbd5e1` | `#1fae7a` / `#4d8ef7` / `#e5605f` / `#454b5e` |

Fonts: Poppins (headings), Lato (body), JetBrains Mono (numbers/labels), each with a system fallback.

## Conventions

- Colour is never the only carrier: every status has a label or number too.
- Chart text uses ink tokens, never the series colour. Every chart has a legend when it has 2+ series, a hover/focus tooltip (set with `textContent`, never `innerHTML` with data) and a "Show data" table twin.
- Escape every data value before putting it in HTML.
- Tabs follow the ARIA tabs pattern (arrow keys, `aria-selected`), deep-linkable with `#overview`, `#schools`, …
- Layout works at 400 px wide with no horizontal page scroll; only tables and the concept graph scroll inside their own container.
- Keep functions small; keep pure logic out of rendering code.

## Definition of done (per work item)

1. Acceptance criteria in `docs/work-items.md` met.
2. Tests written and passing (`tests/test-runner.html` shows all green; `node tests/run-node.js` exits 0).
3. No console errors on any tab, in light and dark.
4. Works from `file://` and from `python3 -m http.server`.
5. Work item status updated in `docs/work-items.md`; notable decisions noted in the session.

## How to work

- Plan small, build one work item at a time, and run the tests after each.
- Write the test first for logic in `pal-logic.js`.
- When requirements are unclear, state the assumption in the chat and in `docs/PRD.md` (Open questions) instead of guessing silently.
- Do not modify `data/*.json` by hand; change `tools/generate_data.py` and regenerate. Do not change KPI formulas without updating `docs/kpis.md` and the tests.
