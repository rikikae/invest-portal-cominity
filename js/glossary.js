document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const tabs = document.getElementById('tabs');
  const search = document.getElementById('g-search');
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('close');

  const CATS = ['すべて', ...Array.from(new Set(window.TERMS.map(t => t.category)))];
  let current = 'すべて';

  CATS.forEach((c,i) => {
    const b = document.createElement('button');
    b.className = 'tab' + (i===0 ? ' active' : '');
    b.textContent = c;
    b.addEventListener('click', () => {
      current = c;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      b.classList.add('active');
      render();
    });
    tabs.appendChild(b);
  });

  function card(t) {
    const d = document.createElement('div');
    d.className = 'card-g';
    d.innerHTML = `<div class="badge">${t.category}</div><h3>${t.name}</h3><p>${t.desc}</p>`;
    d.addEventListener('click', () => openModal(t));
    return d;
  }

  function openModal(t) {
    document.getElementById('m-title').textContent = t.name;
    document.getElementById('m-cat').textContent = t.category;
    document.getElementById('m-desc').textContent = t.desc;
    // formula chips
    const formula = document.getElementById('m-formula');
    formula.innerHTML = '';
    (t.formula || []).forEach(s => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = s;
      formula.appendChild(chip);
    });
    // usage / pitfalls
    const usage = document.getElementById('m-usage');
    usage.innerHTML = '';
    (t.usage || []).forEach(s => {
      const li = document.createElement('li'); li.textContent = s; usage.appendChild(li);
    });
    const pitfalls = document.getElementById('m-pitfalls');
    pitfalls.innerHTML = '';
    (t.pitfalls || []).forEach(s => {
      const li = document.createElement('li'); li.textContent = s; pitfalls.appendChild(li);
    });
    // image
    const img = document.getElementById('m-img');
    img.src = t.img;
    document.getElementById('m-caption').textContent = t.caption || '';
    modal.style.display = 'flex';
  }

  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

  function render() {
    const q = (search.value || '').toLowerCase();
    grid.innerHTML = '';
    window.TERMS
      .filter(t => current === 'すべて' || t.category === current)
      .filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
      .forEach(t => grid.appendChild(card(t)));
  }
  search.addEventListener('input', render);

  const params = new URLSearchParams(location.search);
  const qParam = params.get('q');
  if (qParam) search.value = qParam;
  render();
  if (qParam) {
    const t = window.TERMS.find(x => x.name === qParam);
    if (t) openModal(t);
  }
});