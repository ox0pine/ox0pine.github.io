'use strict';

// 子页的第三种类型：`type: projects`。
// 内容来自 source/_data/projects.yml，页面只是把项目列出来，点卡片直接跳仓库，
// 不为每个项目生成文章页。

module.exports = hexo => {
  hexo.extend.generator.register('projects', projectsGenerator);
};

function normalize(path) {
  return path.endsWith('/') ? path : `${path}/`;
}

function projectsGenerator(locals) {
  const { subpage } = this.theme.config;
  if (!subpage || !subpage.enable) return [];

  const projects = (locals.data && locals.data.projects) || [];

  return subpage.pages
    .filter(page => page.type === 'projects')
    .map(page => ({
      path: `${normalize(page.path || page.name)}index.html`,
      layout: 'projects',
      data: {
        title: page.title,
        description: page.description,
        icon: page.icon,
        projects
      }
    }));
}
