# Repository Guidelines

## Project Overview

Personal Hexo 8 blog (`秋风飘起黄叶落のblog`) at https://ox0pine.github.io, built from Markdown and deployed to GitHub Pages. No application runtime: the repo produces a static site in `public/`, which CI publishes to the orphan `gh-pages` branch.

The theme `themes/tranquility` is vendored and heavily patched in-tree — treat it as first-party code, not an upstream dependency.

## Architecture & Data Flow

```
source/_posts/**/*.md          Markdown + frontmatter
        │
        ├─ before_post_render  (scripts/*.js, themes/tranquility/scripts/filters/*)
        │    priority 5  post-slug.js   strip YYYY-MM-DD- from slug
        │    priority 5  filters/html.js  ```mermaid → <pre class="mermaid">
        │    priority 6  post-assets.js  image paths → /<permalink>/<file>
        │    priority 10 Hexo core backtick_code_block
        ├─ renderer (hexo-renderer-marked, built-in nunjucks/yaml)
        ├─ after_post_render   git-updated.js  set `updated` from git log
        ├─ after_render:html   filters/html.js  lazy images, conditional mermaid <script>
        ▼
generators: hexo-generator-index, tag, feed, sitemap
            themes/.../search.js → search.json
            themes/.../subpage.js → /blog/, configured subpages
            themes/.../font.js   → /font/<style>.ttf (opentype.js subset)
            themes/.../cv.js, scripts/redirects.js
        ▼
layout/*.njk (nunjucks) + source/css/*.styl → public/
```

Two script roots are auto-loaded by Hexo, **theme scripts first, then site scripts** (Hexo 8 `load_plugins.js` requires every file recursively). That means top-level `hexo.extend.*` registrations work in any file; exported factories must be `require`d from a loader (`themes/tranquility/scripts/index.js`). Site `scripts/` therefore wins on identical hook+priority.

Hook priority is the ordering contract between scripts. Keep the comments that state it.

## Key Directories

| Path | Purpose |
| --- | --- |
| `source/_posts/{tech,life}/` | Posts; one category each (`tech` \| `life`), which also drives the nav subpages |
| `source/_posts/<post-name>/` | Post asset folder (`post_asset_folder: true`), named exactly like the `.md` |
| `source/robots.txt` | Only hand-written file in `source/`; disallows `/css/`, `/js/`, `/search.json` |
| `scripts/` | Site-level filters/generators: slug, assets, git dates, legacy redirects |
| `tools/` | Standalone maintenance scripts run by CI, not by Hexo |
| `source/_data/twitter.json` | X 动态快照，written by `tools/fetch-twitter.js`; never hand-edit |
| `source/_data/projects.yml` | 开源作品数据：`/apps/` 的卡片直链，由 `_generator/projects.js` 读取，不为项目生成文章 |
| `themes/tranquility/scripts/` | Theme hooks: `_generator/`, `_helper/`, `filters/` |
| `themes/tranquility/layout/` | Nunjucks templates (`index`, `post`, `category`, `tag`, `twitter`, `cv`, `_partials/`) |
| `themes/tranquility/source/` | Stylus CSS entries + client JS (`search.js`, `copy-code.js`, `heart-curve.js`) |
| `themes/tranquility/_font/` | LXGW WenKai sources (`normal.ttf` = Regular, `bold.ttf` = Medium, ~49 MB, SIL OFL); `_generator/font.js` subsets them to every glyph used by posts, pages, tweets and config |
| `_config.yml` / `_config.tranquility.yml` | Hexo core config / theme config override |

## Development Commands

```bash
pnpm install --frozen-lockfile   # CI-equivalent install
pnpm clean && pnpm build         # hexo clean && hexo generate → public/
pnpm server                      # http://localhost:4000 (default port 4000)
pnpm exec hexo new post --path life/2025-10-30-my-slug   # new post + asset folder
```

- **Always `pnpm clean` after changing anything in `scripts/` or `themes/*/scripts/`** — rendered post HTML is cached in `db.json`, so filter edits appear to do nothing otherwise.
- Pass `--path` for directories; `hexo new post life/x` slugifies the slash into the filename.

## Code Conventions & Common Patterns

- **Post filenames**: `YYYY-MM-DD-kebab-case.md`. The date prefix is stripped from the slug by `scripts/post-slug.js`; permalink is `:year/:month/:day/:name/`.
- **Frontmatter**: every post has `title`, `date`, `categories` (one of `tech`/`life`), `tags`, `timeline`, `toc`. `scaffolds/post.md` only emits title/date/tags — add the rest by hand. Never set `updated`; `scripts/git-updated.js` owns it (`updated_option: date` is only the fallback).
- **Images**: standard Markdown, path relative to the `.md` as the editor sees it, and the post's asset folder must be the first segment:
  ```md
  ![东城地坛公园 — 2024年11月](2025-11-17-weekly-01-restart/ditan-park.jpg)
  ```
  `scripts/post-assets.js` rewrites it to `/2025/11/17/weekly-01-restart/ditan-park.jpg`; bare filenames work only if the file exists in that folder. `marked.postAsset` is deliberately **off** (it adds a duplicate dated directory). Do not reintroduce `{% asset_img %}` — no Markdown preview understands it.
- **Renaming or moving a post breaks its URL**: add `old-slug → new-slug` to the table in `scripts/redirects.js`, which emits `noindex` + canonical + meta-refresh pages.
- **Refactor the theme, don't fork it**: templates are Nunjucks (`.njk`), styles are Stylus. CSS partials are `_`-prefixed and import-only; only top-level `source/css/*.styl` compile to files. Class names are BEM-ish (`post-content__head`, `post-inner--toc`); reuse existing variables from `_variables.styl` (`$max-width: 1200px`, `$content-width: 900px`).
- **Server-side JS style**: `'use strict'`; `module.exports = hexo => { hexo.extend… }`; `const`/arrow functions; no TypeScript, no build step, CommonJS. Helpers live in `themes/tranquility/scripts/_helper/` and are registered once in `_helper/index.js`.
- Client JS is plain ES2017, loaded conditionally by templates (search only when local search is on, MathJax only via `needs_math()`, Mermaid only on pages containing a diagram).
- Config comments are Chinese and explain *why*; keep that convention when touching `_config.yml` / `_config.tranquility.yml`.

## Important Files

| File | Notes |
| --- | --- |
| `_config.yml` | URL, `permalink: :year/:month/:day/:name/`, `new_post_name: :title.md`, `post_asset_folder`, `marked`, `feed:`, `sitemap:` |
| `_config.tranquility.yml` | Theme settings consumed by templates/generators (`subpage.pages` defines tech/life nav entries) |
| `scripts/post-slug.js` / `post-assets.js` | The two URL-shaping filters; priorities 5 and 6 |
| `scripts/git-updated.js` | `git log -1 --format=%cI`; requires full clone (`fetch-depth: 0`) |
| `scripts/redirects.js` | Legacy URL table — the only place old links survive |
| `tools/fetch-twitter.js` | Standalone Node script (not a Hexo plugin): fetches X posts into `source/_data/twitter.json`. Lives outside `scripts/` because Hexo `require`s every file there |
| `themes/tranquility/scripts/_helper/seo.js` | Single source of title/description/OG/Twitter/JSON-LD; used by `layout/_partials/layout.njk` |
| `themes/tranquility/scripts/filters/html.js` | Mermaid conversion + conditional bundle, lazy images, both `before_post_render` and `after_render:html` |
| `themes/tranquility/scripts/_generator/search.js` | Writes `search.json` (`title`, `url`, `content`, `tags`, `categories`); `source/js/search.js` consumes it lazily |
| `.github/workflows/deploy.yml` | Node 24, pnpm 12.15.0, `pnpm build`, `peaceiris/actions-gh-pages@v4` → `gh-pages` |
| `.github/workflows/twitter.yml` | Daily cron: `node tools/fetch-twitter.js` → commits `source/_data/twitter.json` → deploy |

## Runtime/Tooling Preferences

- Runtime Node **>= 24** (CI pins 24; local dev has run 26). Package manager is **pnpm 12.15.0** (`packageManager` field) — never `npm install`, never commit a `package-lock.json`.
- Hexo 8 bundles the nunjucks/yaml/plain renderers; only `hexo-renderer-marked` and `hexo-renderer-stylus` are dependencies. Adding a Hexo plugin means adding a dependency and a config block.
- `public/`, `db.json`, `node_modules/`, `.deploy*/` are gitignored — never commit build output or hand-edit `public/`.
- Deployment is push-triggered only: `git push origin main` → Actions → `gh-pages`. There is no `hexo deploy` config.
- No linter, formatter, typecheck, or test runner is installed. Match surrounding style; do not add tooling without asking.

## Testing & QA

No automated test suite. Verification is "build it and look at the output", and it is expected before reporting done:

```bash
pnpm clean && pnpm build                     # one line: "INFO  N files generated", no errors
pnpm server --port 4123                      # then inspect real pages, not just the HTML string
grep -o '<img [^>]*>' public/2025/11/17/weekly-01-restart/index.html
curl -s -o /dev/null -w '%{http_code}\n' https://ox0pine.github.io/2025/11/17/weekly-01-restart/
```

- Known-benign build noise: opentype.js `Undefined CHARARRAY` logs from the font subsetter.
- When a change affects URLs, verify the new URL **and** the redirect source (`curl -I` old path, expect 200 + meta refresh/canonical).
- After pushing, confirm CI (`gh run watch --exit-status`) and then re-curl the live page with a cache-busting query.
- Anything touching `scripts/` needs a post with the affected pattern rendered end-to-end — a clean build alone does not prove the filter ran.
