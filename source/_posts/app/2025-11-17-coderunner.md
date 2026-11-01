---
title: CodeRunner：自托管的 Python 代码执行平台
date: 2025-11-17
categories: app
tags: [FastAPI, React, Docker, 全栈]
timeline: app
toc: true
---

> 「在线跑一段别人的代码」听起来是个小功能，实际上每个口子都要防：执行超时、内存、配额、密钥、日志。与其把这些交给第三方，不如自己控。

<!--more-->

## 它做了什么

CodeRunner 是一个基于 FastAPI + React 18 + Ant Design 的远程代码执行平台。核心是四件事：

- **执行**：临时文件执行、跑完清理，按用户等级限制超时与内存；
- **配额**：四级用户（免费 / 基础 / 高级 / 企业），分别对应每日执行次数、API 调用、超时、内存、保存数量；
- **AI 辅助**：接 Qwen、OpenAI、Claude 或任意 OpenAI 兼容接口，用户自带 key，参数（temperature、max_tokens）可调；
- **代码库与社区**：片段存取、标签分类、公开/私有分享，帖子、评论、点赞、收藏。

## 安全与审计

- JWT 认证 + Argon2 密码哈希；
- 管理员 / 普通用户分离，权限按等级下发；
- 每次执行留下系统日志：谁、什么时间、来自哪个 IP、用了多少内存、退出码是什么。

## 为什么自建

在线的代码执行服务，风险集中在隔离与配额。自建之后，容器怎么配、超时多久、谁能调多少，全在自己手里；出问题也能直接看日志，而不是等对方回复工单。

演示站还开着（默认 `admin / admin123`，登录后记得改密码）。

## 技术栈

FastAPI + SQLAlchemy + Docker（执行与部署）、React 18 + Ant Design（前端）、JWT + Argon2（认证）。

- 仓库：[ox0pine/CodeRunner](https://github.com/ox0pine/CodeRunner)
- 演示：[code.qfpqhyl.cloudns.org](https://code.qfpqhyl.cloudns.org/)
