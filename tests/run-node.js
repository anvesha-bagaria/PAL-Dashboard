const fs = require('fs');
const path = require('path');
global.PALLogic = require('../assets/pal-logic.js');
let passed = 0, failed = 0;
global.PALTest = {
  test(name, fn) { try { fn(); passed++; console.log(`✓ ${name}`); } catch (e) { failed++; console.error(`✗ ${name}: ${e.message}`); } },
  equal(actual, expected) { if (actual !== expected) throw new Error(`expected ${expected}, got ${actual}`); },
  ok(value) { if (!value) throw new Error('expected truthy value'); }
};
require('./pal-logic.test.js');
const dataDir=path.join(__dirname,'..','data');
const names=['meta','schools','students','curriculum','progress','activity','diagnostics','pipeline','health'];
const data=Object.fromEntries(names.map(n=>[n,JSON.parse(fs.readFileSync(path.join(dataDir,`${n}.json`),'utf8'))]));
global.PALTest.test('synthetic data counts, relationships and progress invariants',()=>{
  global.PALTest.equal(data.schools.length,6);global.PALTest.equal(data.students.length,328);global.PALTest.equal(data.curriculum.concepts.length,30);global.PALTest.equal(data.activity.length,360);
  const ids=new Set(data.students.map(s=>s.id)), schoolIds=new Set(data.schools.map(s=>s.id)), conceptIds=new Set(data.curriculum.concepts.map(c=>c.id));
  global.PALTest.ok(data.progress.every(r=>ids.has(r.student_id)&&schoolIds.has(r.school_id)&&conceptIds.has(r.concept_id)));
  for(const r of data.progress){global.PALTest.equal(r.challenge_attempts,5*r.challenge_tries);global.PALTest.equal(r.upi_score==null,r.last_activity==null);global.PALTest.equal(r.upi_score==null,(r.practice_attempts+r.warmup_attempts+r.challenge_attempts)===0);if(r.challenge_passed){global.PALTest.ok(r.upi_score>=.85&&r.tries_to_pass>=1&&r.tries_to_pass<=r.challenge_tries)}else global.PALTest.ok(r.upi_score==null||r.upi_score<.89);global.PALTest.ok(r.practice_correct<=r.practice_attempts&&r.warmup_correct<=r.warmup_attempts&&r.challenge_correct<=r.challenge_attempts)}
  for(const s of data.schools){const p=data.progress.filter(r=>r.school_id===s.id).reduce((n,r)=>n+r.practice_attempts+r.warmup_attempts+r.challenge_attempts,0);const a=data.activity.filter(r=>r.school_id===s.id).reduce((n,r)=>n+r.answers_practice+r.answers_warmup+r.answers_challenge,0);global.PALTest.equal(p,a)}
});
console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
