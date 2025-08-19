// ==== 用語検索＆表示（カテゴリー見出し＋目次自動生成） ====
let TERMS_CACHE = null;
async function fetchTerms() {
  if (TERMS_CACHE) return TERMS_CACHE;
  const res = await fetch('data/terms.json');
  TERMS_CACHE = await res.json();
  return TERMS_CACHE;
}
function escapeHTML(s='') { return (''+s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function highlight(text, q) {
  if (!q) return escapeHTML(text);
  const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
  return escapeHTML(text).replace(re, '<mark>$1</mark>');
}
function slugify(str='') {
  return (str || 'その他').toString().trim().toLowerCase()
    .replace(/[（）()\s]+/g, '-')
    .replace(/[^\u3040-\u30ff\u4e00-\u9faf\w\-]+/g, '')
    .replace(/\-+/g, '-').replace(/^\-|\-$/g, '');
}
function termCard(t, q) {
  const alias = t.alias && t.alias.length ? `<span class="tag">別名: ${escapeHTML(t.alias.join(', '))}</span>` : '';
  const usage = t.usage ? `<p><strong>使い方:</strong> ${escapeHTML(t.usage)}</p>` : '';
  const variants = t.variants && t.variants.length ? `<details><summary>バリエーション</summary><ul>${t.variants.map(v=>`<li>${escapeHTML(v)}</li>`).join('')}</ul></details>` : '';
  const pitfalls = t.pitfalls ? `<p class="muted"><strong>注意:</strong> ${escapeHTML(t.pitfalls)}</p>` : '';
  const notes = t.notes ? `<p class="muted"><strong>補足:</strong> ${escapeHTML(t.notes)}</p>` : '';
  const tv = t.tvSymbol ? `<a href="https://jp.tradingview.com/chart/?symbol=${encodeURIComponent(t.tvSymbol)}" target="_blank" rel="noopener">チャートを開く ↗</a>` : '';
  return `
  <div class="card term">
    <h4 class="term-title">${highlight(t.title, q)}</h4>
    <div class="meta">
      ${t.category ? `<span class="tag">${escapeHTML(t.category)}</span>` : ''}
      ${alias}
    </div>
    <p>${highlight(t.definition || '', q)}</p>
    ${t.formula ? `<p><strong>計算式:</strong> ${escapeHTML(t.formula)}</p>` : ''}
    ${usage}
    ${variants}
    ${pitfalls}
    ${notes}
    <div class="actions">${tv}</div>
  </div>`;
}
function groupByCategory(items) {
  const map = new Map();
  for (const t of items) {
    const cat = t.category || 'その他';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(t);
  }
  return [...map.entries()]
    .sort((a,b)=> a[0].localeCompare(b[0], 'ja'))
    .map(([cat, arr]) => [cat, arr.sort((x,y)=> (x.title||'').localeCompare(y.title||'', 'ja'))]);
}
function renderTOC(categories) {
  const box = document.getElementById('toc-links');
  if (!box) return;
  box.innerHTML = categories.map(([cat, arr]) => {
    const id = 'cat-' + slugify(cat);
    return `<a href="#${id}" class="toc-link">${escapeHTML(cat)} <span class="count">(${arr.length})</span></a>`;
  }).join('') || `<span class="muted">（該当なし）</span>`;
  const links = [...box.querySelectorAll('.toc-link')];
  const targets = categories.map(([cat]) => document.getElementById('cat-' + slugify(cat))).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    const io = new IntersectionObserver(entries => {
      const first = entries.filter(e => e.isIntersecting).sort((a,b)=> b.intersectionRatio - a.intersectionRatio)[0];
      if (!first) return;
      const id = first.target.getAttribute('id');
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+id));
    }, { rootMargin: '-30% 0px -65% 0px', threshold: [0, 0.2, 0.5, 1] });
    targets.forEach(t => io.observe(t));
  }
}
async function render(q='') {
  const root = document.getElementById('results');
  const all = await fetchTerms();
  const key = (q || '').trim().toLowerCase();
  const filtered = !key ? all : all.filter(t => (
    (t.title||'') + ' ' + (t.alias||[]).join(' ') + ' ' + (t.definition||'') + ' ' + (t.usage||'') + ' ' + (t.pitfalls||'')
  ).toLowerCase().includes(key));
  const groups = groupByCategory(filtered);
  renderTOC(groups);
  root.innerHTML = groups.map(([cat, arr]) => {
    const id = 'cat-' + slugify(cat);
    const cards = arr.map(t => termCard(t, key)).join('');
    return `<section id="${id}" class="term-category">
      <h2 class="cat-heading">${escapeHTML(cat)}</h2>
      <div class="cat-group">${cards}</div>
    </section>`;
  }).join('') || `<div class="card"><p>該当がありません。</p></div>`;
}
window.renderTerms = render;
