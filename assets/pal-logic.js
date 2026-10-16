(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PALLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const sum = values => values.reduce((a, b) => a + (Number(b) || 0), 0);
  const mean = values => { const xs = values.filter(v => v !== null && v !== undefined && Number.isFinite(Number(v))); return xs.length ? sum(xs.map(Number)) / xs.length : null; };
  const median = values => { const xs=values.filter(v=>v!==null&&v!==undefined&&Number.isFinite(Number(v))).map(Number).sort((a,b)=>a-b); if(!xs.length)return null;const m=Math.floor(xs.length/2);return xs.length%2?xs[m]:(xs[m-1]+xs[m])/2; };
  const pct = (a, b) => b ? a / b : null;
  const answers = r => sum([r.practice_attempts, r.warmup_attempts, r.challenge_attempts]);
  const correct = r => sum([r.practice_correct, r.warmup_correct, r.challenge_correct]);
  const status = r => r.challenge_passed ? 'Mastered' : r.upi_score == null ? 'Not started' : r.upi_score < .4 ? 'Weak' : 'In progress';
  function select(data, filters = {}) {
    return data.progress.filter(r => (!filters.school || r.school_id === filters.school) && (!filters.className || r.class_name === filters.className) && (!filters.subject || r.subject === filters.subject));
  }
  function studentStats(data, rows = data.progress) {
    const grouped = new Map();
    rows.forEach(r => { if (!grouped.has(r.student_id)) grouped.set(r.student_id, []); grouped.get(r.student_id).push(r); });
    return [...grouped].map(([id, rs]) => {
      const student = data.students.find(s => s.id === id) || { id, name: id, school_id: rs[0]?.school_id, last_active: null };
      const avg = mean(rs.map(r => r.upi_score)); const totalAnswers = sum(rs.map(answers));
      const weak = rs.filter(r => r.upi_score != null && r.upi_score < .4).length;
      const reasons = [];
      if (avg != null && avg < .4) reasons.push('Average mastery below 40%');
      if (weak >= 3) reasons.push(`${weak} weak concepts`);
      const days = student.last_active ? (Date.parse(data.meta.as_of) - Date.parse(student.last_active)) / 86400000 : Infinity;
      if (days >= 14) reasons.push('Inactive 14+ days');
      if (totalAnswers >= 20 && pct(sum(rs.map(correct)), totalAnswers) < .4) reasons.push('Accuracy below 40%');
      if (!student.last_active) reasons.push('No activity yet');
      const focusNext = rs.filter(r => !r.challenge_passed && r.upi_score != null && r.upi_score < .8).sort((a,b)=>(a.upi_score??1)-(b.upi_score??1)).slice(0,4);
      const ready = rs.filter(r => !r.challenge_passed && r.upi_score >= .8).sort((a,b)=>b.upi_score-a.upi_score).slice(0,4);
      return { ...student, rows: rs, avg, answers: totalAnswers, correct: sum(rs.map(correct)), accuracy: pct(sum(rs.map(correct)), totalAnswers), weak, mastered: rs.filter(r => r.challenge_passed).length, started: rs.filter(r => r.upi_score != null).length, concepts: rs.length, status: avg == null ? 'Not started' : avg < .4 ? 'Needs support' : avg < .7 ? 'Developing' : 'Strong', reasons, daysInactive: Number.isFinite(days) ? days : null, focusNext, ready };
    });
  }
  function kpis(data, rows, windowDays = 30) {
    const students = studentStats(data, rows); const scored = rows.map(r => r.upi_score).filter(v => v != null);
    const totalAnswers = sum(rows.map(answers)); const totalCorrect = sum(rows.map(correct));
    const cutoff = Date.parse(data.meta.as_of) - (windowDays - 1) * 86400000;
    const active = students.filter(s => s.last_active && Date.parse(s.last_active) >= cutoff).length;
    const tried = rows.filter(r => r.challenge_tries > 0).length; const passed = rows.filter(r => r.challenge_passed).length;
    return { learners: new Set(rows.map(r => r.student_id)).size, active, activeShare: pct(active, new Set(rows.map(r => r.student_id)).size), answers: totalAnswers, accuracy: pct(totalCorrect, totalAnswers), mastery: mean(scored), mastered: passed, passRate: pct(passed, tried), needsSupport: students.filter(s => s.status === 'Needs support').length, supportShare: pct(students.filter(s => s.status === 'Needs support').length, students.length) };
  }
  function overview(data, rows) {
    const statuses = ['Mastered', 'Weak', 'In progress', 'Not started'].map(name => ({ name, count: rows.filter(r => status(r) === name).length }));
    const students = studentStats(data, rows);
    const hist = Array.from({ length: 10 }, (_, i) => ({ label: `${i * 10}–${i === 9 ? 100 : i * 10 + 9}%`, count: students.filter(s => s.avg != null && Math.min(9, Math.floor(s.avg * 10)) === i).length }));
    const activities = [['Practice', 'practice_attempts', 'practice_correct'], ['Warm-up', 'warmup_attempts', 'warmup_correct'], ['Challenge', 'challenge_attempts', 'challenge_correct']].map(([name, a, c]) => { const n = sum(rows.map(r => r[a])); return { name, attempts: n, accuracy: pct(sum(rows.map(r => r[c])), n) }; });
    const grouped = field => [...new Set(rows.map(r => r[field]))].map(name => { const group = rows.filter(r => r[field] === name); return { name, mastery: mean(group.map(r => r.upi_score)), learners: new Set(group.map(r => r.student_id)).size }; });
    return { statuses, hist, activities, medianMastery:median(students.map(s=>s.avg)), bySubject: grouped('subject'), byClass: grouped('class_name') };
  }
  function schoolStats(data, filters = {}) {
    return data.schools.map(school => {
      const rs = select(data, { ...filters, school: school.id }); const ss = data.students.filter(s => s.school_id === school.id);
      const k = kpis(data, rs, 7); const scored = rs.filter(r => r.upi_score != null); const attempted = rs.filter(r => r.challenge_tries > 0);
      return { ...school, learners: ss.length, active7: ss.filter(s => s.last_active && (Date.parse(data.meta.as_of) - Date.parse(s.last_active)) <= 6 * 86400000).length, mastery: mean(scored.map(r => r.upi_score)), accuracy: k.accuracy, weakShare: pct(scored.filter(r => r.upi_score < .4).length, scored.length), passRate: pct(attempted.filter(r => r.challenge_passed).length, attempted.length), syncCoverage: school.learner_count ? pct(school.sync.linked_learners, school.sync.geneo_students) : null };
    });
  }
  function concepts(data, rows) {
    return data.curriculum.concepts.map(c => { const rs = rows.filter(r => r.concept_id === c.id); const tried = rs.filter(r => r.challenge_tries > 0); return { ...c, chapter: data.curriculum.chapters.find(ch => ch.id === c.chapter_id)?.name || c.chapter_id, weak: rs.filter(r => r.upi_score != null && r.upi_score < .4).length, mastery: mean(rs.map(r => r.upi_score)), answers: sum(rs.map(answers)), passRate: pct(tried.filter(r => r.challenge_passed).length, tried.length), ready: rs.filter(r => r.upi_score >= .8 && !r.challenge_passed).length, rows: rs }; }).filter(c => c.rows.length);
  }
  function challenge(data, rows) {
    const tried = rows.filter(r => r.challenge_tries > 0), passed = rows.filter(r => r.challenge_passed);
    const funnel=[rows.filter(r => r.upi_score != null).length, rows.filter(r => r.upi_score >= .8 || r.challenge_passed).length, tried.length, passed.length];
    return { funnel, conversions:funnel.slice(1).map((n,i)=>pct(n,funnel[i])), stuck: rows.filter(r => r.challenge_tries === 3 && !r.challenge_passed).length, stuckShare:pct(rows.filter(r=>r.challenge_tries===3&&!r.challenge_passed).length,tried.length), tries: [1,2,3].map(n => passed.filter(r => r.tries_to_pass === n).length), tiers: ['Foundational','Core','Advanced'].map(tier => { const ids = new Set(data.curriculum.concepts.filter(c => c.tier === tier).map(c => c.id)); const rs = rows.filter(r => ids.has(r.concept_id)); const ts = rs.filter(r => r.challenge_tries); return { tier, rate: pct(ts.filter(r => r.challenge_passed).length, ts.length) }; }), readyNow: concepts(data,rows).filter(c=>c.ready>0).sort((a,b)=>b.ready-a.ready).slice(0,10) };
  }
  function dailyActivity(data, filters = {}) {
    const days = Number(filters.windowDays || data.meta.window_days || 60), cutoff = Date.parse(data.meta.as_of) - (days - 1) * 86400000;
    const rows = data.activity.filter(a => (!filters.school || a.school_id === filters.school) && Date.parse(a.date) >= cutoff).sort((a,b)=>a.date.localeCompare(b.date));
    const dates=[...new Set(rows.map(r=>r.date))];
    return dates.map((date,i)=>{const ds=rows.filter(r=>r.date===date);const n=sum(ds.map(r=>r.answers_practice+r.answers_warmup+r.answers_challenge));return {date,answers:n,activeLearners:sum(ds.map(r=>r.active_learners)),sessions:sum(ds.map(r=>r.sessions)),average:sum(dates.slice(Math.max(0,i-6),i+1).flatMap(d=>rows.filter(r=>r.date===d).map(r=>r.answers_practice+r.answers_warmup+r.answers_challenge)))/Math.min(7,i+1)}});
  }
  function heatmap(data, rows, filters = {}) {
    const columns = filters.school ? [...new Set(rows.filter(r => r.school_id === filters.school).map(r => r.section))].sort() : data.schools.map(s => s.id);
    const chapters = data.curriculum.chapters.map(ch => ({ ...ch, cells: [...columns, 'All'].map(col => { const rs = rows.filter(r => r.chapter_id === ch.id && (col === 'All' || (filters.school ? r.section === col : r.school_id === col))); return { column: col, mastery: mean(rs.map(r => r.upi_score)), learners: new Set(rs.map(r => r.student_id)).size, weak: rs.filter(r => r.upi_score != null && r.upi_score < .4).length }; }) }));
    return { columns: [...columns, 'All'], chapters };
  }
  function chapterStats(data, rows) {
    return data.curriculum.chapters.map(ch => {
      const rs = rows.filter(r => r.chapter_id === ch.id);
      return { ...ch, mastery: mean(rs.map(r => r.upi_score)), learners: new Set(rs.map(r => r.student_id)).size, weak: rs.filter(r => r.upi_score != null && r.upi_score < .4).length };
    }).sort((a, b) => (a.mastery == null ? Infinity : a.mastery) - (b.mastery == null ? Infinity : b.mastery));
  }
  function weakestConcepts(data, rows, limit = 12) {
    return concepts(data, rows).sort((a, b) => b.weak - a.weak || (a.mastery == null ? Infinity : a.mastery) - (b.mastery == null ? Infinity : b.mastery) || a.name.localeCompare(b.name)).slice(0, Math.max(0, limit));
  }
  function conceptGraph(data, chapterId, rows = []) {
    const curriculum = data.curriculum; const target = new Set(curriculum.concepts.filter(c => c.chapter_id === chapterId).map(c => c.id));
    const edges = curriculum.edges || [];
    const ids = new Set(target);
    edges.forEach(e => { if (target.has(e.to_id)) ids.add(e.from_id); });
    const nodes = [...ids].map(id => {
      const concept = curriculum.concepts.find(c => c.id === id);
      if (!concept) return null;
      const inRows = rows.filter(r => r.concept_id === id);
      return { ...concept, external: concept.chapter_id !== chapterId, mastery: mean(inRows.map(r => r.upi_score)) };
    }).filter(Boolean);
    const nodeIds = new Set(nodes.map(n => n.id));
    const graphEdges = edges.filter(e => nodeIds.has(e.from_id) && nodeIds.has(e.to_id)).map(e => ({ ...e }));
    const depth = (id, visiting = new Set()) => {
      if (visiting.has(id)) return 0;
      const next = new Set(visiting); next.add(id);
      const parents = graphEdges.filter(e => e.to_id === id).map(e => e.from_id);
      return parents.length ? 1 + Math.max(...parents.map(p => depth(p, next))) : 0;
    };
    nodes.forEach(n => { n.depth = depth(n.id); });
    return { nodes, edges: graphEdges, layers: [...new Set(nodes.map(n => n.depth))].sort((a,b)=>a-b).map(d => ({ depth: d, nodes: nodes.filter(n => n.depth === d) })) };
  }
  function diagnosticStats(data, filters = {}) {
    const records = (data.diagnostics || []).filter(d => !filters.school || d.school_id === filters.school);
    const started = sum(records.map(d => d.started)); const completed = sum(records.map(d => d.completed));
    const outcomes = ['knows', 'uncertain', 'gap'].map(name => ({ name, count: sum(records.map(d => d.concept_classes?.[name] || 0)) }));
    const outcomeTotal = sum(outcomes.map(d => d.count)); outcomes.forEach(d => { d.share = pct(d.count, outcomeTotal); });
    const completedWeight = completed;
    const weighted = field => completedWeight ? sum(records.map(d => (Number(d[field]) || 0) * (Number(d.completed) || 0))) / completedWeight : null;
    return { schools: records.map(d => ({ ...d, completion: pct(d.completed, d.started) })), started, completed, completion: pct(completed, started), outcomes, avgQuestions: weighted('avg_questions'), avgMinutes: weighted('avg_minutes') };
  }
  function pipelineStats(data) {
    const p = data.pipeline || {}; const books = p.books || []; const stages = Object.keys(p.stage_names || {});
    const needsAttention = books.filter(b => stages.some(s => b.stages?.[s]?.status === 'failed')).map(b => ({ ...b, errors: stages.filter(s => b.stages?.[s]?.status === 'failed').map(s => ({ stage: s, error: b.stages[s].error || '' })) }));
    const fullyProcessed = books.filter(b => stages.length && stages.every(s => b.stages?.[s]?.status === 'completed')).length;
    const totals = { learningObjectives: 0, concepts: 0, prerequisiteEdges: 0, questionsTagged: 0, contentTagged: 0 };
    books.forEach(b => stages.forEach(stage => { const s = b.stages?.[stage] || {}; totals.learningObjectives += Number(s.los) || 0; totals.concepts += Number(s.concepts) || 0; totals.prerequisiteEdges += Number(s.edges) || 0; totals.questionsTagged += Number(s.questions_tagged) || 0; totals.contentTagged += Number(s.content_tagged) || 0; }));
    const bank = p.question_bank || {}; const g = p.generator || {}; const requested = Number(g.requested) || 0; const returned = Number(g.returned) || 0;
    const funnel = [requested, Number(g.returned) || 0, Number(g.passed_schema) || 0, Number(g.passed_katex) || 0, Number(g.saved_to_cms) || 0];
    const failureTotal = sum(Object.values(g.failures || {}));
    return { bookCount: books.length, fullyProcessed, fullyProcessedShare: pct(fullyProcessed, books.length), needsAttention, totals,
      questionBank: { ...bank, verifiedShare: pct(bank.verified?.verified, sum(Object.values(bank.verified || {}))), aiShare: pct(bank.by_source?.ai_generated, bank.total) },
      generator: { ...g, funnel, stepConversion: funnel.slice(1).map((n,i)=>pct(n,funnel[i])), yield: pct(g.saved_to_cms, requested), failureTotal, failures: Object.entries(g.failures || {}).map(([name,count])=>({name,count,share:pct(count,failureTotal)})), providerMix: Object.entries(g.providers || {}).map(([name,count])=>({name,count,share:pct(count,returned)})) }, llmUsage: p.llm_usage || [] };
  }
  function healthStats(data) {
    const h = data.health || {}; const series = h.http_422 || []; const first = series[0]; const last = series[series.length - 1];
    const recoveries = Object.entries(h.recoveries || {}).map(([name, values]) => ({ name, values }));
    return { weeks: h.weeks || [], http422: series.map((value,i)=>({week:h.weeks?.[i],value})), reduction: pct(first - last, first), releaseMarkers: h.release_markers || [], recoveries, lastRecoveryTotal: sum(recoveries.map(r=>r.values?.[r.values.length-1] || 0)), latency: (h.latency || []).map(x=>({...x,slow:x.p95_ms>1000,highError:x.error_pct>.8})), uptime: h.uptime_pct ?? null };
  }
  return { sum, mean, median, pct, answers, correct, status, select, studentStats, kpis, overview, schoolStats, concepts, challenge, heatmap, dailyActivity, chapterStats, weakestConcepts, conceptGraph, diagnosticStats, pipelineStats, healthStats };
});
