'use strict';

const { plainText } = require('./text');

const MATH_PATTERN = /\$\$|\\\(|\\\[|\\begin\{/;

function contentOf(page) {
  return (page && (page.content || page.excerpt)) || '';
}

function isCurrentSection(page, path) {
  if (!page || !page.path || !path) return false;

  const segment = value => String(value).replace(/^\/+/, '').replace(/^index\.html$/, '').split('/')[0];

  return segment(page.path) === segment(path);
}

module.exports = hexo => {
  hexo.extend.helper.register('nav_current', (page, path) => isCurrentSection(page, path));

  hexo.extend.helper.register('excerpt_text', (post, length = 120) => plainText(
    post.abstract || post.excerpt || post.content,
    length
  ));

  hexo.extend.helper.register('nav_url', path => {
    const urlFor = hexo.extend.helper.get('url_for').bind(hexo);
    const value = String(path || '');

    return urlFor(value.endsWith('/') || /\.[a-z0-9]+$/i.test(value) ? value : `${value}/`);
  });

  // MathJax is heavy (~1 MB) and most posts never use it, so it is only pulled
  // in when the content (or front matter) says math is present.
  hexo.extend.helper.register('needs_math', (page, enabled) => {
    if (!enabled || !page || page.math === false) return Boolean(page && page.math);
    return Boolean(page.math) || MATH_PATTERN.test(contentOf(page));
  });
};
