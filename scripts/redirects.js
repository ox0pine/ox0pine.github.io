/* global hexo */

'use strict';

// Posts were renamed to descriptive slugs. Static hosting cannot answer with a
// real 301, so each old URL gets a tiny HTML page that redirects while pointing
// a canonical at the new address (search engines move the signal, humans move
// on). Add entries here whenever a post slug changes — the keys are the old
// permalinks, values the new ones.
const REDIRECTS = {
  '/2026/04/13/github-actions-refresh-content/': '/2026/04/13/github-actions-content-editor/',
  '/2025/11/11/how-to-install-v2ray-on-server/': '/2025/11/11/deploy-v2ray-on-server/',
  '/2026/01/24/how-to-use-Cloudflare-Tunnel/': '/2026/01/24/cloudflare-tunnel-guide/',
  '/2025/11/16/regret-to-read/': '/2025/11/16/graduate-school-regret/',
  '/2025/11/17/week1/': '/2025/11/17/weekly-01-restart/',
  '/2025/11/26/week2/': '/2025/11/26/weekly-02-goodbye-project/',
  '/2025/12/14/week3/': '/2025/12/14/weekly-03-exams/',
  '/2025/12/31/year1/': '/2025/12/31/2025-year-in-review/'
};

hexo.extend.generator.register('redirects', function () {
  const urlFor = this.extend.helper.get('url_for').bind(this);
  const site = this.config.url.replace(/\/+$/, '');
  const title = this.config.title;

  return Object.entries(REDIRECTS).map(([from, to]) => {
    const target = urlFor(to);
    const absolute = site + target;

    return {
      path: `${from.replace(/^\//, '')}index.html`,
      data: [
        '<!DOCTYPE html>',
        '<html lang="zh-CN">',
        '<head>',
        '<meta charset="utf-8"/>',
        '<meta name="robots" content="noindex"/>',
        `<link rel="canonical" href="${absolute}"/>`,
        `<meta http-equiv="refresh" content="0; url=${target}"/>`,
        `<title>${title}</title>`,
        `<script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>`,
        '</head>',
        '<body>',
        `<p>页面已移动到 <a href="${target}">${absolute}</a></p>`,
        '</body>',
        '</html>',
        ''
      ].join('\n')
    };
  });
});
