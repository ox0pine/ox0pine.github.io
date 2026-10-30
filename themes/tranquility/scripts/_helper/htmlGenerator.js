'use strict';

module.exports = function (args) {
  if (!args || !Array.isArray(args.json) || args.json.length === 0) return '';

  const className = args.class;
  const renderItem = item => {
    const parts = [`<div class="${className}-item">`];

    if (item.date) {
      parts.push(`<div class="${className}-date">${item.date}</div>`);
    }

    if (item.img) {
      parts.push(`<div class="${className}-img"><img src="${item.img}" /></div>`);
    }

    parts.push(
      `<div class="${className}-title">` +
      `<a href="${item.path}" title="${item.title}" rel="bookmark">${item.title}</a>` +
      '</div>'
    );

    if (item.excerpt) {
      parts.push(`<div class="${className}-excerpt"><p>${item.excerpt}</p></div>`);
    }

    parts.push('</div>');
    return parts.join('');
  };

  return `<div class="${className}">${args.json.map(renderItem).join('')}</div>`;
};
