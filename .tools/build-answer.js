// 用「慢靈魂｜塔羅測驗產生器」本身的程式，把雲端存的這一期做成解答網頁 HTML。
// 用法: node .tools/build-answer.js <製作器.html> <generator.json> <輸出資料夾>
// generator.json = 製作器雲端資料 data/users/me/generator（ArtifactData get 取得）
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const [maker, stateFile, outDir] = process.argv.slice(2);
if (!maker || !stateFile || !outDir) { console.error('usage: build-answer.js maker.html generator.json outDir'); process.exit(2); }

const HOOK = `
window.__mk=async()=>{
  const q=S.title.replace(/\\n/g,'');
  const ans={};['A','B','C'].forEach(L=>ans[L]={head:(S['ans'+L+'Head']||'').replace(/\\n/g,''),body:S['ans'+L+'Body']||'',act:''});
  if(!['A','B','C'].every(L=>ans[L].body.trim()))throw new Error('NO_ANSWERS: 三個解答還沒寫好');
  const key=JSON.stringify([q,S.draw||null]);
  if(!(S.webTune&&S.webTune.k===key&&['A','B','C'].every(L=>okT(S.webTune.t[L]))))throw new Error('NO_TUNE: 這一期還沒在製作器按過「預覽解答網頁」或「下載解答網頁」，調頻還沒配');
  ['A','B','C'].forEach(L=>ans[L].tune=S.webTune.t[L]);
  if(S.webThemeFor!==q)throw new Error('NO_THEME: 這一期還沒在製作器按過「預覽」或「下載」，色調還沒決定');
  const rec={title:q,intro:(S.introMain||'').replace(/\\s*\\n+\\s*/g,'，'),answers:ans,theme:ORDT[S.webThemeIdx],t:Date.now(),postDate:S.postDate||'',titleLines:two(S.title),cardStyle:S.cardStyle,optImg:Object.assign({},S.optImg||{}),bgId:(typeof curBgId==='function'?curBgId():S.bgId)};
  if(S.cardStyle==='lib'&&!['a','b','c'].every(k=>(S.photos&&S.photos[k])||byId((S.optImg||{})[k])))throw new Error('NO_IMAGES: 這一期的牌面是使用者自己上傳的照片，照片只存在他的瀏覽器、沒有存到雲端，這個工具做不出一樣的圖');
  if(S.hasBgUp)throw new Error('NO_BG: 這一期的背景是使用者自己上傳的照片，只存在他的瀏覽器，雲端沒有');
  const r=await buildWebA(rec);return {...r,title:q,theme:rec.theme};
};
`;

(async () => {
  let src = fs.readFileSync(maker, 'utf8');
  const i = src.lastIndexOf('\n})();');
  if (i < 0) throw new Error('maker layout changed: closing IIFE not found');
  src = src.slice(0, i) + '\n' + HOOK + src.slice(i);
  const tmp = path.join(path.dirname(path.resolve(stateFile)), '__maker_hooked.html');
  fs.writeFileSync(tmp, src);
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  state.syncT = Date.now();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript(([k, v]) => { try { if (!sessionStorage.getItem('__seeded')) { localStorage.setItem(k, v); sessionStorage.setItem('__seeded', '1'); } } catch (e) {} }, ['slowsoul-picker-v3', JSON.stringify(state)]);
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto('file://' + tmp, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => typeof window.__mk === 'function', null, { timeout: 60000 });
  const r = await page.evaluate(() => window.__mk());
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, r.name);
  fs.writeFileSync(out, r.html);
  console.log(JSON.stringify({ file: out, title: r.title, theme: r.theme, bytes: Buffer.byteLength(r.html) }));
  await browser.close(); fs.unlinkSync(tmp);
})().catch(e => { console.error(e.message || e); process.exit(1); });
