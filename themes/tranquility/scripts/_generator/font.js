'use strict';

const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

const { getObjValues } = require('../_utils');

const FONT_DIR = path.resolve(__dirname, '../../_font/');

const notdefGlyph = new opentype.Glyph({
  name: '.notdef',
  advanceWidth: 650,
  path: new opentype.Path()
});

module.exports = hexo => {
  hexo.extend.generator.register('subfont', () => {
    const { zh_font: zhFont } = hexo.theme.config;

    if (!zhFont || !zhFont.enable) return [];

    const text = getSubText(hexo);
    hexo.log.debug('Extract subfont:', text);

    return zhFont.style.map(style => ({
      path: path.posix.join('/font', `${style}.${zhFont.type}`),
      data: compress(text, {
        source: path.resolve(FONT_DIR, `${style}.${zhFont.type}`),
        name: zhFont.fontName,
        style
      })
    }));
  });
};

function compress(text, { source, name, style }) {
  const data = new Uint8Array(fs.readFileSync(source)).buffer;
  const font = opentype.parse(data);
  const glyphs = [notdefGlyph, ...font.stringToGlyphs(text)];

  const subFont = new opentype.Font({
    unitsPerEm: font.unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
    familyName: name,
    styleName: style,
    glyphs
  });

  return Buffer.from(subFont.toArrayBuffer());
}

function getSubText(hexo) {
  const config = hexo.theme.config;

  const text = [
    config.slogan,
    config.index.about.title,
    ...config.subpage.pages.map(page => page.description),
    ...hexo.locals.get('tags').map(tag => tag.name),
    ...config.index.about.text,
    ...config.index.poem,
    ...config.foot.title,
    ...(config.cv ? getObjValues(config.cv) : [])
  ];

  // Must be sorted with .notdef first:
  // https://github.com/opentypejs/opentype.js/issues/94
  return [...new Set(text.join('').split(''))].sort().join('');
}
