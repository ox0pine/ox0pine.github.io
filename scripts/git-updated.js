/* global hexo */

'use strict';

// `updated_option: mtime` is useless in CI: a fresh checkout stamps every file
// with the build time, so sitemap <lastmod> and schema.org dateModified would
// claim the whole site was edited today. Use the last commit that touched each
// post instead, and fall back to the publish date when git has no answer
// (shallow clone, tarball build, dirty tree).

const { execFileSync } = require('child_process');
const { statSync } = require('fs');
const moment = require('moment');

const cache = new Map();

function commitTime(file) {
  let stamp;

  try {
    stamp = statSync(file).mtimeMs;
  } catch (error) {
    return null;
  }

  const cached = cache.get(file);
  if (cached && cached.stamp === stamp) return cached.value;

  let value = null;
  try {
    const iso = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', file],
      { cwd: hexo.base_dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();

    if (iso) value = moment(iso);
  } catch (error) {
    value = null;
  }

  cache.set(file, { stamp, value });
  return value;
}

// `after_post_render` runs on the document that is actually stored in the
// model, so the value survives into generators (sitemap) and templates
// (schema.org dateModified).
hexo.extend.filter.register('after_post_render', data => {
  if (!data || !data.date) return data;

  const fromGit = data.full_source ? commitTime(data.full_source) : null;
  // noon avoids a UTC off-by-one in consumers that format dates as ISO
  data.updated = fromGit || data.date.clone().hour(12).minute(0).second(0);

  return data;
});
