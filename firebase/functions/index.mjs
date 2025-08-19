// Firebase Functions: scheduled fetch -> Firestore, HTTPS endpoint /picks
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp();
const db = admin.firestore();

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

export const picksCron = functions.pubsub.schedule('every 60 minutes').timeZone('Asia/Tokyo').onRun(async () => {
  const key = process.env.FINNHUB_KEY || process.env.finnhub_key;
  if (!key) throw new Error('FINNHUB_KEY not set');
  const out = { date: new Date().toISOString().slice(0,10), sectors: {} };
  for (const k of Object.keys(SECTORS)) {
    const defs = SECTORS[k];
    const s = await Promise.all(defs.stocks.map(s => quote(s, key).catch(_ => ({symbol:s, name:s, price:null, changePct:0}))));
    const i = await Promise.all(defs.indices.map(s => quote(s, key).catch(_ => ({symbol:s, name:s, price:null, changePct:0}))));
    out.sectors[k] = { stocks: s.sort((a,b)=>b.changePct-a.changePct).slice(0,3), indices: i.sort((a,b)=>b.changePct-a.changePct).slice(0,3) };
  }
  await db.collection('picks').doc('latest').set(out, { merge: true });
  return null;
});

export const picks = functions.https.onRequest(async (req, res) => {
  try {
    const doc = await db.collection('picks').doc('latest').get();
    if (!doc.exists) return res.status(404).json({ error: 'No data' });
    res.set('Access-Control-Allow-Origin', '*');
    return res.json(doc.data());
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
