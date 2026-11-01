---
title: WebMonitor：盯住网页的一小块，变了就发邮件
date: 2026-11-01
categories: app
tags: [Python, FastAPI, React, Selenium, Docker, 自托管]
timeline: app
toc: true
---

> 想盯的东西往往只有一小块：价格、公告、放号、补货。给一个网页地址和一段 XPath，剩下的交给定时任务。

<!--more-->

## 它是怎么工作的

1. 填页面地址和要盯的那部分元素的 XPath；
2. 选检查频率；
3. 只在**选中元素内的文本**变化时发邮件，导航、广告、页面其它区域怎么变都不算数。

结果在 Web 界面里能看到：任务列表、最近一次检查的结果、历史变化。JavaScript 动态渲染的页面也能抓。

## 适合盯什么

| 场景 | 选中的部分 |
| --- | --- |
| 商品价格与库存 | 显示价格或库存状态的那块 |
| 通知与公告 | 公告栏或新闻列表 |
| 软件发版 | 版本号、更新日志标题 |
| 报名截止 | 会变动的日期或说明 |

## 部署就是一个 compose 文件

```sh
mkdir webmonitor && cd webmonitor
curl -fsSLo compose.yaml \
  https://raw.githubusercontent.com/webmonitor/WebMonitor/main/compose.yaml
# 写 .env：SECRET_KEY（≥32 位随机串）+ 初始管理员账号
docker compose up -d
```

镜像来自 `ghcr.io/webmonitor/webmonitor`，不需要登录；想可复现就把 `latest` 换成固定版本号。

## 几个安全默认值

- `TARGET_ALLOWED_ORIGINS` 默认为空：只允许抓公网的 `http(s)` 地址。要抓内网目标必须显式列出精确的协议 + 端口，避免这个服务被当成内网探测器；
- 初始管理员的用户名/邮箱/密码只在数据库里没有管理员时生效，之后改 `.env` 不会覆盖已有账号；
- 不需要 AI、不需要模型 key、也不需要 GitHub 账号——它就是「定时抓取 + 比对 + 通知」。

项目现在挂在 [webmonitor](https://github.com/webmonitor) 组织下。

- 仓库：[webmonitor/WebMonitor](https://github.com/webmonitor/WebMonitor)
- 演示：[webmonitor.qfpqhyl.top](https://webmonitor.qfpqhyl.top/)
