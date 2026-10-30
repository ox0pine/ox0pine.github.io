/* global ctx */

'use strict';

module.exports = ctx => {
  ctx.extend.generator.register('cv', cvGenerator);
};

function cvGenerator() {
  const { cv } = this.theme.config;

  if (!cv || !cv.enable) return [];

  return {
    path: '/cv/index.html',
    layout: ['cv'],
    data: cv
  };
}
