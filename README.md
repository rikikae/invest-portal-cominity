# 投資ポータル（最適化パック） — 2025-08-18

このパックは以下を含みます：
- ダーク×ネオンのモダンUI＋読みやすいタイポ（`assets/style.css`）
- 用語辞典の **カテゴリー見出し＋自動目次**（`assets/app.js` / `glossary.html`）
- 「酒田五法」を含む拡充済み `data/terms.json`（総論, 三山, 三川, 三兵, 三空, 三法 収録）
- 主要チャート＆経済カレンダー（`index.html`）

## 導入方法（ドラッグ＆ドロップ）
1. ZIPを解凍し、中身をGitHubリポジトリの **ルート直下** にアップロード（上書きOK）
   - `index.html`
   - `glossary.html`
   - `assets/` フォルダ
   - `data/` フォルダ
2. **Commit changes**
3. 数分後、公開ページに反映（強制リロード：Cmd/Ctrl+Shift+R）

## カスタマイズ
- 銘柄追加：`index.html` の `embed-widget-symbol-overview.js` 内の `symbols` 配列
- 色味変更：`assets/style.css` の `--neon1 / --neon2 / --brand / --accent`
- 用語追加：`data/terms.json` にオブジェクトを追加（`title/definition/category/alias/...`）

困ったら、このREADMEを添えて私に聞いてください。すぐ差分を用意します。
