---
title: 如何使用Cloudflare Tunnel
date: 2026-1-24
categories: tech
tags: [Cloudflare, 网络工具]
timeline: article
toc: true
---

> 最低成本上线在线服务，避免购买公网IP服务器。

## 什么是 Cloudflare Tunnel

Cloudflare Tunnel（原名 Argo Tunnel）是 Cloudflare 提供的一项免费服务，可以让你在不需要公网 IP 的情况下，将本地服务安全地暴露到互联网上。它通过在你的服务器和 Cloudflare 网络之间建立加密隧道来工作。

### 主要优势

- **无需公网 IP**：不需要购买昂贵的公网 IP 或 VPS
- **免费使用**：Cloudflare 免费计划即可使用
- **自动 HTTPS**：自动配置 SSL 证书
- **DDoS 防护**：享受 Cloudflare 的安全防护
- **隐藏源站**：真实服务器 IP 不会暴露

## 前置准备

1. 一个 Cloudflare 账号（[注册地址](https://dash.cloudflare.com/sign-up)）
2. 一个已添加到 Cloudflare 的域名
3. 一台可以运行服务的机器（本地电脑、内网服务器等）

## 安装 cloudflared

### Windows

下载并安装 cloudflared：

```bash
# 下载最新版本
# 访问 https://github.com/cloudflare/cloudflared/releases
# 下载 cloudflared-windows-amd64.exe

# 重命名为 cloudflared.exe 并添加到系统 PATH
```

### macOS

使用 Homebrew 安装：

```bash
brew install cloudflare/cloudflare/cloudflared
```

### Linux

```bash
# Debian/Ubuntu
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# CentOS/RHEL
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
sudo rpm -i cloudflared-linux-x86_64.rpm
```

验证安装：

```bash
cloudflared --version
```

## 快速开始：临时隧道

如果只是想快速测试，可以使用临时隧道（不需要域名）：

```bash
# 将本地 8080 端口暴露到公网
cloudflared tunnel --url http://localhost:8080
```

运行后会生成一个临时的 `*.trycloudflare.com` 域名，可以直接访问。

## 创建永久隧道

Cloudflare Tunnel 提供两种创建方式：**命令行方式（CLI）** 和 **Dashboard 方式（Web 界面）**。你可以根据自己的喜好选择。

### 方式一：命令行创建（推荐）

适合喜欢命令行操作的开发者，配置更灵活。

#### 1. 登录 Cloudflare

```bash
cloudflared tunnel login
```

这会打开浏览器，选择你要使用的域名并授权。授权成功后会在本地生成证书文件。

#### 2. 创建隧道

```bash
cloudflared tunnel create my-tunnel
```

这会创建一个名为 `my-tunnel` 的隧道，并生成一个 UUID 和凭证文件。记下这个 UUID，后面会用到。

#### 3. 配置隧道

创建配置文件 `~/.cloudflared/config.yml`（Windows 在 `%USERPROFILE%\.cloudflared\config.yml`）：

```yaml
tunnel: <你的隧道UUID>
credentials-file: /path/to/.cloudflared/<UUID>.json

ingress:
  # 将 blog.example.com 路由到本地 4000 端口（Hexo 默认端口）
  - hostname: blog.example.com
    service: http://localhost:4000

  # 将 api.example.com 路由到本地 3000 端口
  - hostname: api.example.com
    service: http://localhost:3000

  # 捕获所有其他请求（必需）
  - service: http_status:404
```

#### 4. 配置 DNS

将域名指向隧道：

```bash
cloudflared tunnel route dns my-tunnel blog.example.com
cloudflared tunnel route dns my-tunnel api.example.com
```

这会自动在 Cloudflare DNS 中创建 CNAME 记录。

#### 5. 运行隧道

```bash
cloudflared tunnel run my-tunnel
```

现在访问 `https://blog.example.com` 就能访问到你的本地服务了！

### 方式二：Dashboard 创建（图形界面）

适合不熟悉命令行的用户，操作更直观。

#### 1. 进入 Cloudflare Zero Trust

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账号
3. 进入 **Zero Trust** → **Networks** → **Tunnels**
4. 点击 **Create a tunnel**

#### 2. 选择连接器类型

选择 **Cloudflared** 作为连接器类型，点击 **Next**。

#### 3. 命名并安装

1. 为隧道命名（如 `my-blog-tunnel`）
2. 点击 **Save tunnel**
3. 根据你的操作系统选择对应的安装命令
4. 在服务器上运行显示的命令（包含 token）

示例命令：
```bash
# Linux/macOS
sudo cloudflared service install <your-token>

# Windows（以管理员身份运行）
cloudflared.exe service install <your-token>
```

5. 安装完成后，连接器会显示为 **Connected**
6. 点击 **Next**

#### 4. 配置路由

有两种配置方式：

**A. 发布公开应用（Public Hostname）**

1. 在 **Public Hostname** 标签下
2. 填写配置：
   - **Subdomain**: 输入子域名（如 `blog`）
   - **Domain**: 选择你的域名（如 `example.com`）
   - **Type**: 选择 `HTTP`
   - **URL**: 输入本地服务地址（如 `localhost:4000`）
3. 点击 **Save tunnel**

**B. 连接私有网络（Private Network）**

1. 切换到 **Private Network** 标签
2. 输入私有 IP 或 CIDR 范围（如 `192.168.1.0/24`）
3. 点击 **Save tunnel**

#### 5. 验证状态

配置完成后，返回 **Tunnels** 页面，你的隧道应该显示为 **Healthy** 状态。现在就可以通过配置的域名访问你的服务了！

### 两种方式对比

| 特性 | 命令行方式 | Dashboard 方式 |
|------|-----------|---------------|
| 适用人群 | 开发者、运维人员 | 所有用户 |
| 配置灵活性 | 高（可精细配置） | 中（图形界面限制） |
| 批量操作 | 容易 | 较难 |
| 学习曲线 | 需要熟悉命令行 | 简单直观 |
| 配置文件 | 本地 YAML 文件 | 云端存储 |
| 适合场景 | 自动化部署、多隧道管理 | 快速上手、单个隧道 |

**建议**：
- 如果你是开发者或需要管理多个隧道，推荐使用命令行方式
- 如果你只需要快速部署一个服务，Dashboard 方式更简单

现在访问 `https://blog.example.com` 就能访问到你的本地服务了！

## 配置为系统服务

### Linux (systemd)

```bash
# 安装服务
sudo cloudflared service install

# 启动服务
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# 查看状态
sudo systemctl status cloudflared
```

### Windows

```bash
# 以管理员身份运行
cloudflared service install
```

### macOS

```bash
# 安装服务
sudo cloudflared service install

# 启动服务
sudo launchctl start com.cloudflare.cloudflared
```

## 高级配置

### 多个服务配置

```yaml
tunnel: <UUID>
credentials-file: /path/to/credentials.json

ingress:
  # Web 服务
  - hostname: www.example.com
    service: http://localhost:80

  # SSH 服务
  - hostname: ssh.example.com
    service: ssh://localhost:22

  # WebSocket 服务
  - hostname: ws.example.com
    service: http://localhost:8080
    originRequest:
      noTLSVerify: true

  # 默认规则
  - service: http_status:404
```

### 访问控制

在 Cloudflare Dashboard 中可以配置 Access 策略，限制谁可以访问你的服务：

1. 进入 Cloudflare Dashboard
2. 选择你的域名
3. 进入 **Access** → **Applications**
4. 创建新的应用程序并配置访问规则

### 日志配置

```yaml
tunnel: <UUID>
credentials-file: /path/to/credentials.json

# 日志级别：debug, info, warn, error
loglevel: info

ingress:
  - hostname: example.com
    service: http://localhost:8080
  - service: http_status:404
```

## 常用命令

```bash
# 列出所有隧道
cloudflared tunnel list

# 查看隧道信息
cloudflared tunnel info my-tunnel

# 删除隧道
cloudflared tunnel delete my-tunnel

# 清理未使用的连接
cloudflared tunnel cleanup my-tunnel

# 测试配置文件
cloudflared tunnel ingress validate

# 测试特定 URL 的路由
cloudflared tunnel ingress rule https://blog.example.com
```

## 故障排查

### 1. 隧道无法连接

检查服务状态：

```bash
# Linux
sudo systemctl status cloudflared

# 查看日志
sudo journalctl -u cloudflared -f
```

### 2. 502 Bad Gateway

- 确认本地服务正在运行
- 检查配置文件中的端口是否正确
- 确认防火墙没有阻止本地连接

### 3. DNS 解析问题

```bash
# 检查 DNS 记录
nslookup blog.example.com

# 重新配置 DNS
cloudflared tunnel route dns my-tunnel blog.example.com
```

### 4. 证书问题

```bash
# 重新登录
cloudflared tunnel login

# 检查证书文件是否存在
ls ~/.cloudflared/
```

## 实际应用场景

### 1. 个人博客部署

将本地运行的 Hexo 博客暴露到公网：

```yaml
ingress:
  - hostname: blog.example.com
    service: http://localhost:4000
  - service: http_status:404
```

### 2. 开发环境分享

快速分享本地开发环境给团队成员：

```bash
cloudflared tunnel --url http://localhost:3000
```

### 3. 家庭服务器

将家里的 NAS、媒体服务器等暴露到公网：

```yaml
ingress:
  - hostname: nas.example.com
    service: http://192.168.1.100:5000
  - hostname: media.example.com
    service: http://192.168.1.101:8096
  - service: http_status:404
```

### 4. IoT 设备管理

安全地访问内网的 IoT 设备管理界面。

## 安全建议

1. **启用 Cloudflare Access**：为敏感服务添加身份验证
2. **使用强密码**：为本地服务设置强密码
3. **定期更新**：保持 cloudflared 版本最新
4. **最小权限原则**：只暴露必要的服务
5. **监控日志**：定期检查访问日志

## 性能优化

1. **选择合适的数据中心**：cloudflared 会自动选择最近的 Cloudflare 数据中心
2. **启用压缩**：Cloudflare 会自动压缩内容
3. **使用缓存**：配置适当的缓存规则
4. **HTTP/2 支持**：Cloudflare Tunnel 原生支持 HTTP/2

## 总结

Cloudflare Tunnel 是一个强大且免费的工具，特别适合：

- 个人开发者快速部署项目
- 没有公网 IP 的家庭服务器
- 需要临时分享本地服务
- 需要安全访问内网资源

通过本教程，你应该已经掌握了 Cloudflare Tunnel 的基本使用方法。现在就可以开始使用它来部署你的服务了！

## 参考资料

- [Cloudflare Tunnel 官方文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [cloudflared GitHub 仓库](https://github.com/cloudflare/cloudflared)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
