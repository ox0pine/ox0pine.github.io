---
title: campus-connect-ddns：校园网保活 + Cloudflare DDNS
date: 2026-10-24
categories: app
tags: [Python, 校园网, Cloudflare, DDNS, systemd]
timeline: app
toc: true
---

> 宿舍和实验室的网络断一次，远程连接就断一次。这个工具就是让「断线重连」这件事不需要人管。

<!--more-->

## 场景

西电的校园网走 SRun 门户认证：一段时间不活动、或者出口 IP 变了，就要重新登录。挂机的机器一旦掉线，SSH、下载、跑着的任务全断。

另外，出口是动态 IP，想从外面连回来就得知道当前的地址。

`campus-connect-ddns` 把这两件事合在一个命令里：**保活**，以及**把当前出口 IPv4 写到 Cloudflare 的 A 记录**。

## 怎么用

只用 Python 标准库，没有第三方依赖，也不需要浏览器或 WebDriver：

```sh
cp config.example.ini config.ini      # 填 [srun] 的账号密码
chmod 600 config.ini

python3 -m campus_connect_ddns -c config.ini status   # 看门户会话与外网连通性
python3 -m campus_connect_ddns -c config.ini run      # 前台保活
python3 -m campus_connect_ddns -c config.ini login    # 立即登录一次
```

开机自启在 Linux 上一条命令：`sudo sh deploy/install.sh`，之后用 `systemctl` 和 `journalctl` 管理。

## 设计上的几个克制

- **只在需要时认证**：先 TCP 探活，失败再查门户，只有门户确实离线才尝试登录，避免把账号刷进风控；
- **DDNS 默认关闭**：只要保活的场景不必配置 Cloudflare；
- **说清楚边界**：DNS 更新不会打通 NAT，也绕不过校园网隔离——它能给你的只是「知道 IP」；
- **可读优先**：配置走 `config.ini`，命令行有 `status / login / run` 三个入口，出问题看 `docs/troubleshooting.md`。

核心的登录与加密逻辑来自 [coffeehat/BIT-srun-login-script](https://github.com/coffeehat/BIT-srun-login-script)，这里重写了配置管理、保活策略、DDNS 与部署部分，并适配了西电门户。

- 仓库：[ox0pine/campus-connect-ddns](https://github.com/ox0pine/campus-connect-ddns)
