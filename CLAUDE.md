# helloqooqtest

簡單留言板，用來測 qooq 本機部署。前後端同一個 Node server，零依賴。

## 技術棧
- Node 18+（內建 `http`，無 npm 套件）；資料存 JSON 檔（`DATA_FILE`，預設 `./data.json`）

## 啟動 / 測試
- 本機：`npm start`（PORT 預設 3000）
- 沒有自動化測試；手動：`curl localhost:3000/api/health` → `{"ok":true}`

## 目錄
- `server.js`：API（`GET/POST /api/messages`、`DELETE /api/messages/:id`、`GET /api/health`）+ 靜態檔
- `public/`：`index.html`、`app.js`（前端）
- `qooq.yaml`：qooq 部署設定（node template、`auto:3000`、volume 掛 `/app/data`）

## 部署（qooq 本機 GitOps）
- target/component：`helloqooqtest`（namespace `default`），目前 host port 19005
- 改完：`git add -A && git commit -m "..." && git push qooq`，約 30 秒內自動重部署
- 狀態：`qooq watch get helloqooqtest`、`qooq component ls`

## 地雷
- qooq-deploy skill 的 `wait-and-verify.sh --trigger` 用 curl 打 watcher 沒帶 token → 401「could not trigger」。
  改用 `qooq watch trigger helloqooqtest` + `qooq watch get` 查狀態。
