async function loadRankings() {
  try {
    const res = await fetch('data/rankings.json?_=' + Date.now());
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('rankings load failed', e);
    return null;
  }
}

function sectorOptions(sectors) {
  const s = document.getElementById('sector');
  s.innerHTML = '';
  Object.keys(sectors).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    s.appendChild(opt);
  });
}

function renderTop(listEl, rows) {
  listEl.innerHTML = '';
  rows.slice(0,3).forEach((r,i) => {
    const div = document.createElement('div');
    div.className = 'rank-item';
    const chg = r.changePct || 0;
    const chgCls = chg >= 0 ? 'up' : 'down';
    div.innerHTML = `
      <div class="left">
        <div class="rank-num">${i+1}</div>
        <div><strong>${r.symbol}</strong> <span class="small">${r.name || ''}</span></div>
      </div>
      <div class="rank-chg ${chgCls}">${chg>0?'+':''}${chg.toFixed(2)}%</div>
    `;
    listEl.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const stockList = document.getElementById('stock-list');
  const indexList = document.getElementById('index-list');
  const sectorSel = document.getElementById('sector');
  const universeSel = document.getElementById('universe');
  const metricSel = document.getElementById('metric');

  const data = await loadRankings();
  if (!data) {
    stockList.innerHTML = '<p>データ取得に失敗しました。</p>';
    indexList.innerHTML = '<p>データ取得に失敗しました。</p>';
    return;
  }
  sectorOptions(data.sectors);

  function update() {
    const sec = data.sectors[sectorSel.value];
    if (!sec) return;
    // sort by metric if exists, else fallback changePct
    const key = metricSel.value;
    const stocks = (sec.stocks || []).slice().sort((a,b) => (b[key]??0)-(a[key]??0));
    const indices = (sec.indices || []).slice().sort((a,b) => (b[key]??0)-(a[key]??0));
    renderTop(stockList, stocks);
    renderTop(indexList, indices);
  }

  sectorSel.addEventListener('change', update);
  universeSel.addEventListener('change', () => {
    // Hook: swap dataset based on universe (jp/us/world) -> replace data source here
    update();
  });
  metricSel.addEventListener('change', update);

  // init selections
  sectorSel.selectedIndex = 0;
  update();
});