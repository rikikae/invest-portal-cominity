(async function(){
  const res = await fetch('data/terms.json');
  const all = await res.json();
  const el = document.getElementById('results');
  const cat = (window.CAT_NAME) || (document.body && document.body.getAttribute('data-cat')) || '';
  const list = all.filter(t => (t.category||'') === cat).sort((a,b)=> (a.title||'').localeCompare(b.title||'', 'ja'));
  function esc(s=''){return (''+s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',\"'\":'&#39;','\"':'&quot;'}[c]));}
  el.innerHTML = list.map(t => `<div class="card term"><h4>${esc(t.title)}</h4><p>${esc(t.definition||'')}</p></div>`).join('') || `<div class="card"><p>該当がありません。</p></div>`;
})();