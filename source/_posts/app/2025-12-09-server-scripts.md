---
title: server-scripts：把新服务器从裸机到能用压成几条命令
date: 2025-12-09
categories: app
tags: [Shell, Linux, Docker, 运维]
timeline: app
toc: true
---

> 每换一台服务器，换源、装工具、配 SSH、装 Docker、装 Python、调内核参数——同一套动作做第十遍的时候，就该写成脚本了。

<!--more-->

## 面向谁

国内网络环境下的开发机和科研服务器：镜像源慢、代理难配、环境一装就乱。`server-scripts` 把这些步骤拆成五个可以单独执行的模块，也可以一条命令全跑。

## 五个模块

| 目录 | 作用 |
| --- | --- |
| `init/` | 系统初始化：换国内镜像源、装基础工具、SSH 与时区配置、系统参数 |
| `proxy/` | V2Ray 安装：Linux 与 WSL 两份，支持 VMess / VLESS / Shadowsocks |
| `docker/` | Docker 与 Compose 安装、镜像加速、非 root 使用 |
| `python/` | Miniconda 安装与配置，多版本环境管理 |
| `performance/` | 内核参数与资源限制调优 |

## 用法

```sh
sudo ./init/system_init.sh --auto     # 非交互，适合新机器
./proxy/linux/install_v2ray.sh        # 代理，支持订阅链接解析
./docker/install_docker.sh
./python/setup_python.sh
sudo ./performance/optimize.sh
```

脚本保持「可读优先」：每个文件都是一个独立场景，变量集中在顶部，不需要懂一整套框架就能改。`--auto` 只是跳过确认，不会偷偷做别的事。

## 一点经验

这类脚本最大的价值不是省那几分钟，而是**可重复**：机器重装、迁移、交接的时候，结果是一样的；出问题时也能按模块回滚，而不是面对一堆散落的手工命令。

- 仓库：[ox0pine/server-scripts](https://github.com/ox0pine/server-scripts)
