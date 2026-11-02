# 秋风飘起黄叶落のblog

个人静态博客，基于 **Hexo 8** 构建，主题为深度定制过的 [致远 / tranquility](https://github.com/hooozen/hexo-theme-tranquility)（已随仓库内置在 `themes/tranquility`，不是 npm 依赖）。站点由 GitHub Actions 构建后推送到 `gh-pages` 分支，由 GitHub Pages 托管。

- 线上站点：<https://ox0pine.github.io>
- 想拿来当自己的博客？按下面的 [Fork 流程](#部署到-github-pagesfork-流程) 和 [替换清单](#换成你自己的内容必改清单) 操作即可，不需要改主题源码。

## 特性

- 首页（标题 / 诗句 / motto / 关于我）+ 时间线 + 全站深色适配
- “子页”式导航：按分类聚合文章（`tech` / `life`）、项目卡片页（`apps`）、X 动态页（`moments`）
- 本地全文搜索、RSS / Atom、sitemap、Open Graph、JSON-LD，均由主题生成，无第三方服务
- 中文字体子集化：构建时从 `themes/tranquility/_font/` 抽取页面实际用到的字形，输出 woff2
- Mermaid、MathJax 按页面需要才加载
- 文章图片走标准 Markdown 相对路径，编辑器和线上同时可预览
- `updated` 取自 git 提交时间，而不是构建时间

## 本地运行

要求 **Node >= 24**、**pnpm 12.15.0**（`package.json` 里已锁定 `packageManager`）。

```bash
git clone https://github.com/<你的用户名>/<仓库名>.git
cd <仓库名>
corepack enable
pnpm install --frozen-lockfile

pnpm server                 # http://localhost:4000
pnpm clean && pnpm build    # 产物在 public/
```

> 改动 `scripts/` 或 `themes/*/scripts/` 之后必须 `pnpm clean` 再构建，否则 Hexo 会用 `db.json` 里缓存的旧渲染结果，看起来像“改了没生效”。

## 部署到 GitHub Pages（fork 流程）

仓库自带的 `.github/workflows/deploy.yml`：`main` 分支有推送 → 安装依赖 → `pnpm build` → 用 `peaceiris/actions-gh-pages` 把 `public/` 强制推送到 `gh-pages` 分支。**不需要** `hexo deploy`，也不要手动提交 `public/`。

### 1. Fork 并改名

Fork 之后进入自己仓库的 **Settings → General → Repository name**：

| 仓库名 | 站点地址 |
|---|---|
| `<你的用户名>.github.io` | `https://<你的用户名>.github.io/`（推荐，根路径） |
| 其他名字（例如 `blog`） | `https://<你的用户名>.github.io/blog/` |

如果用第二种，`_config.yml` 的 `url` 必须写成带子路径的完整地址：

```yaml
url: https://yourname.github.io/blog
```

Hexo 会据此推导出 `root: /blog/`，站内链接、搜索索引、feed 都会自动带上前缀。忘记写子路径是 fork 后“页面能打开但样式/图片 404”的最常见原因。

### 2. 启用 Actions

Fork 出来的仓库默认不运行任何 workflow：

1. 打开 **Actions** 标签页，点 “I understand my workflows, go ahead and enable them”。
2. **Settings → Actions → General → Workflow permissions** 确认允许写权限（workflow 里已声明 `permissions: contents: write`，但组织策略可能覆盖）。

### 3. 先改成自己的站点地址

至少改掉 `_config.yml` 的 `url`，否则生成的 sitemap、canonical、OG 链接全是原作者的域名。完整清单见下一节。

### 4. 跑一次构建

推送任意提交到 `main`，或手动 **Actions → Build and Deploy Hexo → Run workflow**。等它变绿，`gh-pages` 分支会被创建/覆盖。

> Fork 通常会把原仓库的 `gh-pages` 分支一并复制过来。如果你在第一次构建前就开了 Pages，访问到的会是**原作者已发布的站点**。所以顺序建议是：先跑构建覆盖 `gh-pages`，再开 Pages；或者直接把 fork 里的 `gh-pages` 分支删掉。

### 5. 开启 Pages

**Settings → Pages → Build and deployment → Source: Deploy from a branch**，分支选 `gh-pages`，目录选 `/ (root)`。

之后每次推送到 `main` 都会自动重新发布。注意：fork 的 Pages 不会自动创建，必须手动开一次。

## 换成你自己的内容（必改清单）

下面的路径都相对仓库根目录。

### A. 站点信息：`_config.yml`

| 字段 | 说明 |
|---|---|
| `title` / `subtitle` / `description` / `keywords` / `author` | 站点标题、副标题、SEO 描述与关键词、作者名 |
| `url` | 你的最终访问地址（见上一节） |
| `language` | 默认 `zh-CN`，写英文站可改 `en` |

其余项（`permalink`、`post_asset_folder`、`marked`、`highlight`、`updated_option`、`feed`、`sitemap`）是站点能正常工作的前提，除非清楚后果，不要改。

### B. 主题配置：`_config.tranquility.yml`

这个文件通过 Hexo 的 `_config.<主题名>.yml` 机制覆盖主题默认值，所有个性化内容都在这里。

| 区块 | 需要替换的内容 |
|---|---|
| `email` | 友链申请 mailto 的收件地址 |
| `logo`、`favicon.*` | 指向 `themes/tranquility/source/images/` 下的文件，替换成自己的 logo / favicon |
| `subpage.pages` | 导航项。`name` 必须是真实文章分类名；只写 `tech` / `life` 就保留两项，不要的分类直接删条目 |
| `subpage.pages` 里 `type: projects` | 开源作品页，数据来自 `source/_data/projects.yml` |
| `subpage.pages` 里 `type: twitter` | X 动态页；不用 X 就删掉整条，见下文 |
| `index.motto` / `index.poem` | 首页背景上的标语与竖排诗句 |
| `index.about.title` / `index.about.text` | 首页“关于我”。`title` 每个字渲染成一个方块，用 4–6 字短句；`text` 每项一段 |
| `foot.title` | 页脚大字，同样是逐字方块，用短句，2 行以内 |
| `foot.linksRows` | 页脚友链区行数 |
| `links` / `social` / `contacts` | 友链、社交账号、联系方式 |
| `timeline.items` | 时间线类型（默认 `article` / `event`），和文章 frontmatter 的 `timeline` 值对应 |
| `cv` | 简历页，默认 `enable: false`。若开启，姓名、学校、邮箱、项目、荣誉**全部**要重写 |
| `zh_font` | 自定义字体开关与字体名，见下文“字体” |
| `search` / `tagcloud` / `mermaid` / `mathjax` | 按需保留或关闭 |

### C. 文章、项目与动态数据

| 路径 | 处理方式 |
|---|---|
| `source/_posts/tech/`、`source/_posts/life/` | 删除原作者的文章（含同名的图片资源目录），换成自己的 |
| `source/_posts/_unused/` | 原作者的草稿/废弃图片，直接删 |
| `source/_data/projects.yml` | 重写，或删除 `apps` 子页后清空 |
| `source/_data/twitter.json` | 不用 X 就清空 `{"tweets": [], "updated": ""}` 或直接删文件 |
| `scripts/redirects.js` | 把 `REDIRECTS` 对象清成 `{}`；表里全是本站旧链接 |
| `source/robots.txt` | 把 `Sitemap:` 一行改成自己的域名 |

### D. 图片与字体

- 替换 `themes/tranquility/source/images/` 下的 `logo.svg`、`logo-github.svg`、`logo-twitter.svg`、`favicon-16x16.png`、`favicon-32x32.png`、`apple-touch-icon.png`。文件名保持不变就不用改配置。
- `themes/tranquility/_font/normal.ttf` 和 `bold.ttf` 是霞鹜文楷（约 50 MB）。换成自己的字体时保持这两个文件名，或同步修改 `zh_font.style`；字体族名改 `zh_font.fontName`。不想要自定义字体：`zh_font.enable: false`，并删除 `_font/` 以减小仓库体积。
- 字体许可证见 `themes/tranquility/_font/OFL.txt`（SIL OFL 1.1），替换时注意新字体的授权。

### E. 只属于原作者、建议清理的内容

- `AGENTS.md`：给 AI 编码助手的仓库说明，可保留并改写，也可删除。
- `themes/tranquility/README.md`：上游主题文档，保留即可（主题为 MIT）。
- 原作者的 `gh-pages` 分支：见上一节的提示。

## 不需要 X 动态？

X 快照由 `tools/fetch-twitter.js` 抓取，`.github/workflows/twitter.yml` 每天定时提交 `source/_data/twitter.json`。不用的话按顺序清理：

1. 删除 `.github/workflows/twitter.yml`。
2. 删除 `.github/workflows/deploy.yml` 顶部的 `workflow_run:` 块（它只用来串联 X 更新后的部署）。
3. 删除 `_config.tranquility.yml` 中 `moments` 那条子页。
4. 可选：删除 `source/_data/twitter.json` 和 `tools/fetch-twitter.js`。

想保留就改三处用户名：`.github/workflows/twitter.yml` 的 `TWITTER_USERNAME`、`_config.tranquility.yml` 里 `twitter.username`、`tools/fetch-twitter.js` 的默认值。

## 自定义域名

1. 新建 `source/CNAME`，内容只有一行域名，例如 `blog.example.com`。Hexo 会把它复制到 `public/CNAME`，部署时一起推上去。
2. **Settings → Pages → Custom domain** 填同一个域名。
3. `_config.yml` 的 `url` 改成 `https://blog.example.com`。
4. DNS 按 GitHub 文档配置（apex 用 A 记录，子域用 CNAME）。

## 写一篇新文章

```bash
pnpm exec hexo new post --path tech/2026-11-02-my-post
```

会生成 `source/_posts/tech/2026-11-02-my-post.md` 和同名资源目录。文件名约定 `YYYY-MM-DD-slug.md`，日期前缀由 `scripts/post-slug.js` 去掉，最终 URL 是 `/2026/11/02/my-post/`。

推荐 frontmatter（`scaffolds/post.md` 只生成最小字段，其余手写）：

```yaml
---
title: 文章标题
date: 2026-11-02
categories: tech        # tech 或 life，必须与子页配置里的 name 对应
tags: [Hexo, 前端]
timeline: article       # 与 _config.tranquility.yml 的 timeline.items 对应
toc: true
description: 可选，用于 SEO 描述
---
```

- **不要手写 `updated`**：`scripts/git-updated.js` 会用该文件最后一次 git 提交时间覆盖。
- **图片**：用标准 Markdown 相对路径，第一段就是文章资源目录名：

  ```md
  ![示意图](2026-11-02-my-post/diagram.png)
  ```

  `scripts/post-assets.js` 会在构建时改写成 `/2026/11/02/my-post/diagram.png`。不要用 `{% asset_img %}`，编辑器预览不支持；裸文件名也可用，但文件必须确实在资源目录里。
- **改 slug 或移动文章会破坏旧链接**：在 `scripts/redirects.js` 的 `REDIRECTS` 里加 `旧路径 → 新路径`，构建时会生成带 canonical 和 meta refresh 的跳转页。
- **新增分类**：在 `_config.tranquility.yml` 的 `subpage.pages` 里加一条（`name` = 分类名），否则导航里看不到。
- 分类页、`/blog/`、标签页、搜索索引都由生成器自动产出，不需要手建页面。

## 目录结构

```
_config.yml                 Hexo 站点配置（title / url / permalink / 渲染器）
_config.tranquility.yml     主题配置（导航、首页文案、友链、字体、简历）
scripts/                    站点级 Hexo 脚本
  post-slug.js              去掉文件名日期前缀
  post-assets.js            Markdown 图片路径改写
  git-updated.js            用 git 提交时间写 updated
  redirects.js              旧链接跳转表
tools/fetch-twitter.js      独立 Node 脚本：抓 X 动态（CI 调用）
source/
  _posts/{tech,life}/       文章与同名资源目录
  _data/projects.yml        开源作品卡片数据
  _data/twitter.json        X 动态快照（脚本生成，勿手改）
  robots.txt
themes/tranquility/
  layout/                   Nunjucks 模板
  source/css|js|images/     Stylus、客户端脚本、图片
  scripts/                  主题级生成器 / helper / filter
  _font/                    字体源文件（子集化的输入）
.github/workflows/
  deploy.yml                main 推送 → 构建 → 推 gh-pages
  twitter.yml               每日抓取 X 动态
```

## 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| 改了脚本没效果 | 先 `pnpm clean`，再 `pnpm build`；`db.json` 缓存了渲染结果 |
| 线上样式、图片 404 | `_config.yml` 的 `url` 少了仓库子路径（非 `<user>.github.io` 仓库时） |
| Actions 不运行 | Fork 后没启用 workflow；Actions 页点启用，并检查 Workflow permissions |
| 第一次访问是原作者的站点 | fork 带过来的 `gh-pages` 分支还没被自己的构建覆盖 |
| `updated` 全是构建当天 | 构建环境是浅克隆；`deploy.yml` 已设 `fetch-depth: 0`，本地可用 `git fetch --unshallow` |
| 构建日志出现 `Undefined CHARARRAY` | 字体子集器的已知噪音，不影响产物 |
| 搜索没有结果 | 需要在生成后的站点上测（`pnpm build && pnpm server`），搜索读取的是构建出的 `search.json` |
| 怎么同步作者的更新 | 不建议直接 `git merge upstream/main`，那会把原作者的文章和配置一起带回来。上游是本博客本身，只按需挑拣 `themes/tranquility` 下的修复，且先确认与你的改动不冲突 |

## 许可与版权

- 主题 `themes/tranquility` 基于 [hooozen/hexo-theme-tranquility](https://github.com/hooozen/hexo-theme-tranquility)，MIT 许可，版权声明见 `themes/tranquility/LICENSE`。二次分发请保留该文件与声明。
- 仓库内文章、图片、favicon / logo、简历与个人资料版权归原作者所有。**Fork 用于自己的博客时请删除这些内容**，不要作为自己的作品继续发布。
- 仓库根目录未附独立 LICENSE；如需开源自己的版本，请自行添加，并保留主题的 MIT 声明。
