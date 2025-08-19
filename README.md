# Category 404 Hotfix — 2025-08-19

このパックには：
- `assets/app.js`（404時に**自動フォールバック**。カテゴリページが無い場合は `glossary.html` の同カテゴリ見出しにスクロール）
- 標準カテゴリのページ（category-テクニカル.html, category-ファンダメンタルズ.html, category-為替.html, category-リスク・資金管理.html, category-ローソク足・型.html, category-理論・法則.html, category-その他.html）
- `assets/app-category.js`（カテゴリページ用レンダラー）

## 使い方
1) ZIPを解凍
2) リポジトリのトップで **Add file → Upload files**
   - `assets/app.js` と `assets/app-category.js` を **上書き**
   - `category-*.html` を **追加**
3) **Commit changes**
4) 目次をクリック → 404にならず、カテゴリページに遷移（存在しなければ総合ページ内へフォールバック）

> ファイル名が異なる場合は、`assets/app.js` の `CAT_TO_PAGE` を編集して揃えてください。
