(async function(){
  const res = await fetch('data/terms.json',{cache:'no-store'});
  const all = await res.json();
  const el = document.getElementById('results');
  const CAT = (window.CAT_NAME) || (document.body && document.body.getAttribute('data-cat')) || '';
  const q = new URLSearchParams(location.search).get('q') || '';
  const key = (q||'').trim().toLowerCase();
  function esc(s=''){return (''+s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));}
  function hi(t){ if(!key) return esc(t); const re=new RegExp('('+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'); return esc(t).replace(re,'<mark>$1</mark>'); }
  const list = all.filter(t => (t.category||'') === CAT).filter(t=>{ if(!key) return true; const hay=((t.title||'')+' '+(t.alias||[]).join(' ')+' '+(t.definition||'')+' '+(t.usage||'')+' '+(t.pitfalls||'')).toLowerCase(); return hay.includes(key); }).sort((a,b)=>(a.title||'').localeCompare(b.title||'', 'ja'));
  el.innerHTML = list.map(t => `<div class="card term"><h4>${hi(t.title)}</h4><p>${hi(t.definition||'')}</p></div>`).join('') || `<div class="card"><p>該当がありません。</p></div>`;
})();