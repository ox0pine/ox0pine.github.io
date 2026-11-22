---
title: 如何使用Cloudflare Tunnel
date: 2026-01-24
categories: tech
tags: [Cloudflare, 网络工具]
timeline: article
toc: true
---

> 不用公网 IP，也能把本地服务通过域名安全地开放到公网。

## Cloudflare Tunnel 解决什么问题

Cloudflare Tunnel（原名 Argo Tunnel）可以把本地或内网服务接入 Cloudflare 网络。运行 `cloudflared` 后，机器会主动向 Cloudflare 建立加密连接；外部请求先到 Cloudflare，再通过这条隧道转发到本地服务。

因此，源站不需要公网 IP，也不用在路由器上开放入站端口。Cloudflare 免费计划即可使用 Tunnel，同时还能获得自动 HTTPS、DDoS 防护和隐藏源站 IP 等能力。个人博客、开发环境预览和家庭服务器都可以使用这套方案。

## 前置准备

1. 一个 Cloudflare 账号（[注册地址](https://dash.cloudflare.com/sign-up)）
2. 一个已添加到 Cloudflare 的域名（仅临时隧道可以不准备域名）
3. 一台运行服务的机器，例如本地电脑或内网服务器，并确保它能访问 Cloudflare

## 安装 cloudflared

### Windows

从 [cloudflared Releases](https://github.com/cloudflare/cloudflared/releases) 下载 `cloudflared-windows-amd64.exe`，重命名为 `cloudflared.exe`，再把所在目录加入系统 `PATH`：

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

Debian/Ubuntu 使用 `.deb` 包，CentOS/RHEL 使用 `.rpm` 包：

```bash
# Debian/Ubuntu
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# CentOS/RHEL
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
sudo rpm -i cloudflared-linux-x86_64.rpm
```

安装后检查版本：

```bash
cloudflared --version
```

## 快速测试：临时隧道

只是想把本地端口临时分享出去时，不必先创建隧道或配置域名。假设服务监听在 `8080` 端口，执行：

```bash
# 将本地 8080 端口暴露到公网
cloudflared tunnel --url http://localhost:8080
```

命令会输出一个临时的 `*.trycloudflare.com` 地址，打开它即可访问本地服务。这个地址适合临时测试；需要固定域名时，使用下面的永久隧道。

## 创建永久隧道

永久隧道可以通过命令行（CLI）或 Cloudflare Dashboard 创建。CLI 的配置保存在本地 YAML 文件中，方便精细调整和自动化；Dashboard 的配置保存在云端，在网页上操作即可。两种方式选一种即可。

### 方式一：使用 CLI

#### 1. 登录 Cloudflare

```bash
cloudflared tunnel login
```

浏览器打开后，选择要使用的域名并完成授权。授权成功后，本地会生成证书文件。

#### 2. 创建隧道

```bash
cloudflared tunnel create my-tunnel
```

这里将隧道命名为 `my-tunnel`。命令会生成隧道 UUID 和凭证文件，记下 UUID，后面的配置需要用到。

#### 3. 编写配置文件

创建 `~/.cloudflared/config.yml`；Windows 下的路径是 `%USERPROFILE%\.cloudflared\config.yml`。填入隧道 UUID、凭证文件路径和流量转发规则：

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

`ingress` 按顺序匹配规则，最后的 `http_status:404` 用来处理没有命中任何主机名的请求，不要省略。

#### 4. 配置 DNS

把两个域名分别指向隧道：

```bash
cloudflared tunnel route dns my-tunnel blog.example.com
cloudflared tunnel route dns my-tunnel api.example.com
```

命令会自动在 Cloudflare DNS 中创建对应的 CNAME 记录。

#### 5. 启动隧道

```bash
cloudflared tunnel run my-tunnel
```

保持命令运行，然后访问 `https://blog.example.com`，请求就会经隧道转发到本地的 `4000` 端口。

### 方式二：使用 Dashboard

#### 1. 创建隧道

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并选择账号
2. 进入 **Zero Trust** → **Networks** → **Tunnels**
3. 点击 **Create a tunnel**
4. 连接器类型选择 **Cloudflared**，点击 **Next**
5. 输入名称，例如 `my-blog-tunnel`，然后点击 **Save tunnel**

#### 2. 安装并连接

在页面中选择操作系统，复制包含 token 的安装命令到服务器执行。例如：

```bash
# Linux/macOS
sudo cloudflared service install <your-token>

# Windows（以管理员身份运行）
cloudflared.exe service install <your-token>
```

安装完成后，连接器应显示为 **Connected**，再点击 **Next**。

#### 3. 配置路由

如果要把服务公开到某个域名，在 **Public Hostname** 标签下填写：

- **Subdomain**：子域名，例如 `blog`
- **Domain**：选择域名，例如 `example.com`
- **Type**：选择 `HTTP`
- **URL**：本地服务地址，例如 `localhost:4000`

填写后点击 **Save tunnel**。

如果要连接整个私有网络，则切换到 **Private Network** 标签，输入私有 IP 或 CIDR 范围，例如 `192.168.1.0/24`，再点击 **Save tunnel**。

#### 4. 检查状态

回到 **Tunnels** 页面，隧道状态应显示为 **Healthy**。之后即可通过配置的域名访问服务。

## 配置为系统服务

手动执行 `cloudflared tunnel run` 适合调试。需要长期运行时，可以把它安装成系统服务，让系统负责启动和管理。

### Linux（systemd）

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

在管理员终端中执行：

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

### 转发多个服务

一份配置可以把不同主机名转发到不同服务，包括 Web、SSH 和 WebSocket 服务：

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

### 配置访问控制

管理后台、NAS 等敏感服务不建议只依赖自身密码。可以在 Cloudflare Dashboard 中配置 Access 策略，限制允许访问的用户：

1. 进入 Cloudflare Dashboard
2. 选择你的域名
3. 进入 **Access** → **Applications**
4. 创建新的应用程序并配置访问规则

### 配置日志级别

在配置文件中添加 `loglevel`，可选值为 `debug`、`info`、`warn` 和 `error`：

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

修改配置后，先用 `ingress validate` 检查，再用 `ingress rule` 确认 URL 命中的规则，可以减少路由配置错误。

## 故障排查

### 1. 隧道无法连接

先检查服务状态和日志：

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

检查域名的 DNS 记录；如果记录不正确，可以重新执行路由命令：

```bash
# 检查 DNS 记录
nslookup blog.example.com

# 重新配置 DNS
cloudflared tunnel route dns my-tunnel blog.example.com
```

### 4. 证书问题

重新登录 Cloudflare，并检查本地证书文件是否存在：

```bash
# 重新登录
cloudflared tunnel login

# 检查证书文件是否存在
ls ~/.cloudflared/
```

## 实际应用场景

### 1. 个人博客部署

将本地运行的 Hexo 博客绑定到固定域名：

```yaml
ingress:
  - hostname: blog.example.com
    service: http://localhost:4000
  - service: http_status:404
```

### 2. 分享开发环境

需要让团队成员临时访问本地开发服务时，直接启动临时隧道：

```bash
cloudflared tunnel --url http://localhost:3000
```

### 3. 家庭服务器

通过不同主机名访问家里的 NAS 和媒体服务器：

```yaml
ingress:
  - hostname: nas.example.com
    service: http://192.168.1.100:5000
  - hostname: media.example.com
    service: http://192.168.1.101:8096
  - service: http_status:404
```

### 4. IoT 设备管理

将内网 IoT 设备的管理界面接入隧道，并配合 Access 策略限制访问，不必直接暴露设备所在网络。

## 安全与性能提示

### 安全建议

1. **启用 Cloudflare Access**：为敏感服务添加身份验证
2. **使用强密码**：为本地服务设置强密码
3. **定期更新**：保持 cloudflared 版本最新
4. **最小权限原则**：只暴露必要的服务
5. **监控日志**：定期检查访问日志

### 性能提示

1. **数据中心选择**：cloudflared 会自动选择最近的 Cloudflare 数据中心，无需手动指定
2. **内容压缩**：Cloudflare 会自动压缩内容
3. **缓存规则**：为适合缓存的内容配置缓存规则
4. **HTTP/2**：Cloudflare Tunnel 原生支持 HTTP/2

## 参考资料

- [Cloudflare Tunnel 官方文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [cloudflared GitHub 仓库](https://github.com/cloudflare/cloudflared)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
