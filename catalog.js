export function variantKind(song){
  if(song.custom)return null;
  if(song.variantKind==='remix'||song.variantKind==='language')return song.variantKind;
  const title=song.title.normalize('NFKC');
  if(/\b(?:remix|mix)\b/i.test(title))return 'remix';
  if(/\b(?:English|Chinese|Indonesian|Korean|Multilingual)\s+(?:Ver\.?|Version)\b/i.test(title))return 'language';
  return null;
}

export function yearLabel(song){
  if(song.dateKind==='unknown')return '公開年未確認';
  return song.date.slice(0,4)+(song.dateKind==='estimated-year'?'（推定）':'');
}

export function filterCatalog(songs,{includeRemixes=false,includeLanguages=false,includeSolo=false,includeUnits=false}={}){
  return songs.filter(song=>{
    if(song.solo&&!includeSolo)return false;
    if(song.unit&&!includeUnits)return false;
    const kind=variantKind(song);
    return kind==='remix'?includeRemixes:kind==='language'?includeLanguages:true;
  });
}
