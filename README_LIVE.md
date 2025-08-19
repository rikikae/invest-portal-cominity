# 実データ連携（API/Firebase/サーバー集計）パッケージ

フロント：
- `picks.html`（表示名：株・銘柄）
- `js/config.js` … `window.PICKS_API` に本番のAPI URLを入れると即連携
- 未設定時は自動で Netlify Functions or Cloudflare Worker を推測
- 失敗時は `data/rankings.json` → サンプル → ティッカーテープの順でフォールバック

バックエンド（3択／併用可）：
1. **Cloudflare Workers**: `server/cloudflare-worker.js` をデプロイ、`FINNHUB_KEY` を設定、`/api/rankings` ルートに割当
2. **Netlify Functions**: `netlify/functions/rankings.js`、環境変数 `FINNHUB_KEY` 設定、同梱 `netlify.toml` で `/api/rankings` に向ける
3. **Firebase Functions**: `firebase/functions/index.mjs`、`functions:config:set finnhub_key=...`、`picksCron`（毎時）で Firestore にキャッシュ、HTTP `picks` で配信

銘柄リストやセクター構成は各サーバーコードの `SECTORS` を編集してください。
