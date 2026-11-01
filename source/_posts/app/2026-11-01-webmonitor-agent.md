---
title: WebMonitor-Agent：用一句话创建一条监控
date: 2026-11-01
categories: app
tags: [AI Agent, Python, Docker, Postgres, 自托管]
timeline: app
toc: true
---

> 上一代要你先会看 DOM、写 XPath、想清楚阈值。这一代把这三步换成一句人话，再加一次人工确认。

<!--more-->

## 从「描述」到「规则」

你说「盯着这个页面的价格，跌 10% 告诉我」，助手会打开页面、真实采样一次、把「盯哪一块、比什么、什么时候报警」整理成一条规则。**你看过预览、确认之后**，定时任务才开始跑。

可用的条件类型：

- 某段文本的变化；
- 关键词出现 / 消失；
- 数值与阈值比较；
- 百分比或绝对值的变动；
- 列表项的新增 / 更新 / 删除。

检查间隔从 1 分钟到 24 小时。

## 它明确承认的边界

- 只抓公网 `http(s)`、80 / 443 端口；
- 需要登录的页面、`iframe` 与 Shadow DOM 里的内容读不到；
- 采样预览会告诉你「这次只覆盖了页面的一部分」，而不是假装全都看到了。

## 部署比第一代重

因为它真的会开一个浏览器去取样，所以 compose 里除了应用还有一套受控环境：

- **nginx** 反向代理；
- **Postgres** 存规则与历史；
- **MinIO** 存样本与产物；
- **受控出口**（squid + unbound）与浏览器 seccomp 配置——把抓取时的出网范围收窄；
- 一个 **OpenAI Chat Completions 兼容**的模型服务（key、base URL、模型名）。

仍然是「下载部署文件 + 写 `.env` + `docker compose up -d`」三步。

## 和 WebMonitor 的分工

[WebMonitor](https://github.com/webmonitor/WebMonitor) 是确定性的：位置固定、按频率比对、变了就发信，不需要模型。WebMonitor-Agent 处理的是「我不知道该选哪块 / 条件需要用语言描述」的场景。两者并存，规则简单的用前者更省心。

- 仓库：[webmonitor/WebMonitor-Agent](https://github.com/webmonitor/WebMonitor-Agent)
