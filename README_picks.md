# デイリー・ピックス（本番自動取得）

フロントは `picks.html` / `js/picks.js` が `/api/rankings` を叩いてデータを取得します。

## 1) Cloudflare Workers で動かす場合（推奨）
- `server/cloudflare-worker.js` を Workers にデプロイ
- 環境変数 `FINNHUB_KEY` を設定（FinnhubのAPIキー）
- ルーティング：`/api/*` をこのWorkerに割当て
- 静的サイト（本ZIPの中身）は任意のホスティング（Pages/Netlify/GitHub Pages など）
- これで `picks.html` から自動取得されます

## 2) Netlify Functions の場合
- このZIPをNetlifyにデプロイ
- サイトの環境変数に `FINNHUB_KEY` を設定
- Functionsが自動で `/.netlify/functions/rankings` で動作
- `netlify.toml` で `/api/rankings` へリダイレクト設定（例を下記に記載）

### netlify.toml 例
[build]
  functions = "netlify/functions"
[[redirects]]
  from = "/api/rankings"
  to = "/.netlify/functions/rankings"
  status = 200

## データロジック
- セクターごとに代表銘柄をいくつかクエリし、**日次騰落率（c vs pc）**で並び替え上位3を返します
- ETF/インデックスは代表ETF（例：QQQ, XLK, XLEなど）で同様に算出
- セクターや銘柄の定義は serverless コード内の `SECTORS` で編集可能

## 備考
- API呼び出し数を抑えるため、代表銘柄リスト方式を採用（必要に応じて拡張可能）
- CORSは `Access-Control-Allow-Origin: *` を付与済み
- キーが未設定のときはフロントが `data/rankings.json` に自動フォールバック

