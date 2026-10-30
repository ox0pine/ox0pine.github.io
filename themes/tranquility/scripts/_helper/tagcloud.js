'use strict';

module.exports = function (tags, config) {
  const options = { ...config };

  if (!options.fancy) {
    Object.assign(options, { min_font: 1, max_font: 1, unit: 'em' });
  }

  const html = tags ? this.tagcloud(tags, options) : this.list_tags();

  if (!options.fancy) return html;

  return `<canvas width="500" height="500" id="tagCanvas">${html}</canvas>`;
};
