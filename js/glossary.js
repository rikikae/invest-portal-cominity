
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const tabs = document.getElementById('tabs');
  const search = document.getElementById('g-search');
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('close') || (()=>{});
  const body = document.getElementById('modal-body');

  const TERMS = (window.TERMS || []).slice();

  // ---------- Helpers ----------
  const uniq = (arr) => Array.from(new Set(arr));
  const norm = (s) => (s || '').toString().toLowerCase();
  const byName = (a,b) => a.name.localeCompare(b.name, 'ja');

  function badge(text, cls='') {
    const span = document.createElement('span');
    span.className = 'badge ' + cls;
    span.textContent = text;
    return span;
  }

  function section(title, innerHTML) {
    const wrap = document.createElement('section');
    const h = document.createElement('h3');
    h.textContent = title;
    wrap.appendChild(h);
    const div = document.createElement('div');
    div.innerHTML = innerHTML;
    wrap.appendChild(div);
    return wrap;
  }

  function toList(items) {
    if (!items || !items.length) return '';
    return '<ul>' + items.map(x => `<li>${x}</li>`).join('') + '</ul>';
  }

  function renderModal(t) {
    body.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'modal-head';
    head.appendChild(badge(t.category || 'その他', 'cat'));
    const title = document.createElement('h2');
    title.textContent = t.name;
    head.appendChild(title);
    if (t.img) {
      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = t.img;
      img.alt = t.name;
      fig.appendChild(img);
      const cap = document.createElement('figcaption');
      cap.textContent = t.name;
      fig.appendChild(cap);
      head.appendChild(fig);
    }
    body.appendChild(head);

    // auto sections: desc / details / usage / points / advice / pitfalls / examples / notes / links
    if (t.desc) body.appendChild(section('概要', `<p>${t.desc}</p>`));
    if (t.details) body.appendChild(section('詳細解説', Array.isArray(t.details) ? toList(t.details) : `<p>${t.details}</p>`));
    if (t.usage) body.appendChild(section('使い方', Array.isArray(t.usage) ? toList(t.usage) : `<p>${t.usage}</p>`));
    if (t.points) body.appendChild(section('使い方のポイント', Array.isArray(t.points) ? toList(t.points) : `<p>${t.points}</p>`));
    if (t.advice) body.appendChild(section('実戦アドバイス', Array.isArray(t.advice) ? toList(t.advice) : `<p>${t.advice}</p>`));
    if (t.pitfalls) body.appendChild(section('落とし穴', Array.isArray(t.pitfalls) ? toList(t.pitfalls) : `<p>${t.pitfalls}</p>`));
    if (t.examples) body.appendChild(section('例', Array.isArray(t.examples) ? toList(t.examples) : `<p>${t.examples}</p>`));
    if (t.notes) body.appendChild(section('補足', Array.isArray(t.notes) ? toList(t.notes) : `<p>${t.notes}</p>`));
    if (t.links) {
      const links = Array.isArray(t.links) ? t.links : [t.links];
      body.appendChild(section('関連リンク', toList(links.map(u => `<a href="${u}" target="_blank">${u}</a>`))));
    }
    modal.style.display = 'block';
  }

  function closeModal() {
    modal.style.display = 'none';
    body.innerHTML = '';
    history.replaceState(null, '', location.pathname);
  }
  if (closeBtn && closeBtn.addEventListener) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // ---------- Classification (chips with counts) ----------
  const cats = uniq(TERMS.map(t => t.category || 'その他')).sort((a,b)=>a.localeCompare(b,'ja'));
  const allChip = document.createElement('button');
  allChip.className = 'chip active';
  allChip.textContent = `すべて (${TERMS.length})`;
  tabs.appendChild(allChip);

  const state = { cat: 'すべて', q: '' };

  cats.forEach(c => {
    const count = TERMS.filter(t => (t.category||'その他') === c).length;
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = `${c} (${count})`;
    b.addEventListener('click', () => {
      state.cat = c;
      Array.from(tabs.children).forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      render();
    });
    tabs.appendChild(b);
  });

  allChip.addEventListener('click', () => {
    state.cat = 'すべて';
    Array.from(tabs.children).forEach(x=>x.classList.remove('active'));
    allChip.classList.add('active');
    render();
  });

  // ---------- Grid cards ----------
  function card(t) {
    const el = document.createElement('div');
    el.className = 'card';
    const h = document.createElement('h4');
    h.textContent = t.name;
    el.appendChild(h);
    const row = document.createElement('div');
    row.className = 'card-meta';
    row.appendChild(badge(t.category || 'その他'));
    el.appendChild(row);
    if (t.desc) {
      const p = document.createElement('p');
      p.textContent = t.desc;
      el.appendChild(p);
    }
    el.addEventListener('click', () => {
      if (t.url) { window.location.href = t.url; return; }
      renderModal(t);
      history.replaceState(null, '', `?q=${encodeURIComponent(t.name)}`);
    });
    return el;
  }

  function render() {
    const q = norm(search.value);
    grid.innerHTML = '';
    TERMS
      .slice()
      .sort(byName)
      .filter(t => state.cat === 'すべて' || (t.category || 'その他') === state.cat)
      .filter(t => !q || norm(t.name).includes(q) || norm(t.desc).includes(q))
      .forEach(t => grid.appendChild(card(t)));
  }

  // deep link
  const params = new URLSearchParams(location.search);
  const qParam = params.get('q');
  if (qParam) search.value = qParam;
  search.addEventListener('input', render);
  render();
  if (qParam) {
    const t = TERMS.find(x => x.name === qParam);
    if (t) renderModal(t);
  }
});
