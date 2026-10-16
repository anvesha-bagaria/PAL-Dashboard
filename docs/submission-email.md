# Submission email (draft; nothing has been sent)

**To:** `<RECIPIENT EMAIL — OWNER TO FILL>`
**Subject:** AI-Assisted SDLC Assignment: PAL Insights Dashboard (`<SENDER NAME>`)

---

Hi `<RECIPIENT NAME>`,

Please find my AI-assisted SDLC assignment submission below. [Optional: I am submitting on 16 October, after the 15 October date in the brief. Please let me know if that is fine.]

| Field | Your entry |
|---|---|
| Name | `<SENDER NAME — OWNER TO FILL>` |
| Project name | PAL (Personalized Adaptive Learning) microservice |
| Dashboard name | PAL Insights Dashboard |
| Final dashboard requirements | See the list below |
| Repository link | `https://github.com/anvesha-bagaria/PAL-Dashboard` |
| Session log link | `https://github.com/anvesha-bagaria/PAL-Dashboard/blob/main/SESSION-CHATS.md` |
| Estimated time without AI | `<OWNER INPUT — NO BASELINE MEASURED>` |
| Actual time taken with AI | `<ADD YOUR ACTUAL HOURS>` |
| Time saved | `<ESTIMATED − ACTUAL>` hours (`<percent>`%) |

**Final dashboard requirements**

A static dashboard (HTML, CSS and JavaScript only; no backend or database) that reads synthetic JSON data for PAL and answers who needs help, where content is weak, and whether the system is healthy. It has:

1. **Global filters:** school, class, subject and time window (7, 14, 30 or 60 days), with a reset.
2. **Headline KPIs, always visible:** learners, active learners, answers, accuracy, average Mastery Score, concepts mastered, challenge pass rate, learners needing support.
3. **Seven sidebar-navigated sections:**
   - **Overview:** auto-written takeaways, learner-concept status mix, Mastery Score distribution, answers by activity, daily activity trend with a 7-day average, mastery by subject and class.
   - **Schools:** sortable school comparison, ranked bars, and a drill-down that sets the school filter.
   - **Students:** searchable and sortable roster with status filters, risk reasons, and a student detail with "focus next" and "ready for a challenge".
   - **Chapters and concepts:** chapter by school/section heatmap, weakest concepts, and a prerequisite graph.
   - **Challenge and diagnostic:** challenge funnel, pass rate by concept tier, tries to pass, the learners stuck after three tries, and diagnostic outcomes per school.
   - **AI content pipeline:** book-by-stage processing matrix, question bank mix, AI question generator funnel and failure reasons, LLM usage.
   - **Platform health:** this week's 422-error count and reduction, weekly recoveries by type, latency and error rate, school sync status. There is no weekly 422 chart.
4. **Quality requirements:** light and dark themes, a layout that works on a phone, keyboard-accessible tabs, a tooltip and a "Show data" table for every chart, and clear empty states (for example a school with no learners yet).
5. **Data:** fictional only: 6 schools, 328 students, 30 concepts, 60 days of activity. Every KPI has a written formula (`docs/kpis.md`) and a matching test.

**Repository contents:** `.codex` folder (agents and skills), concise session log (`SESSION-CHATS.md`), PRD (`docs/PRD.md`), work items (`docs/work-items.md`), source code (`dashboard.html`, `assets/`), and test cases and tests (`docs/test-plan.md`, `tests/`).

Regards,
`<SENDER NAME — OWNER TO FILL>`
