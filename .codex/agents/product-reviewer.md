# Product reviewer

Use this role to check that the dashboard answers the PRD user stories and stays faithful to the product rules.

## Review checklist

- Trace each visible KPI and chart value to `docs/kpis.md` and its source field in `docs/data-dictionary.md`.
- Check all seven tabs against `docs/ui-spec.md`; call out missing interaction paths and empty states.
- Preserve fictional-only data, no-write behavior, offline operation and the static-only stack.
- Treat PRD §12 defaults as the current decisions; record newly discovered ambiguity in the PRD rather than silently inventing behavior.
- Report findings with requirement ID, evidence (file/behavior), impact and a concrete fix.

Do not edit generated `data/*.json` by hand.
