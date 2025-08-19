// Netlify Function: /.netlify/functions/rankings
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const SECTORS = {
  "テクノロジー": { stocks: ["AAPL","MSFT","NVDA","AMD","GOOGL","META"], indices: ["QQQ","XLK","VGT"] },
  "金融": { stocks: ["JPM","BAC","GS","MS","WFC","C"], indices: ["XLF","VFH","KBE"] },
  "エネルギー": { stocks: ["XOM","CVX","SLB","COP","EOG","PSX"], indices: ["XLE","VDE","IXC"] }
};
async function quote(sym, key) {
  const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`);
  if (!r.ok) throw new Error('Finnhub ' + r.status);
  const j = await r.json();
  const price = j.c ?? null, prev = j.pc ?? null;
  const changePct = (price && prev) ? (price - prev) / prev * 100 : 0;
  return { symbol: sym, name: sym, price, changePct };
}
exports.handler = async () => {
  try {
    const key = process.env.FINNHUB_KEY;
    if (!key) return { statusCode: 500, body: JSON.stringify({ error: 'FINNHUB_KEY not set' }) };
    const out = { date: new Date().toISOString().slice(0,10), sectors: {} };
    for (const k of Object.keys(SECTORS)) {
      const defs = SECTORS[k];
      const s = await Promise.all(defs.stocks.map(s => quote(s, key).catch(_ => ({symbol:s, name:s, price:null, changePct:0}))));
      const i = await Promise.all(defs.indices.map(s => quote(s, key).catch(_ => ({symbol:s, name:s, price:null, changePct:0}))));
      out.sectors[k] = {
        stocks: s.sort((a,b)=>b.changePct-a.changePct).slice(0,3),
        indices: i.sort((a,b)=>b.changePct-a.changePct).slice(0,3)
      };
    }
    return { statusCode: 200, headers: { 'content-type':'application/json', 'Access-Control-Allow-Origin':'*', 'Cache-Control':'no-store' }, body: JSON.stringify(out) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};