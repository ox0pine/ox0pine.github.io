/**
 * 拉取 X（Twitter）上的最新动态，写成 source/_data/twitter.json，
 * 由 .github/workflows/twitter.yml 每天跑一次，提交后再触发站点部署。
 *
 * 之所以在构建期抓取而不是页面里嵌官方时间线组件：
 * 读者端不再依赖 x.com 可达，也没有几百 KB 的第三方脚本；
 * 代价是内容有一天的延迟，这一点在页面上如实标出来了。
 *
 * 数据源是 syndication.twitter.com —— 官方嵌入组件用的同一个免密钥接口，
 * 因此不需要任何 token。抓不到时保持上一次的快照不动，只打警告。
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
    headers: { 'user-agent': UA, 'accept-language': 'zh-CN,zh;q=0.9' },
    signal: AbortSignal.timeout(20000)
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText} - ${url.split('?')[0]}`);
  return res;
}

/* ------------------------------------------------------------------ *
 * 抓取
 * ------------------------------------------------------------------ */

// 接口返回的是一整页 HTML，推文藏在 __NEXT_DATA__ 的 JSON 里。
async function fetchTimeline(username) {
  const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${username}` +
    '?dnt=true&showReplies=false&lang=zh-cn';
  const html = await (await request(url)).text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

  if (!match) throw new Error('页面里没有 __NEXT_DATA__');

  return collectTweets(JSON.parse(match[1]), username);
}

/* ------------------------------------------------------------------ *
 * 归一化
 * ------------------------------------------------------------------ */

function looksLikeTweet(node) {
  const id = node.id_str || node.rest_id || node.id;
  const text = node.full_text ?? node.text;

  return Boolean(id && typeof text === 'string' && node.created_at);
}

// 推文对象嵌套在 timeline 里，层级随页面改版会变，所以全树扫描；
// 引用推文和转推原文（quoted_*/retweeted_status）属于附属内容，不单独列出来。
function collectTweets(root, username) {
  const found = [];

  (function walk(node, parentKey) {
    if (!node || typeof node !== 'object') return;
    if (/^quoted[._]/.test(parentKey || '') || parentKey === 'retweeted_status') return;

    if (Array.isArray(node)) {
      for (const item of node) walk(item, parentKey);
      return;
    }

    if (looksLikeTweet(node)) found.push(normalize(node, username));

    for (const [key, value] of Object.entries(node)) walk(value, key);
  })(root, '');

  const seen = new Set();

  return found
    .filter(tweet => {
      if (seen.has(tweet.id)) return false;
      seen.add(tweet.id);
      return true;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, LIMIT);
}

function normalize(node, username) {
  const id = String(node.id_str || node.rest_id || node.id);
  const author = (node.user && node.user.screen_name) || username;

  return {
    id,
    url: `https://x.com/${author}/status/${id}`,
    text: unwrapTco(String(node.full_text ?? node.text), node).trim(),
    createdAt: new Date(node.created_at).toISOString(),
    media: media(node)
  };
}

// 正文里的链接都是 t.co 短链，用 entities 里的展开结果换回去。
function unwrapTco(text, node) {
  const urls = (node.entities && node.entities.urls) || [];
  let result = text;

  for (const entry of urls) {
    if (!entry.url || !entry.expanded_url) continue;
    result = result.split(entry.url).join(entry.expanded_url);
  }

  return result;
}

function media(node) {
  const extended = node.extended_entities && node.extended_entities.media;
  const source = extended && extended.length > 0
    ? extended
    : (node.entities && node.entities.media) || [];

  return source
    .filter(item => item.type === 'photo' && (item.media_url_https || item.media_url))
    .map(item => ({
      type: 'photo',
      url: item.media_url_https || item.media_url,
      alt: item.ext_alt_text || ''
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

    if (round < 3) await sleep(round * 10000);
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
