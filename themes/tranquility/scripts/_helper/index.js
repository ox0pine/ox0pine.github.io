'use strict';

const htmlGenerator = require('./htmlGenerator');
const seoMeta = require('./seo');
const trqlt_tagcloud = require('./tagcloud');

module.exports = hexo => {
  hexo.extend.helper.register('htmlGenerator', htmlGenerator);
  hexo.extend.helper.register('seo_meta', seoMeta(hexo));
  hexo.extend.helper.register('trqlt_tagcloud', trqlt_tagcloud);

  require('./page')(hexo);
};
