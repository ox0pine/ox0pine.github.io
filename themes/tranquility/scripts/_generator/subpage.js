/* global ctx */

'use strict';

const pagination = require('hexo-pagination');

module.exports = ctx => {
  ctx.config.subpage_generator = {
    per_page: ctx.config.per_page ?? 10,
    ...ctx.config.subpage_generator
  };

  ctx.extend.generator.register('subpage', subpageGenerator);
  ctx.extend.generator.register('blog', blogGenerator);
};

function sortSticky(posts) {
  posts.data.sort((a, b) => (b.sticky || 0) - (a.sticky || 0));
  return posts;
}

function blogGenerator(locals) {
  const config = this.config;
  const paginationDir = config.pagination_dir || 'page';
  const posts = sortSticky(locals.posts.sort(config.index_generator.order_by));

  return pagination('blog', posts, {
    perPage: config.index_generator.per_page,
    layout: ['category'],
    format: `${paginationDir}/%d/`,
    data: {
      name: '博客',
      icon: 'blog'
    }
  });
}

function subpageGenerator(locals) {
  const ctx = this;
  const { subpage } = ctx.theme.config;

  if (!subpage || !subpage.enable) return [];

  const config = ctx.config;
  const perPage = config.subpage_generator.per_page;
  const paginationDir = config.pagination_dir || 'page';
  const orderBy = config.subpage_generator.order_by || '-date';

  return subpage.pages.flatMap(page => {
    const category = locals.categories.findOne({ name: page.name });
    const path = page.path || page.name;
    const normalizedPath = path.endsWith('/') ? path : `${path}/`;

    if (!category || category.posts.length === 0) {
      console.warn(`Warn: There is no post in subpage '${page.title}'`);
      return [{
        path: normalizedPath,
        layout: ['category', 'archive', 'index'],
        data: { ...page }
      }];
    }

    const posts = category.posts.sort(orderBy);
    sortSticky(posts);

    const Tag = ctx.model('Tag');
    const tags = Tag.find({ _id: { $in: getTagIds(category) } });

    return pagination(normalizedPath, posts, {
      perPage,
      layout: ['category', 'archive', 'index'],
      format: `${paginationDir}/%d/`,
      data: {
        ...page,
        tags
      }
    });
  });
}

function getTagIds(category) {
  const ids = new Set();

  for (const post of category.posts.toArray()) {
    for (const tag of post.tags.toArray()) {
      ids.add(tag._id);
    }
  }

  return [...ids];
}
