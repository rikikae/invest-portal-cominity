// Robust live data with graceful fallbacks
window.PICKS_SAMPLE = {"date": "2025-08-19", "sectors": {"テクノロジー": {"stocks": [{"symbol": "AAPL", "name": "Apple", "changePct": 1.9, "price": 232.1}, {"symbol": "MSFT", "name": "Microsoft", "changePct": 1.5, "price": 455.2}, {"symbol": "NVDA", "name": "NVIDIA", "changePct": 1.2, "price": 120.4}], "indices": [{"symbol": "QQQ", "name": "Invesco QQQ", "changePct": 1.6, "price": 480.7}, {"symbol": "XLK", "name": "Tech Select Sector SPDR", "changePct": 1.4, "price": 232.6}, {"symbol": "VGT", "name": "Vanguard IT ETF", "changePct": 1.3, "price": 505.1}]}, "金融": {"stocks": [{"symbol": "JPM", "name": "JPMorgan", "changePct": 1.1, "price": 212.3}, {"symbol": "BAC", "name": "Bank of America", "changePct": 0.9, "price": 41.2}, {"symbol": "GS", "name": "Goldman Sachs", "changePct": 0.8, "price": 422.8}], "indices": [{"symbol": "XLF", "name": "Financials SPDR", "changePct": 0.7, "price": 44.1}, {"symbol": "VFH", "name": "Vanguard Financials ETF", "changePct": 0.6, "price": 100.2}, {"symbol": "KBE", "name": "SPDR Bank ETF", "changePct": 0.5, "price": 45.7}]}, "エネルギー": {"stocks": [{"symbol": "XOM", "name": "Exxon Mobil", "changePct": 1.3, "price": 132.0}, {"symbol": "CVX", "name": "Chevron", "changePct": 1.1, "price": 168.4}, {"symbol": "SLB", "name": "Schlumberger", "changePct": 0.9, "price": 48.9}], "indices": [{"symbol": "XLE", "name": "Energy SPDR", "changePct": 1.0, "price": 94.5}, {"symbol": "VDE", "name": "Vanguard Energy ETF", "changePct": 0.9, "price": 127.3}, {"symbol": "IXC", "name": "iShares Global Energy", "changePct": 0.8, "price": 46.0}]}}};

function getApiEndpoint() {
  // 1) Explicit override via global var
  if (window.PICKS_API) return window.PICKS_API;
  // 2) Netlify Functions default path
  if (location.pathname.startsWith('/.netlify') || location.hostname.endsWith('netlify.app')) {
    return '/.netlify/functions/rankings';
  }
  // 3) Cloudflare Workers (or any proxy) default path
  return '/api/rankings';
}

async function fetchLive() {
  try {
    const url = getApiEndpoint();
    const res = await fetch(url, { cache: 'no-store', mode: 'cors' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('Live fetch failed:', e);
    return null;
  }
}

async function fetchLocal() {
  try {
    if (location.protocol === 'file:') return null; // browsers block file:// fetch reliably
    const res = await fetch('data/rankings.json?_=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('Local JSON fallback failed:', e);
    return null;
  }
}

function injectTickerTapeFallback(container) {
  const wrap = document.createElement('div');
  wrap.style.padding = "0"; wrap.style.borderRadius = "12px"; wrap.style.overflow = "hidden";
  wrap.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
  const tvWrap = document.createElement('div');
  tvWrap.className = 'tradingview-widget-container';
  const wid = document.createElement('div');
  wid.className = 'tradingview-widget-container__widget';
  tvWrap.appendChild(wid);
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
  script.async = true;
  script.innerHTML = JSON.stringify({
    symbols: [
      { proName: "FOREXCOM:USDJPY", title: "USD/JPY" },
      { proName: "OANDA:JP225USD", title: "Nikkei 225" },
      { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
      { proName: "NASDAQ:NDX", title: "NASDAQ 100" },
      { proName: "TVC:GOLD", title: "Gold" },
      { proName: "TVC:USOIL", title: "WTI" }
    ],
    showSymbolLogo: true, colorTheme: "light", isTransparent: false, displayMode: "adaptive", locale: "ja"
  });
  tvWrap.appendChild(script);
  wrap.appendChild(tvWrap);
  container.appendChild(wrap);
}

function showBanner(msg) {
  let b = document.getElementById('picks-banner');
  if (!b) {
    b = document.createElement('div');
    b.id = 'picks-banner';
    b.style.background = '#fff7cc';
    b.style.color = '#665200';
    b.style.border = '1px solid #ffe58a';
    b.style.borderRadius = '10px';
    b.style.padding = '8px 12px';
    b.style.margin = '8px 0';
    document.querySelector('main').prepend(b);
  }
  b.textContent = msg;
}

function sectorOptions(sectors) {
  const s = document.getElementById('sector');
  s.innerHTML = '';
  Object.keys(sectors).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
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
      <div class="rank-chg ${chgCls}">${chg>0?'+':''}${(typeof chg==='number'?chg.toFixed(2):chg)}%</div>
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

  let data = await fetchLive();
  if (!data) {
    
    data = await fetchLocal();
  }
  if (!data && window.PICKS_SAMPLE) {
    data = window.PICKS_SAMPLE;
  }

  if (!data) {
    stockList.innerHTML = '';
    indexList.innerHTML = '';
    // Add ticker tape fallback
    injectTickerTapeFallback(document.querySelector('.rank-wrap'));
    return;
  }

  sectorOptions(data.sectors);

  function update() {
    const sec = data.sectors[sectorSel.value];
    if (!sec) return;
    const key = metricSel.value;
    const stocks = (sec.stocks || []).slice().sort((a,b) => (b[key]??0)-(a[key]??0));
    const indices = (sec.indices || []).slice().sort((a,b) => (b[key]??0)-(a[key]??0));
    renderTop(stockList, stocks);
    renderTop(indexList, indices);
  }

  sectorSel.addEventListener('change', update);
  universeSel.addEventListener('change', update);
  metricSel.addEventListener('change', update);

  sectorSel.selectedIndex = 0;
  update();
});
