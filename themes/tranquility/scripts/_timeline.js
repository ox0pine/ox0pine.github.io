'use strict';

const moment = require('moment');

module.exports = hexo => {
  hexo.locals.set('timelineData', getTimeline);

  function getTimeline() {
    const { timeline } = hexo.theme.config;

    if (!timeline || !timeline.enable) return {};

    const urlFor = hexo.extend.helper.get('url_for').bind(hexo);
    const itemsByType = new Map(timeline.items.map(item => [item.name, item]));
    const types = [...itemsByType.keys()];
    const order = timeline.order ? 'date' : '-date';

    const posts = hexo.locals.get('posts')
      .sort(order)
      .filter(post => itemsByType.has(post.timeline))
      .map(post => {
        const item = itemsByType.get(post.timeline);

        return {
          title: post.title,
          path: urlFor(post.path),
          icon: urlFor(item.icon),
          type: post.timeline,
          date: moment(post.date).format('YYYY-MM-DD')
        };
      });

    return { types, posts };
  }
};
