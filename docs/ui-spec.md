# UI specification

Look and feel: Geneo. Light by default with a designed dark theme. Tokens are in `AGENTS.md`. Fonts: Poppins (headings), Lato (body), JetBrains Mono (numbers, small labels).

## 1. Page shell (`dashboard.html`)

```
┌ Topbar: brand "Geneo · PAL Insights" · theme toggle ───────────────────────────────────────────┐
├ Sidebar (desktop): Overview · Schools · Students · Chapters & concepts · Challenge & diagnostic │
│                 AI content pipeline · Platform health                                          │
│   ┌ Main: filters · 8 KPI tiles · active section panel · disclaimer/as-of/data source ────────┐ │
└───┴──────────────────────────────────────────────────────────────────────────────────────────┴─┘
```

- On desktop, section navigation stays in a left sidebar. At widths ≤800 px it becomes a horizontally scrollable bar above the content.
- Navigation uses the ARIA tabs pattern; Left/Right or Up/Down and Home/End move between sections; the hash (`#schools`) selects a section on load and updates on change.
- Only the active section is rendered; changing a filter re-renders it. Remember the last section and theme in `localStorage` inside `try/catch`.
- Each tab starts with a one-line description of the question it answers.
- Footer: disclaimer and generator name from `meta`, plus synthetic-data badge, as-of date and active data source.

## 2. Components

| Component | Behaviour |
|---|---|
| KPI tile | Label (small caps), value, optional sub-line (e.g. "% of learners"); coloured top edge by meaning (neutral / good / warn / bad) |
| Panel | White card, soft shadow, title, optional hint text and "Show data" |
| Horizontal bars | Label, track, value text; one hue; tooltips with exact value and denominator; rounded 4 px bar ends; max bar thickness 24 px |
| Stacked bar (100%) | 2 px gaps, rounded outer ends, legend with count and share; segments focusable |
| Histogram | 10 columns, y gridlines with ticks, count above the tallest bar; zone colours by band (weak / in progress / good) |
| Line chart | SVG, responsive via `viewBox`, 4 gridlines, x ticks about every 10 days, daily line plus thicker 7-day average, hover crosshair and tooltip, end-point dot, legend |
| Heatmap | Table with sticky first column; colour ramp white → accent by value; the number is always printed in the cell; dashed cell for no data; light ink on dark cells |
| Concept graph | SVG, nodes in layers by prerequisite depth, curved arrows, node colour by average mastery band, label and percentage in each node; out-of-chapter prerequisites greyed; scrolls horizontally in its own container |
| Status pill | Dot + label (never colour alone) |
| Chips | Filter chips (Students tab) with counts; pressed state uses accent |
| Segmented control | Sorting; `aria-pressed` |
| Table | Sticky header, right-aligned numbers in mono, sortable headers where stated, hover row, keyboard focus |
| Drawer / dialog | Student detail; closes with Esc, the close button or a click outside; returns focus to the row |
| Tooltip | One shared element, filled with `textContent`, shown on hover and keyboard focus, never covers the cursor |
| Empty state | Icon-free message plus the reason ("No learners linked yet. The next sync will pick them up.") |

Chart colours come from the four status tokens (good / in progress / weak / none). Never colour text with a series colour. Marks have visible values or tooltips; every chart has a "Show data" `<details>` table.

## 3. Tabs

### 3.1 Overview — "How are learners doing right now?"
1. **Key takeaways** (5–6 sentences, auto-generated, each with a link to the relevant tab):
   students needing support (names of the 3 lowest), weakest and strongest chapter, concept weak for the most students, school gap, challenge-ready count, inactive students.
2. Three panels in a row: **Where learner-concept pairs stand** (stacked bar + legend), **Mastery distribution** (histogram, zone key, median), **Answers by activity** (practice / warm-up / challenge bars with accuracy).
3. **Daily activity** line chart (answers per day and 7-day average) with a caption "N answers in the last W days, peak on …".
4. Two panels: **Mastery by subject** and **Mastery by class** (horizontal bars).

### 3.2 Schools — "Which schools are ahead or behind?"
1. Comparison table (sortable by any column): school, city, learners, active 7d %, avg Mastery Score, accuracy, weak share, challenge pass rate, sync coverage, "View" button. A school with 0 learners shows "—" and the text "No learners linked yet".
2. Two ranked bar panels: **Average Mastery Score by school** and **Active in last 7 days (%)**. The selected school is highlighted; schools with no learners are omitted.
3. Selecting "View" sets the global school filter and moves to the Overview tab.

### 3.3 Students — "Who needs help first?"
1. Toolbar: search by name, filter chips (All, Needs support, Developing, Strong, Not started, Inactive 14 days) with counts, sort segmented control (Needs support first, Top performers, A–Z, Last active), result count.
2. Table: student, school (only when "all schools"), class · section, status pill, average mastery bar, mastered, weak, started (e.g. 9/12), accuracy, answers, last active, risk tags. Shows 100 rows with "Show 100 more".
3. Row click (or Enter) opens the **student drawer**: summary stats, **Focus next**, **Ready for a challenge**, and the full concept table sorted weakest first with status.

### 3.4 Chapters and concepts — "What should be re-taught?"
1. **Heatmap**: chapters (weakest first) × schools (or × sections when a school is selected), plus an "All" column.
2. **Weakest concepts** table (top 12): concept, chapter, weak students, avg Mastery Score, answers, pass rate, mini bar.
3. **Prerequisite graph** with a chapter selector (default: the weakest chapter) and a legend for the colour bands.

### 3.5 Challenge and diagnostic — "Are challenges and placement working?"
1. **Challenge funnel** (4 bars with step conversion %): started → ready → tried → passed.
2. **Pass rate by concept tier** and **Tries to pass** (1, 2, 3) plus **Stuck after 3 tries** count.
3. **Ready now**: concepts with the most challenge-ready learners (top 10) with the number of learners.
4. **Diagnostic**: tiles (completion %, avg questions, avg minutes), stacked bars per school for concept outcomes (knows / uncertain / gap), and a stop-reason split.

### 3.6 AI content pipeline — "Is content ready and is AI generation reliable?"
1. **Pipeline KPIs**: books fully processed, books needing attention, totals (LOs, concepts, prerequisite edges, questions tagged).
2. **Stage matrix**: book × S1–S5, each cell a status pill (completed, running with %, failed, pending) with the main count; failed cells show the error on hover and in a note below the table.
3. **Question bank**: composition by source, verified share, difficulty split, count by chapter.
4. **AI question generator**: funnel (requested → returned → schema → KaTeX → saved to CMS), failure reasons, provider mix.
5. **LLM usage** table (calls, tokens in millions, p50 latency) with a total row.

### 3.7 Platform health — "Is the platform reliable?"
1. Tiles: uptime, 422 errors this week, reduction since the first week, recoveries this week, slowest API group by p95.
2. **Recoveries by type per week** (stacked, with legend and data table).
3. **Latency and error rate** table by API group (p50, p95, error %), with flags for p95 > 1,000 ms and error > 0.8%.
4. **School sync** table: school, Geneo students, linked, pending, coverage %, last sync, status chip; S106 shows "Waiting for first learner".

The 422 metrics remain visible as KPI tiles. There is no weekly 422 chart in this version.

## 4. Responsive behaviour

| Width | Behaviour |
|---|---|
| ≥ 801 px | Sidebar remains at the left of the content; panel grids and tables use their available content width |
| ≤ 800 px | Sidebar becomes a horizontal scrollable nav above content; filters wrap; tables and the concept graph scroll inside their own containers |

The Chrome smoke check covered 400 px width and found no page-level horizontal overflow. It did not record a separate panel-column or KPI-column layout measurement.

## 5. Accessibility checklist

- Text contrast ≥ 4.5:1 in both themes; chart marks ≥ 3:1 where practical and always paired with a value or label.
- Visible focus ring on every interactive element; logical tab order.
- `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`.
- Charts: `role="img"` with an `aria-label` summary, plus the data table.
- Respect `prefers-reduced-motion` (no animation beyond a short fade) and `prefers-color-scheme`.

## 6. Copy rules

Plain language (Mastery Score, not UPI; "Needs support", not "weak student"). Say what happens ("Show 100 more"). Empty states explain why. No emoji.
