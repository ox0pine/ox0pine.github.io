'use strict';

const seoMeta = require('./seo');
const trqlt_tagcloud = require('./tagcloud');

module.exports = hexo => {
  hexo.extend.helper.register('seo_meta', seoMeta(hexo));
  hexo.extend.helper.register('trqlt_tagcloud', trqlt_tagcloud);
  require('./tweet')(hexo);

  require('./page')(hexo);
};
