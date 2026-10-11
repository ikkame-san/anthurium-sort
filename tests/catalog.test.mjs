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
 assert.equal(filterCatalog(SONGS,{includeRemixes:true,includeLanguages:true,includeSolo:true}).length,SONGS.length);
 assert.ok(SONGS.every(s=>!/^(SE|Overture|outro)/i.test(s.title)));
});
test('supplemental songs survive regeneration and unresolved candidates remain explicit',()=>{
 for(const r of audit.supplements)assert.ok(SONGS.some(s=>s.id===r.songId&&s.title===r.title));
 for(const r of audit.pending){assert.equal(r.status,'review');assert.ok(r.reason&&r.source);assert.ok(!SONGS.some(s=>s.title===r.title));}
});
test('solo toggle adds ten original solo tracks without hiding the group unit version',()=>{
 const base=filterCatalog(SONGS),withSolo=filterCatalog(SONGS,{includeSolo:true});
 assert.equal(base.length,68);assert.equal(withSolo.length,78);
 assert.ok(base.every(s=>!s.solo));assert.equal(withSolo.filter(s=>s.solo).length,10);
 assert.ok(base.some(s=>s.title==='ときめき死'));
 assert.ok(withSolo.some(s=>s.title==='ときめき死（月埜ヒスイ ソロver.）'&&s.solo));
 for(const title of ['アイデンティティクライシス','夢桜']){const s=base.find(s=>s.title===title);assert.equal(s.date,'2019');assert.equal(s.dateKind,'year');}
});
