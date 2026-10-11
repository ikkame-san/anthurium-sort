export function variantKind(song){
  if(song.custom)return null;
  if(song.variantKind==='remix'||song.variantKind==='language')return song.variantKind;
  const title=song.title.normalize('NFKC');
  if(/\b(?:remix|mix)\b/i.test(title))return 'remix';
  if(/\b(?:English|Chinese|Indonesian|Korean|Multilingual)\s+(?:Ver\.?|Version)\b/i.test(title))return 'language';
  return null;
}

export function filterCatalog(songs,{includeRemixes=false,includeLanguages=false}={}){
  return songs.filter(song=>{
    const kind=variantKind(song);
    return kind==='remix'?includeRemixes:kind==='language'?includeLanguages:true;
  });
}
