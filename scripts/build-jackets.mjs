import {mkdir,writeFile} from 'node:fs/promises';
import {SONGS} from '../songs.js';
import sharp from 'sharp';
await mkdir('jackets',{recursive:true});
const sources=[...new Map(SONGS.filter(s=>s.artworkSource).map(s=>[s.artwork,s.artworkSource])).entries()];
let cursor=0;await Promise.all(Array.from({length:4},async()=>{while(cursor<sources.length){const [file,url]=sources[cursor++];const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error('Jacket HTTP '+r.status);const image=await sharp(Buffer.from(await r.arrayBuffer())).rotate().resize(256,256,{fit:'cover'}).webp({quality:82}).toBuffer();await writeFile(file,image);}}));
console.log('Packaged '+sources.length+' covers');
