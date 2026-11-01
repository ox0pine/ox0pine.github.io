'use strict';

const { DESCRIPTION_LENGTH, plainText } = require('./text');

function toAbsolute(hexo, value) {
  if (!value) return '';

  const url = String(value);
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;

  const urlFor = hexo.extend.helper.get('url_for').bind(hexo);
  return hexo.config.url.replace(/\/+$/, '') + urlFor(url);
}

function toPlain(html, length = DESCRIPTION_LENGTH) {
  return plainText(html, length);
}

function locale(language) {
  return String(language || 'zh-CN').replace('-', '_');
}

module.exports = hexo => function seoMeta(page, config, theme, flags = {}) {
  const siteTitle = config.title;

  let title = siteTitle;
  let description = toPlain(config.description);
  let keywords = config.keywords;

  if (flags.post) {
    title = `${page.title} | ${siteTitle}`;
    description = toPlain(page.description || page.excerpt || page.content);
  } else if (flags.category) {
    const name = page.category || page.title;
    title = `${name} | ${siteTitle}`;
    description = `${name}分类下的所有文章 - ${config.description}`;
    keywords = `${name}, ${config.keywords}`;
  } else if (flags.tag) {
    title = `${page.tag} | ${siteTitle}`;
    description = `${page.tag}标签下的所有文章 - ${config.description}`;
    keywords = `${page.tag}, ${config.keywords}`;
  } else if (!flags.home && page.title) {
    title = `${page.title} | ${siteTitle}`;
    description = toPlain(page.description || page.content || config.description);
  }

  const photos = page.photos ? [].concat(page.photos) : [];
  const image = toAbsolute(hexo, photos[0] || theme.logo);

  const url = toAbsolute(hexo, page.permalink || page.path || '/').replace(/\/index\.html$/, '/');
  const published = flags.post && page.date ? page.date.format('YYYY-MM-DDTHH:mm:ssZ') : '';
  const modified = flags.post && page.updated ? page.updated.format('YYYY-MM-DDTHH:mm:ssZ') : '';
  const jsonld = [];

  if (flags.post) {
    const images = photos.length > 0 ? photos.map(photo => toAbsolute(hexo, photo)) : [image];

    jsonld.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: page.title,
      image: images,
      datePublished: published,
      dateModified: modified || published,
      author: { '@type': 'Person', name: config.author },
      publisher: {
        '@type': 'Organization',
        name: siteTitle,
        logo: { '@type': 'ImageObject', url: toAbsolute(hexo, theme.logo) }
      },
      description,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url }
    });

    const categories = page.categories ? page.categories.toArray() : [];
    if (categories.length > 0) {
      const category = categories[0];

      jsonld.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: toAbsolute(hexo, '/') },
          { '@type': 'ListItem', position: 2, name: category.name, item: toAbsolute(hexo, category.path) },
          { '@type': 'ListItem', position: 3, name: page.title, item: url }
        ]
      });
    }
  } else if (flags.home) {
    jsonld.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteTitle,
      description,
      url: toAbsolute(hexo, '/'),
      inLanguage: config.language
    });
  }

  return {
    title,
    description,
    keywords,
    url,
    image,
    type: flags.post ? 'article' : 'website',
    locale: locale(config.language),
    published,
    modified,
    jsonld
  };
};
