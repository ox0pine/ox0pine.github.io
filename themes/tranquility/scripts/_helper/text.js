'use strict';

const DESCRIPTION_LENGTH = 160;

function stripHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function truncate(text, length = DESCRIPTION_LENGTH) {
  if (text.length <= length) return text;
  return `${text.slice(0, Math.max(length - 1, 0)).trimEnd()}...`;
}

function plainText(html, length = DESCRIPTION_LENGTH) {
  if (!html) return '';
  return truncate(stripHtml(html).replace(/\s+/g, ' ').trim(), length);
}

module.exports = { DESCRIPTION_LENGTH, stripHtml, truncate, plainText };
