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
      if (config.content !== false && item._content) entry.content = stripMarkdown(item._content);

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

/* `_content` is raw Markdown. Search snippets showed the syntax ("## ",
   "[text](url)", backticks), so reduce it to readable text before indexing.
   Only the presentation markers are removed — words, numbers and command
   lines survive, so searching for `cloudflared` or `brew install` still hits. */
function stripMarkdown(text) {
  return String(text)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')           // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')          // links keep their text
    .replace(/^ {0,3}#{1,6}[ \t]+/gm, '')             // heading markers
    .replace(/^ {0,3}>[ \t]?/gm, '')                  // block quotes
    .replace(/^ {0,3}(?:[-*+]|\d+\.)[ \t]+/gm, '')    // list markers
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')            // inline code / fences
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^\w])\*([^*\n]+)\*(?!\w)/g, '$1$2')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/<[^>]+>/g, ' ')                         // inline HTML
    .replace(/^\s*\|?[-\s:|]{3,}\|?\s*$/gm, ' ')      // table rules
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
