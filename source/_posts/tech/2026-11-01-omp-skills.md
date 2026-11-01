---
title: 我把 15 个 skill 装进了 OMP
date: 2026-11-01
categories: tech
tags: [OMP, Skill, AI Agent, 效率工具]
timeline: article
toc: true
---

> 这 15 个 skill 都不是我写的，是我一个个挑出来装进 omp 的。它们平时躺在 `~/.omp/agent/skills/` 里，什么时候被叫起来，看我那天在干什么。

## skill 是怎么起作用的

一个 skill 就是一个文件夹，入口是一份 `SKILL.md`。开头写着名字和一段 description，正文是给模型看的规则，复杂的再挂一层 `references/`，用到才读。

模型每次只看到名字和那一行 description，判断这活儿归谁管，再整篇读进来干活。所以装 skill 的思路不是给它加功能，是把“遇到这类事情该怎么办”写成文件放在手边，省掉每次重新交代。

## 开工之前：先把方案问清楚

想法还很粗的时候，我一般先叫 [think](https://github.com/tw93/Waza/tree/main/skills/think)。它会把问题往回问：这事值不值得做，先后顺序怎么排，做到什么程度算完。方案没定下来之前它不写代码，也不搭脚手架。

碰到完全不熟的领域，用 [learn](https://github.com/tw93/Waza/tree/main/skills/learn)，从找材料、读懂、列提纲、填内容一路走到成稿，六个阶段走一遍，最后自己再复核。两个 skill 都适合“我心里只有一个大概”的时候。

## 做界面：从方向到选型

真要动手做页面，先叫 [ui](https://github.com/tw93/Waza/tree/main/skills/ui)，它出组件和排版，要求是得有明确方向，默认提示词能生成的那种长相它自己就不认。判断标准来自 [emil-design-eng](https://github.com/emilkowalski/skills/tree/main/skills/emil-design-eng)，这组的总纲，讲那些说不清但一眼能看出差别的细节，也是我装的里面最长的一份。

界面做出来像 AI 拉的，用 [unslop](https://github.com/heydamir/unslop/tree/main/skills/unslop) 收拾，紫色渐变、光晕、emoji 标签、`New ✨` 徽章、间距不匀，它按顺序一项项过。方向拿不准的时候用 [prototype](https://github.com/emilkowalski/skills/tree/main/skills/prototype)，同一块界面出几版，摆在选择器里翻着看，挑中哪个留哪个。需要选库就交给 [pick-ui-library](https://github.com/emilkowalski/skills/tree/main/skills/pick-ui-library)，数字输入、OTP、图表、命令菜单、虚拟化、拖拽、toast 都有指定答案，省得让模型自己手搓一个再装个没人维护的包。

## 界面做完，专门找它坏在哪

[break-ui](https://github.com/emilkowalski/skills/tree/main/skills/break-ui) 是拿来撞的：超长名字、不能断行的邮箱、零条数据、超大计数、非拉丁文字全塞进去，撞坏的地方连同修法一起列出来。

[mobile-native](https://github.com/emilkowalski/skills/tree/main/skills/mobile-native) 只修“电脑上能用、手机上不对劲”那类毛病，点击高亮闪一下、100vh 在地址栏收起后错位、输入框获得焦点把页面放大、内容钻到刘海底下。还有一个只盯 toast 的 [ask-sonner](https://github.com/emilkowalski/skills/tree/main/skills/ask-sonner)，弹不出来、弹两遍、样式丢了、被弹窗盖住、不跟随深色模式，它都能查。

桌面 App 就是另一件事了，[native-feel-cross-platform-desktop](https://github.com/yetone/native-feel-skill) 管 macOS 和 Windows 同时保持原生手感这类架构选择，内容来自 Raycast 2.0 的技术复盘，八条原则、四层架构、75 项上线检查。

## 写东西的时候

中文英文的稿子都归 [write](https://github.com/tw93/Waza/tree/main/skills/write)，改稿、去 AI 味、发布说明、公开回复、多语言文案，标点也管，交稿前会跑一遍检查脚本。这篇也是按它的规则写的。

## Swift 和文档

写 SwiftUI 的时候有 [swiftui-pro](https://github.com/twostraws/SwiftUI-Agent-Skill/tree/main/swiftui-pro) 做代码审查，看 API 用法、性能、无障碍、废弃接口。[write-swift](https://github.com/emilkowalski/skills/tree/main/skills/write-swift) 讲现代 Swift 怎么写，值类型、Swift 6 并发、泛型、Swift Testing。要出 PDF 就换 [kami](https://github.com/tw93/Kami/tree/main/skills/kami)，简历、一页纸、白皮书、PPT 都是它排的。

## 怎么装

六个仓库，命令都能直接抄：

```bash
npx skills@latest add emilkowalski/skills                     # 我用的 7 个在这
npx skills add tw93/Waza -a claude-code codex cursor -g -y     # 4 个
npx skills add tw93/kami -a claude-code codex cursor -g -y     # kami
npx skills add twostraws/swiftui-agent-skill --skill swiftui-pro
npx skills add yetone/native-feel-skill -g
```

`unslop` 的 README 给的是 Codex 的装法，`$skill-installer install` 后面跟 [skills/unslop](https://github.com/heydamir/unslop/tree/main/skills/unslop) 这个目录，手动装就是把它拷进 skills 目录。它做 story video 时还要 Playwright 和 ffmpeg，不做就不用管。

15 个分别来自上面这六个仓库，想抄哪个直接点名字。装完在目录里就是一堆 Markdown，个别自带脚本，比如 `kami` 靠 Python 生成文档。
