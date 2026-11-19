# 慢靈魂 tarot 網站

這個 repo 是慢靈魂的大眾占卜解答網站，根目錄的 `慢靈魂解答_<題目>.html` 都是解答頁，直接放在 `main`（使用者同意解答頁直接上傳到 `main`）。

## 使用者說「上傳」時的流程

解答頁是用 claude.ai 上的製作器「慢靈魂｜塔羅測驗產生器」做的：
https://claude.ai/artifact/XTM5brJrKxe2McUn4BmqKg
製作器不要搬、不要改（它的 AI 出題／解答／調頻和雲端存檔只在 claude.ai 上能用）。

1. 用 Artifact 工具 `action: "read"` 讀製作器，得到存好的完整 HTML 路徑（tool-results 裡的 artifact-*.html）。
2. 用 ArtifactData `get` 抓雲端這一期：`url` 同上、`collection: "data/users/me"`、`doc_id: "generator"`，加 `out_dir` 存成 JSON。
3. 執行：
   `NODE_PATH=$(npm root -g) node .tools/build-answer.js <製作器.html> <generator.json> <輸出資料夾>`
   會用製作器自己的 `buildWebA` 產生跟「⬇️ 下載解答網頁 HTML」一樣的檔案，檔名也一樣。
   - `NO_ANSWERS`：三個解答還沒寫好。
   - `NO_IMAGES`：牌面用的是使用者自己上傳的照片（只存在他的瀏覽器，雲端沒有），做出來的圖會不一樣。請使用者在製作器按「⬇️ 下載解答網頁 HTML」，把下載的檔案傳給你，直接上傳那個檔案。
   - `NO_TUNE` / `NO_THEME`：請使用者在製作器按一次「👀 預覽解答網頁」（會配調頻、決定色調並存雲端），再重跑。
4. 跟使用者確認題目對（雲端存的是製作器「目前打開的那一期」）。同名檔案已存在時先問要不要覆蓋。
5. 把檔案放到 repo 根目錄，commit 訊息用 `新增解答：<題目>`，推到 `main`。
6. 給使用者網址：`https://slowsoul25.github.io/tarot/<檔名 URL 編碼>`（若網站網址不同以使用者為準）。
