---
title: RepoPilot：把 Issue 变成可审阅的代码变更
date: 2026-11-01
categories: app
tags: [AI, FastAPI, Vue3, Docker, 自托管]
timeline: app
toc: true
---

> 让模型改代码，难的不是生成，是信任：谁改的、改了什么、能不能回滚。RepoPilot 把这条链路上的每一步都摊开来给人看。

<!--more-->

## 它解决什么问题

大多数「AI 写代码」的形态是：给一段需求，直接吐一个 diff。问题在于，真实仓库里 diff 不能直接进主干——得有人先看方案、再看检查结果、最后才决定要不要合并。

RepoPilot 是一个自托管的 AI 编码工作台，面向 Python、React 和 Vue 仓库。它把「生成」拆成了有审批环节的流水线，而不是一次问答。

## 流程

1. **固定来源**：校验仓库、完整 commit SHA 和同仓库的 Issue，保存不可变的来源快照与有限源码上下文；
2. **先审方案**：生成方案后可以反馈、修订，版本留痕；
3. **人工批准**：点「批准并执行」才排队运行；
4. **隔离执行**：单个 Worker 在受限 Docker 容器里跑，支持状态轮询、日志查看和取消；
5. **可审阅成果**：同一个页面里给出实际命令、退出码、检查结果和按文件分组的 diff；
6. **显式交付**：下载 patch，或确认后推送到自己仓库的修复分支，**不自动开 PR、不自动合并**。

## 几个实现上的取舍

- 环境准备不做「万能脚本」：识别 Python / Node 前端项目，按项目声明与锁文件装依赖、起语言服务器，跑项目里已有的检查命令；
- 交付只到「分支」为止，PR 与合并留在 GitHub 上由人决定，避免工具替你把关；
- 执行容器的能力被刻意收窄，任务可取消，日志与报告都落盘。

## 技术栈

FastAPI + Vue 3 + Docker Compose，Python 3.12+，许可证是 PolyForm Noncommercial（非商用）。

- 仓库：[ox0pine/RepoPilot](https://github.com/ox0pine/RepoPilot)
