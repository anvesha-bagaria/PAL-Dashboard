#!/usr/bin/env python3
"""Synthetic data for the PAL Insights Dashboard assignment.

All data is AI-generated and fictional: made-up schools, made-up student
names, no real learners, no database. Deterministic (fixed seed), so running
this script again produces identical files.

    python3 tools/generate_data.py

Writes data/*.json plus data/pal-data.js (all files bundled as
`window.PAL_DATA`, so a dashboard page can also work when opened by
double-click, where fetch() of local files is blocked by the browser).
"""

import datetime as dt
import json
import math
import random
from pathlib import Path

SEED = 20261015
R = random.Random(SEED)
END = dt.date(2026, 10, 15)          # "today" inside the dataset
DAYS = 60
START = END - dt.timedelta(days=DAYS - 1)
OUT = Path(__file__).resolve().parent.parent / "data"

# ---------------------------------------------------------------- schools
SCHOOLS = [
    dict(id="S101", name="Lakshya Public School", city="Bengaluru", board="CBSE", students=84,
         sections=["A", "B", "C", "D"], effect=0.06, verified_only=True, onboarded="2026-08-25", geneo_students=612),
    dict(id="S102", name="Vidya Niketan Group of Schools", city="Hyderabad", board="CBSE", students=72,
         sections=["A", "B", "C"], effect=0.02, verified_only=False, onboarded="2026-08-25", geneo_students=540),
    dict(id="S103", name="Greenfield International School", city="Pune", board="ICSE", students=66,
         sections=["A", "B", "C"], effect=0.08, verified_only=False, onboarded="2026-08-27", geneo_students=388),
    dict(id="S104", name="Sunrise Academy", city="Jaipur", board="State", students=58,
         sections=["A", "B"], effect=-0.07, verified_only=False, onboarded="2026-09-02", geneo_students=297),
    dict(id="S105", name="Kaveri Model School", city="Mysuru", board="State", students=48,
         sections=["A", "B"], effect=-0.03, verified_only=False, onboarded="2026-09-19", geneo_students=205),
    dict(id="S106", name="Meridian Convent School", city="Chennai", board="CBSE", students=0,
         sections=["A", "B", "C"], effect=0.0, verified_only=False, onboarded="2026-10-12", geneo_students=140),
]

FIRST = ("Aarav Aditi Advik Ananya Arjun Aisha Bhavya Dev Diya Eshan Farhan Gauri Harsh Isha Ishaan Jiya Kabir Kavya "
         "Krish Lakshmi Meera Mohit Myra Naman Neha Nikhil Oviya Pranav Priya Rahul Riya Rohan Saanvi Samar Sara Shreya "
         "Siddharth Tanvi Tara Uday Vihaan Vivaan Yash Zoya Anika Arnav Charvi Dhruv Ira Jai Kiara Laksh Manya Nitya "
         "Omkar Pari Reyansh Sahil Trisha Veda Yuvan Zaid").split()

# ------------------------------------------------- curriculum (30 concepts)
SUBJECTS = {
    "Mathematics": [
        ("M1", "Integers", ["Meaning of integers", "Adding and subtracting integers", "Multiplying and dividing integers"]),
        ("M2", "Fractions", ["Types of fractions", "Adding and subtracting fractions", "Multiplying and dividing fractions"]),
        ("M3", "Decimals", ["Place value in decimals", "Operations with decimals", "Decimals in money and measures"]),
        ("M4", "Ratio and Proportion", ["Understanding ratio", "Equivalent ratios", "Unitary method and proportion"]),
        ("M5", "Algebra Basics", ["Variables and expressions", "Forming equations", "Solving simple equations"]),
        ("M6", "Mensuration", ["Perimeter", "Area of rectangles and triangles", "Area of composite shapes"]),
    ],
    "Science": [
        ("SC1", "Food and Nutrition", ["Nutrients", "Balanced diet", "Deficiency diseases"]),
        ("SC2", "Materials", ["Fibres to fabric", "Properties of materials", "Separation of substances"]),
        ("SC3", "Motion", ["Measuring distance", "Speed and time", "Types of motion"]),
        ("SC4", "Light", ["Sources of light", "Shadows", "Reflection"]),
    ],
}
CROSS_PREREQ = {"M2.1": ["M1.3"], "M3.1": ["M2.3"], "M4.1": ["M2.3"], "M5.1": ["M1.3"], "M6.1": ["M3.3"]}
TIER = {1: "Foundational", 2: "Core", 3: "Advanced"}


def build_curriculum():
    chapters, concepts, edges = [], [], []
    for subject, chs in SUBJECTS.items():
        for ci, (cid, cname, names) in enumerate(chs):
            chapters.append(dict(id=cid, name=cname, subject=subject, order=ci + 1))
            for n, nm in enumerate(names, start=1):
                conc_id = f"{cid}.{n}"
                concepts.append(dict(
                    id=conc_id, chapter_id=cid, subject=subject, name=nm, order=n, tier=TIER[n],
                    learning_objectives=R.randint(3, 5),
                    difficulty=round(0.30 + 0.12 * (n - 1) + 0.015 * ci, 3),
                ))
                if n > 1:
                    edges.append(dict(from_id=f"{cid}.{n - 1}", to_id=conc_id, within_chapter=True))
            for pre in CROSS_PREREQ.get(f"{cid}.1", []):
                edges.append(dict(from_id=pre, to_id=f"{cid}.1", within_chapter=False))
    return chapters, concepts, edges


def clip(x, lo, hi):
    return max(lo, min(hi, x))


def binom(n, p):
    return sum(1 for _ in range(n) if R.random() < p)


def rows_for_student(sid, school, cls, section, ability, concepts_by_subject, last_offset):
    """One progress row per (student, concept) the student has touched or been assigned."""
    rows = []
    for subject, seq in concepts_by_subject.items():
        if subject == "Mathematics":
            depth = int(clip(R.gauss(8 + 6 * (ability - 0.55), 4), 1, len(seq)))
        else:
            depth = int(clip(R.gauss(3, 2.5), 0, 8)) if R.random() < 0.7 else 0
        if R.random() < 0.06 and subject == "Mathematics":
            depth = 0                                           # signed up, never practised
        for idx, c in enumerate(seq[: depth + 2]):              # started + 2 assigned-but-not-started
            started = idx < depth
            row = dict(
                student_id=sid, school_id=school["id"], class_name=cls, section=section, subject=subject,
                chapter_id=c["chapter_id"], concept_id=c["id"],
                practice_attempts=0, practice_correct=0, warmup_attempts=0, warmup_correct=0,
                challenge_attempts=0, challenge_correct=0, challenge_tries=0, challenge_passed=False,
                tries_to_pass=None, upi_score=None, avg_time_sec=None, last_activity=None,
            )
            if started:
                p = clip(1 / (1 + math.exp(-4 * (ability + 0.10 - c["difficulty"]))), 0.08, 0.97)
                n = R.randint(3, 14)
                k = binom(n, p)
                w = R.randint(0, 4)
                wk = binom(w, clip(p + 0.05, 0, 1))
                acc = k / n
                upi = clip(0.55 * p + 0.35 * acc - 0.05 + R.gauss(0, 0.05), 0.02, 0.97)
                if n + w <= 1:
                    upi = min(upi, 0.60)
                tries, ch_correct, passed, tries_to_pass = 0, 0, False, None
                if upi >= 0.78 and n >= 6 and R.random() < 0.30:
                    upi = R.uniform(0.80, 0.88)                  # challenge-ready, not taken yet
                elif upi >= 0.78 and n >= 6:
                    # challenge questions are harder than practice; some learners struggle with the format
                    p_ch = 0.30 if R.random() < 0.22 else clip(p - 0.22, 0, 1)
                    while tries < 3 and not passed:
                        tries += 1
                        got = binom(5, p_ch)
                        ch_correct += got
                        if got >= 3:
                            passed, tries_to_pass = True, tries
                    if passed:
                        upi = clip(max(upi, 0.86) + R.random() * 0.12, 0.86, 1.0)
                    else:
                        upi = min(upi, 0.79)
                else:
                    upi = min(upi, 0.79)
                off = int(clip(last_offset + (depth - 1 - idx) * 1.3 + R.randint(0, 6), 0, DAYS - 1))
                total = n + w + tries * 5
                row.update(
                    practice_attempts=n, practice_correct=k, warmup_attempts=w, warmup_correct=wk,
                    challenge_attempts=tries * 5, challenge_correct=ch_correct, challenge_tries=tries,
                    challenge_passed=passed, tries_to_pass=tries_to_pass, upi_score=round(upi, 3),
                    avg_time_sec=round(clip(20 + (1.15 - p) * 45 + R.gauss(0, 6), 8, 140), 1),
                    last_activity=(END - dt.timedelta(days=off)).isoformat(),
                )
                assert total >= 1
            rows.append(row)
    return rows


def distribute(total, weights):
    """Largest-remainder split of an integer total across weights."""
    s = sum(weights) or 1
    raw = [total * w / s for w in weights]
    base = [int(x) for x in raw]
    rem = total - sum(base)
    for i in sorted(range(len(raw)), key=lambda i: raw[i] - base[i], reverse=True)[:rem]:
        base[i] += 1
    return base


def main():
    chapters, concepts, edges = build_curriculum()
    by_subject = {s: [c for c in concepts if c["subject"] == s] for s in SUBJECTS}

    students, progress = [], []
    for school in SCHOOLS:
        used = set()
        for i in range(school["students"]):
            while True:
                name = f"{R.choice(FIRST)} {R.choice('ABCDEFGHJKLMNPRSTV')}."
                if name not in used:
                    used.add(name)
                    break
            cls = R.choices(["6", "7", "8"], weights=[34, 33, 33])[0]
            section = R.choice(school["sections"])
            ability = clip(R.gauss(0.55, 0.17) + school["effect"], 0.08, 0.97)
            last_offset = int(clip(R.expovariate(1 / 9), 0, DAYS - 1))
            sid = f"ST-{school['id']}-{i + 1:03d}"
            rows = rows_for_student(sid, school, cls, section, ability, by_subject, last_offset)
            progress.extend(rows)
            dates = [r["last_activity"] for r in rows if r["last_activity"]]
            students.append(dict(
                id=sid, name=name, school_id=school["id"], class_name=cls, section=section,
                joined=(START - dt.timedelta(days=R.randint(5, 40))).isoformat(),
                last_active=max(dates) if dates else None,
                diagnostic_done=R.random() < 0.72,
            ))

    # ------------------------------------------------------- daily activity
    days = [START + dt.timedelta(days=i) for i in range(DAYS)]
    weekday = [1.0, 1.05, 1.1, 1.05, 0.95, 0.35, 0.2]
    activity = []
    for school in SCHOOLS:
        mine = [r for r in progress if r["school_id"] == school["id"]]
        tot = dict(practice=sum(r["practice_attempts"] for r in mine), warmup=sum(r["warmup_attempts"] for r in mine),
                   challenge=sum(r["challenge_attempts"] for r in mine))
        start_day = 20 if school["id"] == "S105" else (0 if school["students"] else DAYS)
        w = [0.0 if i < start_day else weekday[d.weekday()] * (0.6 + 0.8 * i / (DAYS - 1)) for i, d in enumerate(days)]
        parts = {k: distribute(tot[k], w) for k in tot}
        for i, d in enumerate(days):
            total = parts["practice"][i] + parts["warmup"][i] + parts["challenge"][i]
            active = 0 if total == 0 else min(school["students"], max(1, round(total / 8.5 * (0.85 + 0.3 * R.random()))))
            activity.append(dict(
                date=d.isoformat(), school_id=school["id"], answers_practice=parts["practice"][i],
                answers_warmup=parts["warmup"][i], answers_challenge=parts["challenge"][i],
                active_learners=active, sessions=round(active * 1.15) if active else 0,
            ))

    # ------------------------------------------------------------ schools
    schools_out = []
    for s in SCHOOLS:
        linked = s["students"]
        schools_out.append(dict(
            id=s["id"], name=s["name"], city=s["city"], board=s["board"], pal_enabled=True,
            sections=s["sections"], learner_count=linked, onboarded_on=s["onboarded"],
            require_verified_questions=s["verified_only"], dashboard_logins=1,
            sync=dict(
                geneo_students=s["geneo_students"], linked_learners=linked,
                pending_to_link=0 if s["id"] != "S103" else 5,
                last_sync_at=f"{END.isoformat()}T02:00:00Z" if linked else f"{END.isoformat()}T02:00:00Z",
                status="synced" if linked else "waiting-for-first-learner",
                history=[dict(date=(END - dt.timedelta(days=k)).isoformat(),
                              linked=max(0, linked - (0 if k == 0 else R.randint(0, 3) * k)),
                              new_links=R.randint(0, 3) if linked and k else 0) for k in range(5)],
            ),
        ))

    # -------------------------------------------------------- diagnostics
    diagnostics = []
    for s in SCHOOLS:
        done = sum(1 for st in students if st["school_id"] == s["id"] and st["diagnostic_done"])
        started = min(s["students"], done + R.randint(2, 6)) if s["students"] else 0
        cls_total = done * 14
        knows = int(cls_total * R.uniform(0.28, 0.40) + s["effect"] * 40)
        gap = int(cls_total * R.uniform(0.18, 0.28) - s["effect"] * 40)
        diagnostics.append(dict(
            school_id=s["id"], started=started, completed=done, avg_questions=round(R.uniform(9.5, 12.5), 1),
            concept_classes=dict(knows=knows, uncertain=max(0, cls_total - knows - gap), gap=gap),
            stop_reasons=dict(classified=int(done * 0.62), max_questions=done - int(done * 0.62)),
            avg_minutes=round(R.uniform(7.5, 11.0), 1),
        ))

    # ------------------------------------------------- content pipeline
    stage_names = {"S1": "Parse and hierarchy", "S2": "LOs and concepts", "S3": "Prerequisites",
                   "S4": "Question and content tags", "S5": "Graph enrichment"}
    books = []
    for ch in chapters:
        cs = [c for c in concepts if c["chapter_id"] == ch["id"]]
        los = sum(c["learning_objectives"] for c in cs)
        b = dict(id=f"BK-{ch['id']}", chapter_id=ch["id"], title=f"{ch['subject']} - {ch['name']}", pages=R.randint(14, 34),
                 last_run=(END - dt.timedelta(days=R.randint(1, 30))).isoformat(),
                 stages={k: dict(status="completed", minutes=round(R.uniform(1, 9), 1)) for k in stage_names})
        b["stages"]["S1"]["elements"] = R.randint(180, 460)
        b["stages"]["S2"].update(los=los, concepts=len(cs))
        b["stages"]["S3"]["edges"] = len([e for e in edges if e["to_id"].split(".")[0] == ch["id"]])
        b["stages"]["S4"].update(questions_tagged=R.randint(60, 180), content_tagged=R.randint(6, 18))
        books.append(b)
    books[6]["stages"]["S4"].update(status="failed", error="Embedding provider rate limit; retry scheduled")
    books[6]["stages"]["S5"]["status"] = "pending"
    books[8]["stages"]["S2"].update(status="running", progress_pct=62)
    for k in ("S3", "S4", "S5"):
        books[8]["stages"][k]["status"] = "pending"
    books[9]["stages"]["S1"]["status"] = "running"
    books[9]["stages"]["S1"]["progress_pct"] = 35
    for k in ("S2", "S3", "S4", "S5"):
        books[9]["stages"][k]["status"] = "pending"

    pipeline = dict(
        stage_names=stage_names, books=books,
        question_bank=dict(
            total=2752, by_source=dict(cms_bank=2140, ai_generated=612),
            verified=dict(verified=1688, unverified=1064),
            by_difficulty=dict(low=724, medium=1318, high=710),
            by_chapter=dict(zip([ch["id"] for ch in chapters], distribute(2752, [R.randint(160, 330) for _ in chapters]))),
        ),
        generator=dict(
            window_days=30, requested=1240, returned=1198, passed_schema=1151, passed_katex=1089, saved_to_cms=1076,
            failures=dict(schema_invalid=47, katex_invalid=62, cms_save_failed=13, duplicate=29),
            providers=dict(external=812, self_generated=301, template_fallback=85),
        ),
        llm_usage=[
            dict(stage="S1 hierarchy and blocks", calls=1840, tokens_m=6.2, p50_ms=3100),
            dict(stage="S2 LOs and concepts", calls=2210, tokens_m=9.8, p50_ms=4200),
            dict(stage="S3 prerequisites", calls=960, tokens_m=3.1, p50_ms=2700),
            dict(stage="S4 question and content tags", calls=14300, tokens_m=21.4, p50_ms=2400),
            dict(stage="Runtime summaries", calls=5120, tokens_m=2.2, p50_ms=620),
            dict(stage="Question generation", calls=1198, tokens_m=7.5, p50_ms=5600),
        ],
    )

    # ------------------------------------------------------------- health
    weeks = [(END - dt.timedelta(days=7 * k)) for k in range(8, -1, -1)]
    health = dict(
        note="Synthetic operational data for the demo.",
        weeks=[w.isoformat() for w in weeks],
        http_422=[127, 119, 131, 124, 96, 41, 18, 11, 9],
        release_markers=[dict(week_index=5, label="Stale-submit fixes released")],
        recoveries=dict(
            stale_session_answer=[0, 0, 0, 0, 12, 33, 41, 38, 44],
            practice_during_challenge=[0, 0, 0, 0, 4, 9, 7, 6, 8],
            late_challenge_answer=[0, 0, 0, 0, 6, 14, 12, 10, 9],
            content_view_recovered=[0, 0, 0, 0, 3, 8, 11, 9, 10],
        ),
        latency=[
            dict(group="Sessions", p50_ms=85, p95_ms=240, error_pct=0.2),
            dict(group="Answers", p50_ms=210, p95_ms=620, error_pct=0.4),
            dict(group="Next action", p50_ms=160, p95_ms=480, error_pct=0.3),
            dict(group="Question recommendations", p50_ms=540, p95_ms=3900, error_pct=0.9),
            dict(group="Challenge", p50_ms=230, p95_ms=700, error_pct=0.5),
            dict(group="Diagnostic", p50_ms=260, p95_ms=810, error_pct=0.6),
            dict(group="Dashboard progress", p50_ms=320, p95_ms=1100, error_pct=0.1),
        ],
        uptime_pct=99.93,
    )

    meta = dict(
        title="PAL Insights Dashboard - synthetic demo data",
        generated_by="tools/generate_data.py (AI-generated, fictional)", seed=SEED, as_of=END.isoformat(),
        window_start=START.isoformat(), window_days=DAYS,
        disclaimer="Fictional schools, students and numbers. No real learners and no database.",
        thresholds=dict(weak_below=0.40, strong_from=0.70, challenge_ready_from=0.80, inactive_days=14),
    )

    files = dict(meta=meta, schools=schools_out, students=students, curriculum=dict(chapters=chapters, concepts=concepts, edges=edges),
                 progress=progress, activity=activity, diagnostics=diagnostics, pipeline=pipeline, health=health)

    OUT.mkdir(exist_ok=True)
    for name, obj in files.items():
        path = OUT / f"{name}.json"
        if name in ("progress", "activity", "students"):                 # one record per line: readable and diff-friendly
            path.write_text("[\n" + ",\n".join(json.dumps(r, separators=(",", ":")) for r in obj) + "\n]\n")
        else:
            path.write_text(json.dumps(obj, indent=2) + "\n")
    (OUT / "pal-data.js").write_text("window.PAL_DATA = " + json.dumps(files, separators=(",", ":")) + ";\n")

    started = [r for r in progress if r["upi_score"] is not None]
    print(f"schools {len(schools_out)} | students {len(students)} | concepts {len(concepts)} | progress rows {len(progress)} "
          f"({len(started)} started) | activity rows {len(activity)}")
    print(f"answers total {sum(r['answers_practice'] + r['answers_warmup'] + r['answers_challenge'] for r in activity)}")


if __name__ == "__main__":
    main()
