---
title: 如何在服务器中快捷部署V2Ray代理
date: 2025-11-11
categories: tech
tags: [V2Ray, 代理, 服务器, 网络工具, 自动化脚本]
timeline: article
toc: true
---

> 科研服务器上除了各种镜像源，网络环境也得先配置好。这篇笔记记录 V2Ray 脚本的安装和日常用法，方便以后照着操作。

# 安装 V2Ray

这里使用 `install_v2ray.sh`，安装过程不需要 root 权限。脚本支持 VMess、VLESS 和 Shadowsocks，可以解析订阅、切换节点、查看状态，并提供本机代理和局域网共享两种模式。局域网共享可以设置用户名和密码认证，DNS 与路由配置见下文。

## 安装步骤

### 1. 网络受限时先配置临时代理

如果服务器无法直接访问外网，先通过 SSH 反向隧道建立临时代理：

```bash
# 在本地机器上执行（确保本地有代理服务运行在10809端口，根据自己情况，设置别的端口也可以）
ssh -R 10809:127.0.0.1:10809 username@your-server-ip -p ssh-port
```

然后在服务器上设置代理环境变量：

```bash
export http_proxy=http://127.0.0.1:10809
export https_proxy=http://127.0.0.1:10809
```

### 2. 下载并运行安装脚本

```bash
# 下载安装脚本
wget https://raw.githubusercontent.com/ox0pine/server-scripts/main/proxy/linux/install_v2ray.sh

# 给脚本执行权限
chmod +x install_v2ray.sh

# 运行安装脚本
./install_v2ray.sh
```

### 3. 输入订阅链接

安装过程中按提示输入 V2Ray 订阅链接：

```
请输入订阅链接: https://your-subscription-url.com/link/xxxxx
```

### 4. 选择节点

脚本解析订阅后会列出可用服务器，输入编号选择要连接的节点：

```
=== 所有服务器 (25) ===
[1] 香港-VMess-01
    VMESS - hk1.example.com:443
[2] 美国-VLESS-02
    VLESS - us1.example.com:443
[3] 日本-SS-03
    SHADOWSOCKS - jp1.example.com:8080

请选择要使用的服务器 (1-25) [默认: 1]: 1
```

### 5. 加载别名并开启代理

安装完成后执行：

```bash
source ~/.bashrc
proxy_on
source ~/.bashrc
```

## 日常管理命令

别名需要执行 `source ~/.bashrc` 后生效。常用命令如下：

```bash
# 服务管理
v2start          # 启动V2Ray
v2stop           # 停止V2Ray
v2restart        # 重启V2Ray
v2status         # 查看状态
v2log            # 查看日志

# 服务器管理
v2switch         # 切换服务器
v2list           # 列出所有服务器
v2vmess          # 列出VMess服务器
v2vless          # 列出VLESS服务器
v2ss             # 列出Shadowsocks服务器

# 订阅管理
v2update         # 更新订阅
v2scan           # 重新解析订阅

# 代理连接
v2connect        # 快速连接代理
proxy_on         # 开启代理
proxy_off        # 关闭代理
proxy_status     # 查看代理状态
```

## 端口、DNS 和路由

### 代理端口

| 代理类型 | 端口 | 用途          |
| -------- | ---- | ------------- |
| SOCKS5   | 1080 | 通用代理协议  |
| HTTP     | 8080 | HTTP 代理协议 |

### DNS

- **国内 DNS**: 223.5.5.5 (阿里云)
- **备用 DNS**: 114.114.114.114
- **国外 DNS**: 8.8.8.8 (Google)
- **分流规则**: 按国内外地址分流

### 路由规则

- **直连**: 私有 IP、国内 IP、国内域名
- **代理**: 国外 IP 和域名
- **策略**: IPOnDemand

## 文件结构

V2Ray 的工作目录是 `~/v2ray/`，各文件用途如下：

```
~/v2ray/
├── v2ray                    # V2Ray 主程序
├── config.json              # 当前配置文件
├── servers_all.json         # 所有服务器配置
├── subscription.txt         # 原始订阅内容
├── subscription_url.txt     # 订阅链接
├── v2ray.log                # 运行日志
├── v2ray.pid                # 进程PID文件
├── full_parser.py           # 订阅解析脚本
├── server_manager.py        # 服务器管理脚本
├── start.sh                 # 启动脚本
├── stop.sh                  # 停止脚本
├── restart.sh               # 重启脚本
├── status.sh                # 状态脚本
├── switch.sh                # 切换脚本
├── update.sh                # 更新脚本
└── connect.sh               # 连接脚本
```

## 常见问题

### 更换订阅链接

运行 `v2update`，按提示输入新的订阅链接。

### 切换节点

运行 `v2switch`，输入要切换的服务器编号。

### 让局域网中的其他设备使用代理

配置时选择局域网共享模式，其他设备通过下面的地址连接：

- SOCKS5: `socks5://用户名:密码@服务器IP:1080`
- HTTP: `http://用户名:密码@服务器IP:8080`

### 查看当前节点

运行 `v2status`，输出中会包含当前服务器信息。

### 连接失败

按下面的顺序排查：

1. 运行 `v2status`，确认服务状态。
2. 运行 `v2log`，检查错误日志。
3. 运行 `v2switch`，尝试其他节点。
4. 运行 `v2update`，更新订阅。

如果还无法定位问题，可以直接检查 `~/v2ray/v2ray.log`，或到项目仓库提交 Issue。

## 版本记录

### v3.0

- 新增 VLESS 协议支持
- 调整订阅解析算法
- 调整服务器管理界面
- 补充错误处理
- 添加连接测试功能

### v2.0

- 重构配置生成逻辑
- 支持局域网共享模式
- 添加用户认证功能
- 调整 DNS 配置

### v1.0

- 支持 VMess
- 解析订阅
- 切换服务器

## 相关资源

- 脚本仓库：[https://github.com/ox0pine/server-scripts](https://github.com/ox0pine/server-scripts)
- V2Ray 官方文档：[https://www.v2fly.org/](https://www.v2fly.org/)

---

**注意**：本脚本仅用于学习和研究目的，请遵守当地法律法规。
