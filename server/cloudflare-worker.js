// Cloudflare Worker: /api/rankings (on-demand live fetch)
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/rankings')) return new Response('Not Found', {status:404});
    const key = env.FINNHUB_KEY;
    if (!key) return new Response(JSON.stringify({ error: 'FINNHUB_KEY not set' }), { status: 500, headers: { 'content-type':'application/json' }});

    const SECTORS = {
      "テクノロジー": { stocks: ["AAPL","MSFT","NVDA","AMD","GOOGL","META"], indices: ["QQQ","XLK","VGT"] },
      "金融": { stocks: ["JPM","BAC","GS","MS","WFC","C"], indices: ["XLF","VFH","KBE"] },
      "エネルギー": { stocks: ["XOM","CVX","SLB","COP","EOG","PSX"], indices: ["XLE","VDE","IXC"] }
    };

    async function quote(sym) {
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`);
      if (!r.ok) throw new Error('Finnhub ' + r.status);
      const j = await r.json();
      const price = j.c ?? null, prev = j.pc ?? null;
      const changePct = (price && prev) ? (price - prev) / prev * 100 : 0;
      return { symbol: sym, name: sym, price, changePct };
    }

    async function buildSector(sector) {
      const defs = SECTORS[sector];
      const s = await Promise.all(defs.stocks.map(s => quote(s).catch(_ => ({symbol:s, name:s, price:null, changePct:0}))));
      const i = await Promise.all(defs.indices.map(s => quote(s).catch(_ => ({symbol:s, name:s, price:null, changePct:0}))));
      return {
        stocks: s.sort((a,b)=>b.changePct-a.changePct).slice(0,3),
        indices: i.sort((a,b)=>b.changePct-a.changePct).slice(0,3)
      };
    }

    const sectors = {};
    for (const k of Object.keys(SECTORS)) {
      sectors[k] = await buildSector(k);
    }
    return new Response(JSON.stringify({ date: new Date().toISOString().slice(0,10), sectors }), {
      headers: { 'content-type':'application/json', 'Access-Control-Allow-Origin':'*', 'Cache-Control':'no-store' }
    });
  }
}