/**
 * 拉取 X（Twitter）上的最新动态，写成 source/_data/twitter.json，
 * 由 .github/workflows/twitter.yml 每天跑一次，提交后再触发站点部署。
 *
 * 之所以在构建期抓取而不是页面里嵌官方时间线组件：
 * 读者端不再依赖 x.com 可达，也没有几百 KB 的第三方脚本；
 * 代价是内容有一天的延迟，这一点在页面上如实标出来了。
 *
 * 数据源是 api.fxtwitter.com（FixTweet / FxEmbed）的公开时间线接口：
 * 免密钥、免登录。官方那个 syndication.twitter.com 接口已经对机房 IP
 * 全面返回 429（本地和 GitHub Actions 都试过），所以不再使用。
 * 抓不到时保持上一次的快照不动，只打警告。
 *
 * 放在 tools/ 而不是 scripts/：Hexo 会把 scripts/ 下每个文件都 require 一遍，
 * 那样构建时会顺手把这个脚本跑起来。
 */

'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const OUTPUT = path.join(__dirname, '..', 'source', '_data', 'twitter.json');
const USERNAME = process.env.TWITTER_USERNAME || 'ox0pine';
const LIMIT = Number(process.env.TWITTER_LIMIT || 20);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function request(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'application/json' },
    signal: AbortSignal.timeout(20000)
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText} - ${url.split('?')[0]}`);

  const payload = await res.json();
  if (payload.code !== 200) throw new Error(`接口返回 ${payload.code} ${payload.message || ''}`.trim());

  return payload;
}

/* ------------------------------------------------------------------ *
 * 抓取
 * ------------------------------------------------------------------ */

async function fetchTimeline(username) {
  const payload = await request(`https://api.fxtwitter.com/2/profile/${username}/statuses`);

  return (payload.results || [])
    // reposted_by 非空的是转推：作者是别人，不能挂在这个人的名下展示
    .filter(item => item && item.type === 'status' && !item.reposted_by && item.id)
    .map(normalize)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, LIMIT);
}

/* ------------------------------------------------------------------ *
 * 归一化
 * ------------------------------------------------------------------ */

function normalize(item) {
  return {
    id: String(item.id),
    url: item.url || `https://x.com/${item.author.screen_name}/status/${item.id}`,
    text: text(item),
    createdAt: new Date(item.created_at).toISOString(),
    media: media(item)
  };
}

function text(item) {
  const body = String(item.text || '').trim();
  if (body) return body;

  // 纯图片推文没有正文：raw_text 里只剩一条指向图片的 t.co，剥掉它
  const raw = (item.raw_text && item.raw_text.text) || '';
  const mediaLinks = ((item.raw_text && item.raw_text.facets) || [])
    .filter(facet => facet.type === 'media' && facet.original)
    .map(facet => facet.original);

  return mediaLinks.reduce((acc, link) => acc.split(link).join(''), raw).trim();
}

function media(item) {
  const all = (item.media && item.media.all) || [];

  return all
    .filter(entry => entry.type === 'photo' && entry.url)
    .map(entry => ({
      type: 'photo',
      url: entry.url,
      alt: entry.altText || ''
    }))
    .slice(0, 4);
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */

async function loadExisting() {
  try {
    return JSON.parse(await fs.readFile(OUTPUT, 'utf8'));
  } catch {
    return null;
  }
}

async function fetchWithRetry(username) {
  for (let round = 1; round <= 3; round++) {
    try {
      const tweets = await fetchTimeline(username);

      if (tweets.length > 0) return tweets;
      console.warn(`解析到 0 条动态（第 ${round} 次）`);
    } catch (error) {
      console.warn(`${error.message}（第 ${round} 次）`);
    }

    if (round < 3) await sleep(round * 5000);
  }

  return [];
}

async function main() {
  const tweets = await fetchWithRetry(USERNAME);
  const existing = await loadExisting();

  if (tweets.length === 0) {
    if (existing && existing.tweets && existing.tweets.length > 0) {
      console.warn('抓取失败，保留上一次的快照');
      return;
    }

    console.error('抓取失败，且没有任何历史快照');
    process.exitCode = 1;
    return;
  }

  if (existing && existing.username === USERNAME &&
      JSON.stringify(existing.tweets) === JSON.stringify(tweets)) {
    console.log('没有新动态，跳过写入');
    return;
  }

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, `${JSON.stringify({ username: USERNAME, updated: new Date().toISOString(), tweets }, null, 2)}\n`);
  console.log(`已写入 ${tweets.length} 条动态`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
