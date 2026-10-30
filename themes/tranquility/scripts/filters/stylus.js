/* global hexo */

'use strict';

hexo.extend.filter.register('stylus:renderer', function (style) {
  const urlFor = hexo.extend.helper.get('url_for').bind(hexo);

  style.define('url_for', data => urlFor(data.val));
});
