'use strict';

const moment = require('moment');

module.exports = hexo => {
  let cached = null;

  const build = () => {
    const { timeline } = hexo.theme.config;

    if (!timeline || !timeline.enable) return { types: [], posts: [] };

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
  };

  const full = () => cached || (cached = build());

  const limit = () => {
    const value = Number((hexo.theme.config.timeline || {}).limit);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  };

  // The cover shows the newest N entries; `/timeline/` renders the rest.
  const home = () => {
    const data = full();
    const max = limit();
    if (!max || data.posts.length <= max) return data;
    return { types: data.types, posts: data.posts.slice(0, max) };
  };

  hexo.locals.set('timelineData', full);
  hexo.locals.set('timelineHome', home);
  hexo.locals.set('timelineTotal', () => full().posts.length);
  hexo.locals.set('timelineHasMore', () => limit() > 0 && full().posts.length > limit());

  hexo.extend.generator.register('timeline-page', () => {
    const { timeline } = hexo.theme.config;
    if (!timeline || !timeline.enable) return [];

    return {
      path: 'timeline/index.html',
      layout: 'timeline',
      data: {
        title: '时间线',
        description: '按时间排列的全部记录：文章、课程与事件。'
      }
    };
  });
};
