/* global ctx */

'use strict';

// 子页除了按分类聚合文章，还可以是纯外部内容页。
// 这里处理 `type: twitter` 的子页：内容来自 source/_data/twitter.json，
// 由 .github/workflows/twitter.yml 每天抓取提交，构建时静态渲染。

module.exports = ctx => {
  ctx.extend.generator.register('twitter', twitterGenerator);
};

// 时间统一按作者的时区格式化：构建机（CI）是 UTC，
// 直接用模板里的 date helper 会让同一条推文在不同机器上显示成不同时间。
const TIME_FORMATTER = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

function formatTime(value) {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return '';
  return TIME_FORMATTER.format(new Date(time));
}

function normalize(path) {
  return path.endsWith('/') ? path : `${path}/`;
}

function twitterGenerator(locals) {
  const { subpage } = this.theme.config;

  if (!subpage || !subpage.enable) return [];

  const data = locals.data && locals.data.twitter;
  const tweets = (data && data.tweets) || [];

  return (subpage.pages || [])
    .filter(page => page.type === 'twitter')
    .map(page => {
      const username = (page.twitter && page.twitter.username) || (data && data.username);

      if (!username) {
        console.warn(`Warn: Subpage '${page.title || page.name}' is type twitter but has no twitter.username`);
        return null;
      }

      if (tweets.length === 0) {
        console.warn('Warn: source/_data/twitter.json 里没有动态，页面会显示空状态');
      }

      const limit = (page.twitter && page.twitter.limit) || 20;

      return {
        path: normalize(page.path || page.name),
        layout: ['twitter'],
        data: {
          ...page,
          twitter: { username, limit },
          updatedLabel: formatTime(data && data.updated),
          tweets: tweets.slice(0, limit).map(tweet => ({ ...tweet, time: formatTime(tweet.createdAt) }))
        }
      };
    })
    .filter(Boolean);
}
