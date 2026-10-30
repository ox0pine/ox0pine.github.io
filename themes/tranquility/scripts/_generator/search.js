'use strict';

module.exports = hexo => {
  hexo.extend.generator.register('search', generateSearch);
};

function generateSearch(locals) {
  const config = {
    path: 'search.json',
    field: 'post',
    ...this.config.search,
    ...this.theme.config.search,
    root: this.config.root
  };

  const field = String(config.field ?? '').trim();
  const includePosts = field !== 'page';
  const includePages = field === 'page' || (field !== '' && field !== 'post');

  const entries = [];
  const collect = items => {
    for (const item of items) {
      if (item.indexing !== undefined && !item.indexing) continue;

      const entry = { title: item.title || 'No Title' };

      if (item.path) entry.url = config.root + item.path;
      if (config.content !== false && item._content) entry.content = item._content;

      const tags = toNames(item.tags);
      if (tags.length > 0) entry.tags = tags;

      const categories = toNames(item.categories);
      if (categories.length > 0) entry.categories = categories;

      entries.push(entry);
    }
  };

  if (includePosts) collect(locals.posts.sort('-date').toArray());
  if (includePages) collect(locals.pages.toArray());

  return {
    path: config.path,
    data: JSON.stringify(entries)
  };
}

function toNames(collection) {
  if (!collection) return [];

  const items = typeof collection.toArray === 'function'
    ? collection.toArray()
    : Array.from(collection);

  return items.map(item => item.name);
}
