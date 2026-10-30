# AGENTS.md

This file provides guidance for agentic coding assistants working in this Hexo static blog repository.

## Project Overview

Hexo static blog site using the "tranquility" theme. Blog content is written in Markdown with frontmatter. Theme uses Nunjucks templates (`.njk`), Stylus (`.styl`), and JavaScript (`.js`).

## Build Commands

```bash
npm run server    # Start local dev server at http://localhost:4000
npm run build     # Generate static files to public/ (hexo generate)
npm run clean     # Clean generated files and cache (hexo clean)
```

Direct hexo commands also work:
```bash
hexo new "post-title"      # Create new post in source/_posts/
hexo new draft "title"     # Create draft
hexo new page "page-name"  # Create page
hexo publish "draft-title" # Publish draft
```

**No test or lint commands are configured.** Run `npm run build` to verify changes compile correctly.

## Code Style Guidelines

### JavaScript (CommonJS)

- Use `'use strict';` at the top of every `.js` file
- Use `module.exports = functionName` or `module.exports = (ctx) => { ... }`
- Use `require()` for imports (CommonJS, not ES modules)
- Prefix hexo filter/generator/helper registration with comment: `/* global ctx */` or `/* global hexo */`
- Use template literals for string interpolation

```javascript
/* global ctx */
'use strict';

const pagination = require('hexo-pagination');

module.exports = ctx => {
  ctx.extend.generator.register('subpage', subpage_generator);
};
```

### Nunjucks Templates (`.njk`)

- Indent with 2 spaces
- Use macros for reusable components: `{% import "_partials/macros/tags.njk" as tags %}`
- Filter chains: `{{ post.title | truncate(40, true) }}`
- Template variables accessed via `site`, `page`, `config`, `theme`

```njk
{% if page.category %}
  <span class="category">{{ page.category }}</span>
{% endif %}
```

### Stylus (`.styl`)

- Use 2-space indentation
- Prefer nested selectors
- Use variables from `_variables.styl`
- Use mixins from `_mixins.styl`
- Property order: display, positioning, box model, typography, visual, animation

```stylus
.post-card
  display: flex
  flex-direction: column
  padding: 16px
  background: $card-bg

  &:hover
    transform: translateY(-2px)
```

### Markdown Posts

- Use frontmatter with: `title`, `date`, `tags`, `categories`
- Categories organize content into subpages (use "tech", "life", etc.)
- Use standard Markdown syntax
- Code blocks with language tags for syntax highlighting

```yaml
---
title: Post Title
date: 2024-01-15 12:00:00
tags: [javascript, hexo]
categories: tech
---
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (JS) | camelCase | `subpage.js`, `htmlGenerator.js` |
| Files (Nunjucks) | snake_case | `post_nav.njk`, `related_post.njk` |
| Variables | camelCase | `subpageGenerator`, `perPage` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_PER_PAGE` |
| Hexo helpers | snake_case | `html_generator`, `trqlt_tagcloud` |
| CSS classes | kebab-case | `post-card`, `nav-menu` |

## Error Handling

- Use `console.warn()` for non-critical warnings
- Return early when validation fails
- Log meaningful messages: `console.warn(\`Warn: No posts in subpage '${page.title}'\`)`
- Don't throw errors for missing optional config; use `Object.assign()` with defaults

## Theme Architecture

```
themes/tranquility/
├── scripts/          # Hexo generators, helpers, filters
│   ├── _generator/   # Page generators (subpage, cv, search, font)
│   ├── _helper/      # Template helpers
│   └── index.js      # Main entry
├── layout/           # Nunjucks templates
│   ├── index.njk
│   ├── post.njk
│   └── _partials/    # Reusable components
├── source/
│   ├── css/          # Stylus stylesheets
│   └── js/           # Client-side scripts
└── _config.tranquility.yml
```

## Configuration Files

- `_config.yml` - Hexo main config (URL, writing settings)
- `_config.tranquility.yml` - Theme config (navigation, features, styling)
- `scaffolds/` - Templates for new posts/pages/drafts

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci` +
`npm run build` on Node 20 and publishes `public/` to the `gh-pages` branch.
GitHub Pages serves `gh-pages` at `https://ox0pine.github.io`. Never commit `public/`.
