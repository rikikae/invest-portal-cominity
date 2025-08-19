// Category 404 Hotfix:
// 1) TOC links point to category pages via explicit mapping
// 2) If the target page is missing (404), fallback to glossary.html in-page anchor

let TERMS_CACHE = null;
async function fetchTerms() {
  if (TERMS_CACHE) return TERMS_CACHE;
  const res = await fetch('data/terms.json');
  TERMS_CACHE = await res.json();
  return TERMS_CACHE;
}
function esc(s=''){return (''+s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',\"'\":'&#39;','\"':'&quot;'}[c]));}
function hi(text,q){ if(!q) return esc(text); const re=new RegExp('('+q.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')+')','ig'); return esc(text).replace(re,'<mark>$1</mark>'); }
function slugify(str=''){ return (str||'その他').toString().trim().toLowerCase().replace(/[（）()\\s]+/g,'-').replace(/[^\\u3040-\\u30ff\\u4e00-\\u9faf\\w\\-]+/g,'').replace(/\\-+/g,'-').replace(/^\\-|\\-$/g,''); }

// ✅ Mapping (edit here if your file names differ)
const CAT_TO_PAGE = {
  "テクニカル": "category-テクニカル.html",
  "ファンダメンタルズ": "category-ファンダメンタルズ.html",
  "為替": "category-為替.html",
  "リスク・資金管理": "category-リスク-資金管理.html",
  "ローソク足・型": "category-ローソク足・型.html",
  "理論・法則": "category-理論・法則.html",
  "その他": "category-その他.html"
};

function groupByCategory(items){
  const map = new Map();
  for(const t of items){
    const cat = t.category || 'その他';
    if(!map.has(cat)) map.set(cat, []);
    map.get(cat).push(t);
  }
  return [...map.entries()]
    .sort((a,b)=> a[0].localeCompare(b[0],'ja'))
    .map(([cat,arr])=>[cat, arr.sort((x,y)=>(x.title||'').localeCompare(y.title||'', 'ja'))]);
}

function renderTOC(categories){
  const box = document.getElementById('toc-links'); if(!box) return;
  box.innerHTML = categories.map(([cat, arr])=>{
    const href = CAT_TO_PAGE[cat] || `category-${slugify(cat)}.html`;
    return `<a href="${href}" class="toc-link" data-cat="${esc(cat)}">${esc(cat)} <span class="count">(${arr.length})</span></a>`;
  }).join('') || `<span class="muted">（該当なし）</span>`;

  // Graceful fallback: check existence on click; if 404, go to in-page anchor
  box.addEventListener('click', async (e) => {
    const a = e.target.closest('a.toc-link');
    if(!a) return;
    const href = a.getAttribute('href');
    const cat = a.getAttribute('data-cat');
    try {
      const res = await fetch(href, { method: 'HEAD', cache: 'no-store' });
      if (res.ok) return; // let browser navigate
      // fallback
      e.preventDefault();
      const id = 'cat-' + slugify(cat);
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch(err){
      // network issue -> fallback
      e.preventDefault();
      const id = 'cat-' + slugify(cat);
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function card(t,q){
  const alias = t.alias && t.alias.length ? `<span class="tag">別名: ${esc(t.alias.join(', '))}</span>` : '';
  const usage = t.usage ? `<p><strong>使い方:</strong> ${esc(t.usage)}</p>` : '';
  const variants = t.variants && t.variants.length ? `<details><summary>バリエーション</summary><ul>${t.variants.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></details>` : '';
  const pitfalls = t.pitfalls ? `<p class="muted"><strong>注意:</strong> ${esc(t.pitfalls)}</p>` : '';
  const notes = t.notes ? `<p class="muted"><strong>補足:</strong> ${esc(t.notes)}</p>` : '';
  const tv = t.tvSymbol ? `<a href="https://jp.tradingview.com/chart/?symbol=${encodeURIComponent(t.tvSymbol)}" target="_blank" rel="noopener">チャートを開く ↗</a>` : '';
  return `<div class="card term">
    <h4 class="term-title">${hi(t.title, q)}</h4>
    <div class="meta">${t.category?`<span class="tag">${esc(t.category)}</span>`:''}${alias}</div>
    <p>${hi(t.definition||'', q)}</p>
    ${t.formula?`<p><strong>計算式:</strong> ${esc(t.formula)}</p>`:''}
    ${usage}${variants}${pitfalls}${notes}
    <div class="actions">${tv}</div>
  </div>`;
}

async function render(q=''){
  const root = document.getElementById('results');
  const all = await fetchTerms();
  const key = (q||'').trim().toLowerCase();
  const filtered = !key ? all : all.filter(t => ((t.title||'')+' '+(t.alias||[]).join(' ')+' '+(t.definition||'')+' '+(t.usage||'')+' '+(t.pitfalls||'')).toLowerCase().includes(key));
  const groups = groupByCategory(filtered);
  // For in-page fallback anchors
  root.innerHTML = groups.map(([cat,arr])=>{
    const id = 'cat-' + slugify(cat);
    const cards = arr.map(t=> card(t, key)).join('');
    return `<section id="${id}" class="term-category"><h2 class="cat-heading">${esc(cat)}</h2><div class="cat-group">${cards}</div></section>`;
  }).join('') || `<div class="card"><p>該当がありません。</p></div>`;
  renderTOC(groups);
}
window.renderTerms = render;
