# Product Requirements Document — PAL Insights Dashboard

| | |
|---|---|
| Owner | Anvesha Bagaria (PAL) |
| Status | Draft v1 for Codex review (prompt P1) |
| Related | `kpis.md`, `ui-spec.md`, `data-dictionary.md`, `work-items.md`, `test-plan.md` |
| Data | Synthetic JSON in `data/` (fictional). No database. |

## 1. Background

PAL (Personalized Adaptive Learning) is Geneo's adaptive-practice engine. It scores every answer, tracks a mastery estimate and a Mastery Score per learner and concept, offers a challenge at 0.80, runs diagnostics, recommends questions, and fills question gaps with an AI generator. Behind it an AI pipeline turns textbook PDFs into a concept graph and tags questions and videos.

Today the information is spread across a school dashboard (one table plus a few charts), database queries, logs and scripts. Stakeholders cannot see, in one place, how learners are doing, which schools need attention, whether the content pipeline is healthy, or whether the platform is reliable.

## 2. Problem statement

*Principals, teachers, the PAL team and content operations need one dashboard that answers "who needs help, where is content weak, and is the system healthy?" without writing queries or reading tables of hundreds of rows.*

## 3. Goals and non-goals

**Goals**
1. A single dashboard with seven sections navigated from a sidebar: Overview, Schools, Students, Chapters and concepts, Challenge and diagnostic, AI content pipeline, Platform health.
2. Every KPI defined once (`kpis.md`) and computed from JSON only.
3. Answers in under 10 seconds for the questions in section 5 (user stories).
4. Works offline from a static folder: no server, database or login needed for the demo.
5. Light and dark themes, usable on a phone, keyboard accessible.

**Non-goals**
- Real data, authentication, role-based access, or any write action.
- Replacing the production school dashboard (this dashboard is a demonstrator on synthetic data).
- Forecasting or predictive models.
- Editing PAL settings or triggering pipeline runs.

## 4. Personas

| Persona | Needs | Main tabs |
|---|---|---|
| **Principal** (school leader) | Is my school doing better or worse than others? Which classes or sections lag? | Overview, Schools |
| **Teacher** | Which students need support today? Which concepts should I re-teach? Who is ready for a challenge? | Students, Chapters and concepts, Challenge |
| **PAL product owner** | Are learners progressing? Do challenges and diagnostics work as intended? | Overview, Challenge and diagnostic |
| **Content operations** | Are books processed? How big is the question bank? Is the AI generator reliable? | AI content pipeline |
| **Engineer / support** | Did the platform recover from stale requests? What are the latencies and error rates? Are schools synced? | Platform health |

## 5. User stories

| ID | As a… | I want… | So that… | Priority |
|---|---|---|---|---|
| US-01 | Principal | to filter every view by school, class, subject and time window | I focus on my own scope | Must |
| US-02 | Any user | headline KPIs stay visible before the active section content, with navigation in the sidebar | I get the picture before reading detail | Must |
| US-03 | Principal | auto-written takeaways ("11 students need support, starting with…") | I do not interpret charts myself | Must |
| US-04 | Principal | to compare schools on mastery, activity, accuracy and challenge pass rate | I see who is ahead or behind | Must |
| US-05 | Teacher | a searchable, sortable student list with status and risk reasons | I find who needs help first | Must |
| US-06 | Teacher | a student drawer with "focus next" and "ready for a challenge" | I plan one-to-one support | Should |
| US-07 | Teacher | a chapter × section/school heatmap | I see where a whole class struggles | Must |
| US-08 | Teacher | the weakest concepts ranked by number of weak students | I decide what to re-teach | Must |
| US-09 | Teacher | the concept prerequisite graph coloured by mastery | I understand why students are stuck | Should |
| US-10 | PAL owner | a challenge funnel (started → ready → tried → passed) and tries-to-pass | I tune challenge rules | Must |
| US-11 | PAL owner | diagnostic completion and classification results per school | I see whether placement is working | Should |
| US-12 | Content ops | a book × pipeline-stage matrix with failures visible | I fix stuck books fast | Must |
| US-13 | Content ops | question-bank composition and the AI generator funnel with failure reasons | I judge generator quality | Must |
| US-14 | Engineer | this week's 422-error count and reduction, alongside weekly recovery counts | I confirm fixes worked | Should |
| US-15 | Engineer | latency and error rate per API group | I spot slow endpoints | Should |
| US-16 | Engineer | school sync status (Geneo students vs linked, pending, last run) | I know which schools need re-sync | Must |
| US-17 | Any user | a light/dark theme toggle and a phone-friendly layout | I use it anywhere | Should |
| US-18 | Any user | clear empty states (e.g. a school with no learners yet) | The page never looks broken | Must |

## 6. Functional requirements

| ID | Requirement | Stories |
|---|---|---|
| FR-01 | Global filters: school, class, subject, time window (7 / 14 / 30 / 60 days). All tabs respect them where the data allows | US-01 |
| FR-02 | KPI strip with the 8 KPIs from `kpis.md` §1, updating with filters | US-02 |
| FR-03 | Overview tab: takeaways, learner-concept status bar, Mastery Score histogram, answers by activity, daily activity line with 7-day average, mastery by subject and class | US-03 |
| FR-04 | Schools tab: comparison table (sortable) and ranked bars; clicking a school sets the global school filter | US-04 |
| FR-05 | Students tab: search, status filter chips, sort, risk reasons, "show more", student drawer | US-05, US-06 |
| FR-06 | Chapters tab: heatmap, weakest-concepts table, prerequisite graph for a selected chapter | US-07–US-09 |
| FR-07 | Challenge and diagnostic tab: funnel, pass rate by concept tier, tries-to-pass, ready-now list, diagnostic outcomes per school | US-10, US-11 |
| FR-08 | AI content pipeline tab: stage matrix, pipeline KPIs, question bank, generator funnel and failure reasons, LLM usage table | US-12, US-13 |
| FR-09 | Platform health section: this week's 422 count and reduction, weekly recoveries by type, latency/error table, school sync table | US-14–US-16 |
| FR-10 | Every chart has a legend (2+ series), a hover/focus tooltip and a "Show data" table | all |
| FR-11 | Light and dark themes with manual toggle (remembered in `localStorage`, failure-tolerant) | US-17 |
| FR-12 | Tabs deep-linkable (`#schools`) and keyboard operable | US-17 |
| FR-13 | Data loaded from `data/*.json` via `fetch`, with fallback to `window.PAL_DATA`; the active source is shown | — |
| FR-14 | A visible "Synthetic demo data" badge and the data as-of date on every tab | — |

## 7. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | Performance: initial render and every filter change complete in under 500 ms for the full dataset (~4,300 progress rows) on a typical laptop |
| NFR-02 | No PII: all names are fictional; the repo contains no real learner, school or credential data |
| NFR-03 | Accessibility: WCAG 2.1 AA text contrast in both themes, visible focus, ARIA tabs, charts with text alternatives (tooltips plus data tables) |
| NFR-04 | Responsive: usable at 400 px width; no horizontal page scroll |
| NFR-05 | Zero runtime dependencies and no build step; works offline |
| NFR-06 | Maintainability: pure logic separated from rendering; ≥ 90% of KPI code covered by tests |
| NFR-07 | Security: all data values escaped before rendering; no `innerHTML` with unescaped data; no `eval` |

## 8. Data

Synthetic dataset (`data-dictionary.md`): 6 fictional schools (one with no learners yet), 328 students, 30 concepts across 10 chapters (Mathematics and Science), ~4,300 learner-concept rows, 60 days of daily activity, diagnostics per school, a 10-book pipeline status table, question-bank and generator statistics, and 9 weeks of health metrics. It is generated with a fixed seed so results are reproducible.

## 9. Success metrics for this assignment

| Metric | Target |
|---|---|
| All 18 user stories demonstrable in the running dashboard | 100% |
| Automated tests passing (logic + data integrity) | 100%, ≥ 40 tests |
| Console errors across all tabs and both themes | 0 |
| Time to answer "which students need support in school X?" | < 10 s |
| Time saved versus building without AI | measured and reported in `ai-usage-and-submission.md` |

## 10. Assumptions and risks

| # | Item | Mitigation |
|---|---|---|
| A1 | Thresholds (weak < 0.40, strong ≥ 0.70, challenge-ready ≥ 0.80, inactive 14 days) mirror production PAL | Defined once in `kpis.md` and in `meta.thresholds` |
| A2 | Synthetic values only resemble real patterns | Clearly labelled; not used for decisions |
| A3 | A single page with 7 tabs could become heavy | Render only the active tab; cap long lists with "show more" |
| R1 | Charts hand-built in SVG/HTML may have layout bugs | Tests for data, visual check per tab in both themes (prompt P14) |
| R2 | `fetch` blocked on `file://` | Automatic fallback to `pal-data.js`; source shown on screen |

## 11. Release plan

| Milestone | Content |
|---|---|
| M1 | Foundation: data layer, logic, theme, shell (E1, E2) |
| M2 | Core tabs: Overview, Schools, Students (E3–E5) |
| M3 | Insight tabs: Chapters, Challenge and diagnostic (E6, E7) |
| M4 | Operations tabs: AI content pipeline, Platform health (E8, E9) |
| M5 | Quality and submission: tests, review, accessibility, docs, session export (E10, E11) |

## 12. Open questions (Codex to answer in P1)

1. Should "active" use the student's `last_active` date or the daily `active_learners` series? (Default: `last_active` for student counts, `activity.json` for trends.)
2. Should the time-window filter also limit the student table? (Default: no, only activity and "active" KPIs.)
3. Is a school with no learners shown in comparisons? (Default: yes, in the table with an empty state; not in ranked bars.)

### P1 decisions recorded

#### PAL and dashboard summary

1. PAL recommends adaptive practice for each learner and concept.
2. It tracks a 0–1 Mastery Score and challenge outcomes.
3. A learner may attempt a challenge at 0.80; passing requires at least three correct answers.
4. Concepts are grouped into chapters and subjects, with prerequisite relationships.
5. Schools and teachers need to find learners and concepts needing attention.
6. Product owners need to understand challenge and diagnostic outcomes.
7. Content operations need to see textbook processing, question bank and AI generation health.
8. Engineers need error, recovery, latency and school synchronization views.
9. The dashboard has seven sidebar-navigated sections, shared filters, eight headline KPIs and light/dark themes.
10. All displayed data is synthetic JSON and every metric follows `docs/kpis.md`.

- Adopt the three defaults above: `students.last_active` drives active learner counts, the window does not remove students from the student table, and empty schools remain in the comparison table while ranked bars omit them.
- Diagnostic overall averages use each school's `completed` count as the weight, because the source contains school-level averages rather than student-level diagnostic rows.
- Navigation is a persistent sidebar on desktop and collapses to a horizontal, scrollable section nav on narrower screens. Keep the ARIA tabs interaction and deep links.
- The Platform health section retains 422 metrics (latest week and reduction from the first week) but omits the weekly 422 chart. Weekly recoveries remain visualized by type.
- The referenced work-item and test-plan documents were absent when implementation began; they were created from this PRD and the KPI/UI specifications. No KPI threshold or formula was changed.
