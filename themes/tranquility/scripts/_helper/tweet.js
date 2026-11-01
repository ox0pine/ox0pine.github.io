'use strict';

// 推文正文是纯文本，只把它里面的链接、@提及、#话题变成 <a>，
// 其余一律转义 —— 内容来自第三方接口，不能当可信 HTML 处理。

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ENTITIES[char]);
}

const URL_SPLIT = /(https?:\/\/[^\s]+)/g;
const MENTION = /(^|[^\w/])@(\w{1,15})/g;
const HASHTAG = /(^|\s)#([\w\u4e00-\u9fff]+)/g;

function anchor(href, label) {
  return `<a class="tweet-link" href="${escapeHtml(href)}" target="_blank" rel="noopener nofollow">${label}</a>`;
}

function tweetText(text) {
  return String(text || '')
    .split(URL_SPLIT)
    .map((part, index) => {
      // 偶数下标是普通文本，奇数下标是 URL 本身
      if (index % 2 === 1) return anchor(part, escapeHtml(part));

      return escapeHtml(part)
        .replace(MENTION, (_, lead, name) => lead + anchor(`https://x.com/${name}`, `@${name}`))
        .replace(HASHTAG, (_, lead, tag) => lead + anchor(`https://x.com/hashtag/${tag}`, `#${tag}`))
        .replace(/\n/g, '<br/>');
    })
    .join('');
}

module.exports = hexo => {
  hexo.extend.helper.register('tweet_text', tweetText);
};
