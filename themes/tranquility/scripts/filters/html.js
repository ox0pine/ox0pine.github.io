'use strict';

// Page level transforms:
// - ```mermaid fences are turned into <pre class="mermaid"> before markdown runs,
//   so highlight.js never wraps them in a code table. The mermaid bundle is then
//   injected only on pages that actually contain such a diagram.
// - images get lazy loading unless the template already decided otherwise.

const MERMAID_FENCE = /^```mermaid[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm;
const IMG_TAG = /<img\b[^>]*>/gi;

function escapeHtml(text) {
  return text.replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));
}

function lazyLoadImages(html) {
  return html.replace(IMG_TAG, tag => {
    if (/\sloading\s*=/.test(tag) || /\sfetchpriority\s*=/.test(tag)) return tag;
    return tag.replace(/<img\b/, '<img loading="lazy" decoding="async"');
  });
}

module.exports = hexo => {
  // Hexo's built-in backtick_code_block filter (priority 10) rewrites fences
  // into highlight.js markup, so this one has to run first.
  hexo.extend.filter.register('before_post_render', data => {
    const mermaid = hexo.theme.config.mermaid;
    if (!mermaid || !mermaid.enable) return data;
    if (typeof data.content !== 'string' || !data.content.includes('```mermaid')) return data;

    data.content = data.content.replace(
      MERMAID_FENCE,
      (_, code) => `<pre class="mermaid">${escapeHtml(code.trim())}</pre>`
    );

    return data;
  }, 5);

  hexo.extend.filter.register('after_render:html', (html, data) => {
    if (typeof html !== 'string' || !html) return html;
    if (data && data.path && /\.(css|js|json|xml|txt)$/.test(data.path)) return html;

    let output = html;

    if (output.includes('<pre class="mermaid">')) {
      const mermaid = hexo.theme.config.mermaid;
      if (mermaid && mermaid.enable) {
        const version = mermaid.version || '11';
        const options = JSON.stringify(mermaid.options || { startOnload: true });
        const scripts = [
          `<script src="https://unpkg.com/mermaid@${version}/dist/mermaid.min.js"></script>`,
          `<script>if (window.mermaid) { mermaid.initialize(${options}); }</script>`
        ].join('\n');
        output = output.replace('</body>', `${scripts}\n</body>`);
      }
    }

    return lazyLoadImages(output);
  });
};
