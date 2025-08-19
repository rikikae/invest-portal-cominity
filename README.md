# 投資ポータル 完全版 — 2025-08-19

このパックは **GitHub Pages にそのままドラッグ＆ドロップ**で動く完成形です。

## 収録
- `index.html`：ローソク足の主要チャート（USDJPY / NI225 / DJI）
- `glossary.html`：用語辞典（検索＋カテゴリー見出し＋目次→カテゴリページ）
- `econ.html`：リアルタイム経済ダッシュボード（概況・為替クロス・ヒートマップ・経済カレンダー）
- `category-*.html`：`data/terms.json` のカテゴリから自動生成
- `assets/`：スタイル＆JS
- `data/terms.json`：基礎用語＋酒田五法＋理論・法則を収録

## 導入（3分）
1. ZIPを解凍して中身をリポジトリ直下に**上書きアップロード**
2. **Commit changes**
3. 数分後に公開URLを強制リロード（Cmd/Ctrl+Shift+R）

## カスタマイズ
- 用語追加：`data/terms.json` にオブジェクトを追加（title/definition/category など） → 目次＆カテゴリページに自動反映
- チャート銘柄：`index.html` の TradingViewウィジェットの `symbol` を変更
- 配色/列数：`assets/style.css` の CSS変数や `.cat-group` の列数を調整

困ったらURLを教えてください。あなたのリポ構成に合わせて差分パッチを作ります。
