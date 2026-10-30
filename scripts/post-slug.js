/* global hexo */

'use strict';

// Post files are date-prefixed so they sort chronologically inside _posts
// (2025-11-17-weekly-01-restart.md) and `new_post_name` writes that prefix for
// new posts. Hexo's permalink `:name` is the basename of the slug, so the date
// prefix is dropped here instead of leaking into URLs. Dates live in their own
// permalink segment and in the front matter, so nothing is lost.
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

hexo.extend.filter.register('before_post_render', data => {
  if (!data || !data.source) return data;

  const base = data.source.split('/').pop().replace(/\.md$/, '');
  const slug = base.replace(DATE_PREFIX, '');

  if (slug) data.slug = slug;

  return data;
}, 5);
