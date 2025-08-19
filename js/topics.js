document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('topics-grid');
  if (!grid) return;

  function renderTickerTapeFallback() {
    grid.innerHTML = "";
    const wrap = document.createElement('div');
    wrap.style.padding = "0";
    wrap.style.borderRadius = "12px";
    wrap.style.overflow = "hidden";
    wrap.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';
    const tv = document.createElement('div');
    tv.className = 'tradingview-widget-container__widget';
    container.appendChild(tv);
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
      showSymbolLogo: true,
      colorTheme: "light",
      isTransparent: false,
      displayMode: "adaptive",
      locale: "ja"
    });
    container.appendChild(script);
    wrap.appendChild(container);
    grid.appendChild(wrap);
  }

  try {
    const res = await fetch("https://api.tradingeconomics.com/markets/snapshot?c=guest:guest&f=json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const picks = (data || []).filter(d => ["Stock","Index","Currency","Commodity"].includes(d.Category)).slice(0, 6);
    if (!picks.length) throw new Error("no data");
    grid.innerHTML = "";
    picks.forEach(item => {
      const div = document.createElement('div');
      div.className = 'card';
      const chg = (item.DayChange || 0);
      const sign = chg > 0 ? "+" : "";
      div.innerHTML = `<strong>${item.Name || "-"}</strong><br>${item.Price ?? "-"} (${sign}${chg}%)`;
      grid.appendChild(div);
    });
  } catch (e) {
    console.error("topics fetch failed:", e);
    // Fallback to ticker tape
    renderTickerTapeFallback();
  }
});