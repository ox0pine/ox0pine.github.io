'use strict';

const htmlGenerator = require('./htmlGenerator');
const trqlt_tagcloud = require('./tagcloud');

module.exports = hexo => {
  hexo.extend.helper.register('htmlGenerator', htmlGenerator);
  hexo.extend.helper.register('trqlt_tagcloud', trqlt_tagcloud);
};
