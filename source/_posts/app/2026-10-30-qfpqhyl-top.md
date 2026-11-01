---
title: qfpqhyl.top：用 React + Vite 做的个人主页
date: 2026-10-30
categories: app
tags: [React, Vite, TypeScript, Base UI]
timeline: app
toc: true
---

> 博客负责写，主页负责展示。两件事分开做，反而都做得更顺手。

<!--more-->

## 为什么要第二个主页

这个 Hexo 站是「写东西」的地方：长文、周记、踩坑记录，内容一多，导航就重。

[qfpqhyl.top](https://qfpqhyl.top) 是另一件事——一屏之内说清楚「我是谁、最近写了什么、最近在写什么代码」。它是给路过的人看的，不需要读完。

## 页面里有什么

- **最近文章**：从博客时间线抓标题、链接、日期；
- **最近工具 / 仓库**：按 GitHub handle 拉公开仓库；
- **基础社交入口**：GitHub、博客、X。

内容不是手写的，`npm run generate:content` 在构建前跑一次，把博客和 GitHub 的数据写进 `data/content.ts`；GitHub Actions 定时重新生成并部署，所以那边的首页永远和这边同步。

## 技术选型

React + Vite + TypeScript，组件用的是 [Base UI](https://base-ui.com)（无样式的可访问组件，样式自己写），部署在 Vercel。

选 Base UI 的原因是它把键盘交互、焦点管理、`aria` 这些都处理好了，我只用管视觉；比起「组件库自带一套设计语言」，这样改起来更自由。

## 想自己用

fork 之后只需要改 `config/profile.ts`：站点标题、作者名、简介、GitHub / 博客 / Twitter 链接、头像、各区块标题。改完重新生成内容再部署即可。

- 仓库：[ox0pine/qfpqhyl.top](https://github.com/ox0pine/qfpqhyl.top)
- 站点：[qfpqhyl.top](https://qfpqhyl.top)
