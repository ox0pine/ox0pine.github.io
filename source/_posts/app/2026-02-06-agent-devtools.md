---
title: agent_devtools：给 Claude Code 配一套自己的工具箱
date: 2026-02-06
categories: app
tags: [Claude Code, MCP, Skill, AI Agent]
timeline: app
toc: true
---

> 模型每次只看到技能的名字和一行描述，判断这活归谁管，再整篇读进来。所以「让它知道怎么做」最省事的方式，是把做法写成文件放在它手边。

<!--more-->

## 是什么

`agent_devtools` 是面向 Claude Code 的个人开发工具包：一边是可复用的技能（Skills），一边是 MCP 服务器。目前落地的是第一个技能——Base UI。

## devkit-skills/base-ui

[Base UI](https://base-ui.com) 是无样式的 React 可访问组件库，文档分散在几十个组件页里。把它压成技能后：

- 34+ 个组件的 API 说明与用法；
- 按表单 / 导航 / 反馈 / 布局 / 展开分类；
- 无障碍与样式定制指南，含 TypeScript 与组合模式；
- 一份中英双语的离线搜索脚本：

```sh
cd devkit-skills/base-ui
python scripts/search.py 表单
python scripts/search.py --list
```

搜索脚本是给「不想把整份文档喂给模型」准备的：先本地查，再决定读哪一段。

## 怎么装

```sh
cp -r devkit-skills/base-ui ~/.claude/skills/
```

或在 Claude Code 配置里加 `skillsPath`。之后直接问「Dialog 有哪些 props」「帮我做一个可访问的下拉菜单」就会命中这个技能。

## 路线图

MCP 服务器部分还在搭：目标是让「查文档、跑检查、读仓库状态」这类动作走统一的工具调用，而不是每次现写命令。

- 仓库：[ox0pine/agent_devtools](https://github.com/ox0pine/agent_devtools)
