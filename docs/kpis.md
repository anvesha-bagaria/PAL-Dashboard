# KPI definitions

Single source of truth for every number on the dashboard. Fields refer to `data-dictionary.md`. "Rows" means the `progress.json` rows left after the active filters (school, class, subject). `as_of` is `meta.as_of`.

## Thresholds (also in `meta.thresholds`)

| Name | Value | Meaning |
|---|---|---|
| Weak | Mastery Score < 0.40 | Concept flagged weak |
| Strong | Mastery Score ≥ 0.70 | Student or concept counts as strong |
| Challenge-ready | Mastery Score ≥ 0.80 and challenge not passed | Offered the challenge |
| Almost ready | 0.65 ≤ Mastery Score < 0.80 | "Almost there" |
| Inactive | no activity for 14 days (`last_active` < `as_of` − 13 days, or null) | At-risk flag |

## Status bands

**Concept status** (one learner-concept row):

| Status | Rule |
|---|---|
| Mastered | `challenge_passed` is true |
| Weak | not mastered and `upi_score` < 0.40 |
| In progress | not mastered, `upi_score` ≥ 0.40 |
| Not started | `upi_score` is null |

**Student status** (average of the student's non-null `upi_score` values):

| Status | Rule |
|---|---|
| Needs support | average < 0.40 |
| Developing | 0.40 ≤ average < 0.70 |
| Strong | average ≥ 0.70 |
| Not started | student has no scored concept |

## 1. Headline KPIs (always visible)

| # | KPI | Formula | Format |
|---|---|---|---|
| K1 | Learners | distinct `student_id` in rows | integer |
| K2 | Active learners | distinct students whose `last_active` ≥ `as_of` − (window − 1) days | integer and % of K1 |
| K3 | Answers | Σ (`practice_attempts` + `warmup_attempts` + `challenge_attempts`) | integer |
| K4 | Accuracy | Σ correct ÷ K3, where correct = `practice_correct` + `warmup_correct` + `challenge_correct`; null when K3 = 0 | % (1 decimal) |
| K5 | Avg Mastery Score | mean of non-null `upi_score` | % (whole number) |
| K6 | Concepts mastered | count of rows with `challenge_passed` | integer |
| K7 | Challenge pass rate | rows with `challenge_passed` ÷ rows with `challenge_tries` > 0 | % |
| K8 | Needs support | students whose status is Needs support | integer and % of K1 |

## 2. Overview

| KPI | Formula |
|---|---|
| Status mix | count of rows per concept status (4 bands) and share of all rows |
| Mastery distribution | histogram of per-student average Mastery Score, 10 buckets (0–9%, …, 90–100%); value 1.0 falls in the last bucket |
| Answers by activity | Σ practice / warm-up / challenge attempts; accuracy per activity = correct ÷ attempts |
| Daily activity | per date: Σ `answers_*`, Σ `active_learners`, Σ `sessions` over selected schools; 7-day trailing average of total answers (shorter window at the start) |
| Mastery by subject / class | mean non-null `upi_score` grouped by subject / class, with learner count |

## 3. Schools

| KPI | Formula |
|---|---|
| Learners | `schools.learner_count` (cross-check: students with that `school_id`) |
| Active 7d % | students with `last_active` ≥ `as_of` − 6 days ÷ learners |
| Avg Mastery Score | as K5 within the school |
| Accuracy | as K4 within the school |
| Weak share | rows with `upi_score` < 0.40 ÷ rows with non-null `upi_score` |
| Challenge pass rate | as K7 within the school |
| Sync coverage | `sync.linked_learners` ÷ `sync.geneo_students` |

A school with 0 learners shows "—" for every ratio and the empty state; it is excluded from ranked bars.

## 4. Students

| KPI | Formula |
|---|---|
| Avg mastery | mean non-null `upi_score` for the student |
| Mastered | rows with `challenge_passed` |
| Weak | rows with `upi_score` < 0.40 |
| Concepts started | rows with non-null `upi_score` ÷ total rows for the student |
| Accuracy | as K4 for the student |
| Last active | `students.last_active`; shown as "today", "N days ago" or "never" |
| Risk reasons (any of) | avg < 0.40 · ≥ 3 weak concepts · inactive 14 days · accuracy < 40% with ≥ 20 answers · no activity ever |
| Focus next | up to 4 not-mastered concepts with `upi_score` < 0.80, weak first then lowest score |
| Ready for challenge | up to 4 concepts with `upi_score` ≥ 0.80 and not mastered, highest first |

## 5. Chapters and concepts

| KPI | Formula |
|---|---|
| Heatmap cell | mean non-null `upi_score` for (chapter, column) with the student count and weak count; columns = schools when the school filter is "all", sections when a school is selected; empty cell shows "—" |
| Chapter average | mean non-null `upi_score` per chapter, weakest first |
| Weakest concepts | per concept: weak students (rows with `upi_score` < 0.40), avg Mastery Score, answers, pass rate; ranked by weak students (top 12) |
| Concept graph | nodes = the chapter's concepts plus their direct prerequisites from other chapters (greyed); node colour = average Mastery Score band; layers by depth in the prerequisite graph |

## 6. Challenge and diagnostic

| KPI | Formula |
|---|---|
| Funnel | **Started** rows with non-null `upi_score` → **Ready** rows with `upi_score` ≥ 0.80 or passed → **Tried** rows with `challenge_tries` > 0 → **Passed** rows with `challenge_passed`; show step-to-step conversion % |
| Pass rate by tier | K7 grouped by concept `tier` (Foundational, Core, Advanced) |
| Tries to pass | counts of `tries_to_pass` = 1, 2, 3 among passed rows |
| Stuck on challenge | rows with `challenge_tries` = 3 and not passed (shown as a count and % of tried) |
| Ready now | rows with `upi_score` ≥ 0.80 and not passed, grouped by concept, top 10 |
| Diagnostic completion | `completed` ÷ `started` (per school and overall) |
| Diagnostic outcome | `concept_classes` knows / uncertain / gap as a share of their sum |
| Average questions / minutes | `avg_questions`, `avg_minutes` (students-weighted overall) |

## 7. AI content pipeline

| KPI | Formula |
|---|---|
| Books fully processed | books whose five stages are all `completed` ÷ books |
| Books needing attention | books with any stage `failed`, listed with the error |
| Pipeline totals | Σ LOs, Σ concepts, Σ prerequisite edges, Σ questions tagged, Σ content items tagged |
| Question bank size and mix | `question_bank.total`; by source (CMS bank vs AI-generated) and by difficulty |
| Verified share | `verified.verified` ÷ (`verified` + `unverified`) |
| AI share | `by_source.ai_generated` ÷ `total` |
| Generator funnel | requested → returned → passed schema → passed KaTeX → saved to CMS, with step % and overall yield = saved ÷ requested |
| Failure reasons | `generator.failures` counts and share |
| Provider mix | external / self-generated / template fallback share of returned questions (`providers` sums to `returned`) |
| LLM usage | calls, tokens (millions), p50 latency per stage |

## 8. Platform health

| KPI | Formula |
|---|---|
| 422 errors per week | `health.http_422` series; reduction % = (first − last) ÷ first |
| Release marker | `release_markers[].week_index` drawn on the 422 chart |
| Recoveries | `recoveries.*` per week, stacked; total this week = sum of last values |
| Latency | `p50_ms`, `p95_ms` per API group; flag p95 > 1,000 ms |
| Error rate | `error_pct` per group; flag > 0.8% |
| Uptime | `uptime_pct` |
| School sync | per school: Geneo students, linked, pending to link, coverage %, last sync, status chip |

## Rounding and display rules

- Percentages: whole numbers, except accuracy and ratios under 10% (one decimal).
- Mastery Score shown as a percentage (0.62 → 62%).
- Null or undefined values show "—", never 0 or NaN.
- Dates are shown as "17 Aug"; as-of date in the header as "15 Oct 2026".
