// Category page renderer (uses CAT_NAME defined inline or from data-cat attr)
(async function(){
  const res = await fetch('data/terms.json');
  const all = await res.json();
  const el = document.getElementById('results');
  const CAT = (window.CAT_NAME) || (document.body && document.body.getAttribute('data-cat')) || '';
  const q = new URLSearchParams(location.search).get('q') || '';
  const key = (q||'').trim().toLowerCase();

  const filtered = all.filter(t => (t.category||'') === CAT).filter(t => {
    if(!key) return true;
    const hay = ((t.title||'')+' '+(t.alias||[]).join(' ')+' '+(t.definition||'')+' '+(t.usage||'')+' '+(t.pitfalls||'')).toLowerCase();
    return hay.includes(key);
  }).sort((a,b)=> (a.title||'').localeCompare(b.title||'', 'ja'));

  function esc(s=''){return (''+s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function hi(t){ if(!key) return esc(t); const re=new RegExp('('+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'); return esc(t).replace(re,'<mark>$1</mark>'); }
  function card(t){
    const alias = t.alias && t.alias.length ? `<span class="tag">別名: ${esc(t.alias.join(', '))}</span>` : '';
    const usage = t.usage ? `<p><strong>使い方:</strong> ${esc(t.usage)}</p>` : '';
    const variants = t.variants && t.variants.length ? `<details><summary>バリエーション</summary><ul>${t.variants.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></details>` : '';
    const pitfalls = t.pitfalls ? `<p class="muted"><strong>注意:</strong> ${esc(t.pitfalls)}</p>` : '';
    const notes = t.notes ? `<p class="muted"><strong>補足:</strong> ${esc(t.notes)}</p>` : '';
    const tv = t.tvSymbol ? `<a href="https://jp.tradingview.com/chart/?symbol=${encodeURIComponent(t.tvSymbol)}" target="_blank" rel="noopener">チャートを開く ↗</a>` : '';
    return `<div class="card term">
      <h4>${hi(t.title)}</h4>
      <div class="meta">${alias}</div>
      <p>${hi(t.definition||'')}</p>
      ${t.formula?`<p><strong>計算式:</strong> ${esc(t.formula)}</p>`:''}
      ${usage}${variants}${pitfalls}${notes}
      <div class="actions">${tv}</div>
    </div>`;
  }

  el.innerHTML = filtered.map(card).join('') || `<div class="card"><p>該当がありません。</p></div>`;

  // Hook up header search if present
  const hdr = document.getElementById('hdr-q');
  if(hdr){
    hdr.value = q;
    hdr.addEventListener('input', e => {
      const v = e.target.value;
      const url = new URL(location.href);
      url.searchParams.set('q', v);
      history.replaceState({}, '', url.toString());
      location.reload();
    });
  }
})();