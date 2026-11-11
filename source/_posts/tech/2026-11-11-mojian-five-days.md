---
title: 感谢 mygo，也感谢 mygo！！！
date: 2026-11-11
categories: tech
tags: [Mojian, Go, MyGo, 桌面应用]
timeline: article
toc: true
---

> mygo 是日本动漫《BanG Dream! It's MyGO!!!!!》中的一支乐队，也是最近 X 上很火的一个 native UI 框架。

最近刷推特，刷到很多终端复用器的帖子，比如 herdr，还有内测中的 rex、tent，都试了一遍，发现它们无一例外把终端当主要功能，文件树、git diff 这种需要人工查看审核的地方反而被忽略了。借着 mygo 的热度，vibe 出了 Mojian 这个应用。

一开始只想做成 Markdown 预览和编辑器，后来想，都这样了，不如做成代码编辑器，文件和终端都收进 pane 里。

一开始想做三端通用，后来实现 SSH 时发现 Windows 上没法沿用 Unix socket 那套，所以 0.3 的 Windows 版只做本地，不接 SSH 和远程项目。

中间还试过 niri 那种无限拓展的桌面，想把 Mojian 也做成这样。结果缩放的时候很卡：缩放的是一整块实时内容，终端输出、光标一直在动，缓存每帧都失效，只能把每个窗格重画一遍。换成不再变的文字预览还是卡，最后连画布一起删了。
