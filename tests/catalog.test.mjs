import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SONGS} from '../songs.js';
import {filterCatalog,variantKind} from '../catalog.js';
const audit=JSON.parse(await readFile(new URL('../catalog-audit.json',import.meta.url),'utf8'));
const ids=new Set(SONGS.map(s=>s.id));
test('every accepted release, video and supplemental candidate points to a catalog song',()=>{
 for(const rows of [audit.releases,audit.videos,audit.supplements])for(const r of rows){
  assert.ok(['included','merged','excluded','review'].includes(r.status));
  if(r.status==='included'||(r.status==='merged'&&r.songId))assert.ok(ids.has(r.songId),JSON.stringify(r));
  if(r.status==='excluded'||r.status==='review')assert.ok(r.reason);
 }
 assert.ok(audit.videos.length>=audit.uploadsChecked);
 for(const s of SONGS)assert.ok([...audit.releases,...audit.supplements].some(r=>r.songId===s.id),'untracked '+s.title);
});
test('optional tracks start hidden and SE is excluded',()=>{
 assert.ok(filterCatalog(SONGS).every(s=>!variantKind(s)));
 assert.equal(filterCatalog(SONGS,{includeRemixes:true,includeLanguages:true,includeSolo:true,includeUnits:true}).length,SONGS.length);
 assert.ok(SONGS.every(s=>!/^(SE|Overture|outro)/i.test(s.title)));
});
test('supplemental songs survive regeneration and unresolved candidates remain explicit',()=>{
 for(const r of audit.supplements)assert.ok(SONGS.some(s=>s.id===r.songId&&s.title===r.title));
 for(const r of audit.pending){assert.equal(r.status,'review');assert.ok(r.reason&&r.source);assert.ok(!SONGS.some(s=>s.title===r.title));}
});
test('solo and unit toggles independently include the intended performances',()=>{
 const base=filterCatalog(SONGS),withSolo=filterCatalog(SONGS,{includeSolo:true}),withUnits=filterCatalog(SONGS,{includeUnits:true}),both=filterCatalog(SONGS,{includeSolo:true,includeUnits:true});
 assert.equal(base.length,66);assert.equal(withSolo.length,76);assert.equal(withUnits.length,68);assert.equal(both.length,78);
 assert.ok(base.every(s=>!s.solo&&!s.unit));
 assert.equal(withSolo.filter(s=>s.solo).length,10);assert.ok(withSolo.every(s=>!s.unit));
 assert.ok(withUnits.every(s=>!s.solo));
 assert.deepEqual(withUnits.filter(s=>s.unit).map(s=>s.title).sort(),['ときめき死','君夢物語'].sort());
 assert.ok(withSolo.some(s=>s.title==='ときめき死（月埜ヒスイ ソロver.）'&&s.solo));
 assert.ok(SONGS.every(s=>!(s.unit&&s.solo)));
 for(const [title,members] of [['君夢物語',['黒木いろ','ちぎら']],['ときめき死',['天神・大天使・閻魔','月埜ヒスイ']]]){
  const s=withUnits.find(s=>s.title===title);assert.deepEqual(s.unitMembers,members);
  assert.ok(s.sources.some(source=>source.url.startsWith('https://ja.wikipedia.org/')));
 }
 // Birthday songs and inherited group songs remain ordinary group entries.
 for(const title of ['おにぃちゃんス','BLUEROCK','ぺるぺっぽ'])assert.ok(base.some(s=>s.title===title));
 for(const title of ['アイデンティティクライシス','夢桜']){const s=base.find(s=>s.title===title);assert.equal(s.date,'2019');assert.equal(s.dateKind,'year');assert.equal(s.release,'音源未確認');}
});
