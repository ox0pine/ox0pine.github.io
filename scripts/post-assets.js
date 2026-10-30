/* global hexo */

'use strict';

const fs = require('fs');
const path = require('path');

// With post_asset_folder, a post's images live in a sibling folder named after
// the post. Markdown editors (VS Code, Typora, Obsidian) resolve image paths
// relative to the .md file, so the natural thing to type or drag in is
//
//   ![东城地坛公园](2025-11-17-weekly-01-restart/ditan-park.jpg)
//
// Rewrite those references to the post's published URL so the same line works
// in the editor preview and on the generated site. Bare file names are also
// accepted (a file that actually exists next to the post), which keeps older
// posts and `hexo new` style asset references working.
//
// Priority 6: runs after post-slug.js (priority 5) so data.path already uses
// the cleaned slug.
const IS_EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/|\/|#)/i;

const MARKDOWN_IMAGE = /(!\[[^\]]*\]\(\s*<?)([^)\s>]+)(>?(?:\s+"[^"]*")?\s*\))/g;
const HTML_IMAGE = /(<img\b[^>]*?\bsrc=(["']))([^"']+)(\2)/gi;

hexo.extend.filter.register('before_post_render', data => {
  if (!data || typeof data.content !== 'string' || !data.source) return data;

  const source = data.source.replace(/\\/g, '/');
  if (!source.startsWith('_posts/')) return data;

  const assetDir = source.split('/').pop().replace(/\.md$/, '');
  const pageDir = (data.path || '').replace(/^\/+|\/+$/g, '');
  if (!assetDir || !pageDir) return data;

  const base = `/${pageDir}/`;
  const absDir = path.join(hexo.source_dir, path.posix.dirname(source), assetDir);
  const assetExists = name => {
    try {
      return fs.statSync(path.join(absDir, name)).isFile();
    } catch (error) {
      return false;
    }
  };

  // Returns the published URL for a path that points into this post's assets.
  const resolve = href => {
    if (!href || IS_EXTERNAL.test(href)) return null;

    const clean = href.replace(/^\.\//, '');
    const segments = clean.split('/');
    if (segments.length > 1) {
      if (segments[0] !== assetDir) return null;
      return base + segments.slice(1).join('/');
    }

    return assetExists(clean) ? base + clean : null;
  };

  data.content = data.content
    .replace(MARKDOWN_IMAGE, (match, head, href, tail) => {
      const url = resolve(href);
      return url ? `${head}${url}${tail}` : match;
    })
    .replace(HTML_IMAGE, (match, head, quote, href, close) => {
      const url = resolve(href);
      return url ? `${head}${url}${close}` : match;
    });

  return data;
}, 6);
