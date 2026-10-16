(function(root){
  const {test,ok,equal}=root.PALTest;
  test('synthetic JSON matches documented relationships and progress invariants',async()=>{
    const files=['meta','schools','students','curriculum','progress','activity','diagnostics','pipeline','health'];
    let d;
    try {const vals=await Promise.all(files.map(async n=>(await fetch(`../data/${n}.json`)).json()));d=Object.fromEntries(files.map((n,i)=>[n,vals[i]]));}
    catch(_){d=root.PAL_DATA;}
    equal(d.schools.length,6);equal(d.students.length,328);equal(d.curriculum.concepts.length,30);equal(d.activity.length,360);
    const studentIds=new Set(d.students.map(s=>s.id)),schoolIds=new Set(d.schools.map(s=>s.id)),conceptIds=new Set(d.curriculum.concepts.map(c=>c.id));
    ok(d.progress.every(r=>studentIds.has(r.student_id)&&schoolIds.has(r.school_id)&&conceptIds.has(r.concept_id)));
    for(const r of d.progress){
      equal(r.challenge_attempts,5*r.challenge_tries);
      equal(r.upi_score==null,r.last_activity==null);
      equal(r.upi_score==null,(r.practice_attempts+r.warmup_attempts+r.challenge_attempts)===0);
      if(r.challenge_passed){ok(r.upi_score>=.85);ok(r.tries_to_pass>=1&&r.tries_to_pass<=r.challenge_tries)}
      else ok(r.upi_score==null||r.upi_score<.89);
      ok(r.practice_correct<=r.practice_attempts&&r.warmup_correct<=r.warmup_attempts&&r.challenge_correct<=r.challenge_attempts);
    }
    for(const school of d.schools){const p=d.progress.filter(r=>r.school_id===school.id).reduce((s,r)=>s+r.practice_attempts+r.warmup_attempts+r.challenge_attempts,0);const a=d.activity.filter(r=>r.school_id===school.id).reduce((s,r)=>s+r.answers_practice+r.answers_warmup+r.answers_challenge,0);equal(p,a)}
    equal(d.schools.find(s=>s.learner_count===0).id,'S106');
  });
})(typeof globalThis!=='undefined'?globalThis:window);
