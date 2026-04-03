# ARCHITECTURE.md

CodePilot 是 Claude Code 的桌面 GUI 客户端。Electron 40 做外壳，Next.js 16 (App Router) 做前端和 API 层，better-sqlite3 做本地持久化，通过 Claude Agent SDK 与 Claude 交互。

## 目录结构

```
src/
├── app/            # Next.js App Router — 页面 + API 路由
│   ├── api/        #   52 个 REST 端点（chat, media, files, plugins, settings …）
│   ├── chat/       #   聊天页（主界面）
│   ├── plugins/    #   插件 / MCP 管理
│   ├── settings/   #   应用设置
│   ├── gallery/    #   图片画廊
│   └── …
├── components/     # React 组件（按功能分目录）
│   ├── ui/         #   Radix 基础组件 (Button, Dialog, Tabs …)
│   ├── chat/       #   聊天界面 (MessageList, CodeBlock, ImageThumbnail …)
│   ├── ai-elements/#   AI 响应渲染 (artifact, reasoning, tool, task …)
│   ├── layout/     #   布局 (AppShell, Header, NavRail, ChatListPanel …)
│   ├── plugins/    #   插件管理 UI
│   ├── settings/   #   设置面板
│   ├── skills/     #   技能市场
│   ├── project/    #   项目文件树
│   └── gallery/    #   画廊视图
├── lib/            # 核心业务逻辑
│   ├── db.ts               # SQLite 数据库（schema 定义 + CRUD）
│   ├── claude-client.ts    # Claude Agent SDK 封装、消息流
│   ├── stream-session-manager.ts  # SSE 流生命周期管理
│   ├── conversation-registry.ts   # 活跃 SDK 会话全局注册
│   ├── image-generator.ts  # Gemini/Anthropic 图片生成
│   ├── job-executor.ts     # 批量图片生成任务执行器
│   ├── files.ts            # 文件系统浏览和预览
│   ├── claude-session-parser.ts   # 解析 Claude CLI .jsonl 会话
│   ├── platform.ts         # 平台检测 (macOS/Windows/Linux)
│   ├── error-classifier.ts # 错误分类（16 类结构化错误）
│   ├── provider-doctor.ts  # Provider 诊断引擎（5 探针 + 修复动作）
│   ├── runtime-log.ts      # console 环形缓冲（200 条，自动脱敏）
├── hooks/          # React Hooks (useSSEStream, useImageGen, useTranslation …)
├── types/          # TypeScript 类型
│   ├── index.ts            # 所有业务类型 (ChatSession, Message, MCPServerConfig …)
│   └── electron.d.ts       # Electron contextBridge API 类型
└── i18n/           # 国际化
    ├── en.ts               # 英文
    └── zh.ts               # 中文

electron/
├── main.ts         # Electron 主进程（窗口、IPC、Utility Process）
└── preload.ts      # contextBridge 暴露（install API, updater API）
```

## 数据流

```
用户输入 → MessageInput 组件
         → POST /api/chat/messages
         → claude-client.ts（创建 SDK conversation）
         → Claude Agent SDK SSE 流
         → stream-session-manager.ts 管理流
         → useSSEStream hook 订阅
         → MessageList 渲染
         → db.ts 持久化到 SQLite
```

## 数据库（SQLite）

Schema 定义在 `src/lib/db.ts`：

| 表 | 用途 |
|----|------|
| `chat_sessions` | 聊天会话元数据 |
| `messages` | 消息（content 为 JSON 数组） |
| `settings` | 键值设置 |
| `tasks` | SDK TodoWrite 任务项 |
| `api_providers` | API 提供商配置（Anthropic, OpenAI …） |
| `media_generations` | 生成的图片/媒体 |
| `media_tags` | 媒体标签 |
| `media_jobs` | 批量图片生成任务 |
| `media_job_items` | 批量任务中的单个项 |
| `media_context_events` | 批量任务上下文同步 |

启用 WAL 模式 + 外键约束。数据目录：`~/.codepilot/`。

## 新增功能标准触及点

添加新功能时通常需要修改以下位置：

| 触及点 | 路径 | 说明 |
|--------|------|------|
| 类型定义 | `src/types/index.ts` | 新增接口/类型 |
| 数据库 | `src/lib/db.ts` | 新增表或字段（含迁移逻辑） |
| API 路由 | `src/app/api/{功能名}/route.ts` | 新增 REST 端点 |
| 页面 | `src/app/{功能名}/page.tsx` | 新增路由页面 |
| 组件 | `src/components/{功能名}/` | UI 组件 |
| Hook | `src/hooks/use{功能名}.ts` | 状态管理 Hook |
| 国际化 | `src/i18n/en.ts` + `zh.ts` | 双语翻译键 |

## 关键文档索引

| 文档 | 路径 | 内容 |
|------|------|------|
| Agent 工具集成 | `docs/handover/agent-tooling-todo-bridge.md` | SDK 工具调用、任务桥接 |
| SDK 集成调研 | `docs/research/chat-sdk-integration-feasibility.md` | Chat SDK 可行性分析 |
| 上下文存储迁移（调研） | `docs/research/context-storage-migration-plan.md` | 数据库迁移详细方案 |
| 上下文存储迁移（执行） | `docs/exec-plans/active/context-storage-migration.md` | 分阶段进度 + 决策日志 |
| 技术债务 | `docs/exec-plans/tech-debt-tracker.md` | 已知技术债务清单 |
| Provider/Error/Doctor | `docs/handover/provider-error-doctor.md` | 错误分类、Provider 生效、Auth 自动、诊断中心 |

## 技术栈

| 层 | 技术 |
|----|------|
| 桌面外壳 | Electron 40 |
| 前端框架 | Next.js 16 (App Router) + React 19 |
| 样式 | Tailwind CSS 4 + Radix UI |
| 数据库 | better-sqlite3 (WAL) |
| AI 集成 | Claude Agent SDK, @ai-sdk/anthropic, @ai-sdk/google, @ai-sdk/openai |
| 代码高亮 | Shiki |
| Markdown | react-markdown, streamdown, markdown-it |
| 打包 | electron-builder (DMG + NSIS) |
| 测试 | Playwright (E2E), tsx + node:test (单元) |
