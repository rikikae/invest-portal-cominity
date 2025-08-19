# Firebase Functions での自動取得
1) `firebase init functions` 済みのプロジェクトにこの `firebase/functions` を配置
2) 環境変数を設定：
   ```bash
   firebase functions:config:set finnhub_key="YOUR_KEY"
   ```
3) デプロイ：
   ```bash
   firebase deploy --only functions
   ```
4) 公開URL例：`https://<REGION>-<PROJECT>.cloudfunctions.net/picks`
5) フロント側：`js/config.js` に
   ```js
   window.PICKS_API = "https://<REGION>-<PROJECT>.cloudfunctions.net/picks";
   ```
