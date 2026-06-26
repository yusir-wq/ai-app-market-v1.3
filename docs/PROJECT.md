# AI 应用广场 — 大模型聚合平台

> V1.3 UI 原型阶段 · 全 Mock 数据驱动 · 不接入真实 API

---

## 技术栈

| 类别     | 技术                            |
| -------- | ------------------------------- |
| 框架     | Next.js 16 (App Router)         |
| UI 库    | React 19                        |
| 组件体系 | shadcn/ui (new-york) + Radix UI |
| 样式     | Tailwind CSS v4 + tw-animate    |
| 语言     | TypeScript 5.7                  |
| 图表     | recharts                        |
| 表单     | react-hook-form + zod           |
| 图标     | lucide-react                    |
| 主题     | next-themes（亮/暗双模式）       |
| 包管理   | pnpm                            |

---

## 目录结构

```
├── app/                    # Next.js App Router 页面
│   ├── agent/[id]/         # 智能体详情（动态路由）
│   ├── design-system/      # 设计系统预览
│   ├── layout.tsx          # 根布局
│   └── globals.css         # 全局样式 & CSS 变量令牌
│
├── components/
│   ├── ui/                 # shadcn/ui 基础组件（50+）
│   ├── workspace/          # 工作台核心组件（导航、侧栏、会话、MCP、计费、邀请）
│   ├── agent/              # 智能体相关组件（场景、表单、结果等）
│   ├── chat/               # 聊天相关（消息、Markdown、代码块、流式、视频卡片）
│   └── auth/               # 登录 & 充值弹窗
│
├── contexts/               # React Context（AuthContext、MCPContext）
├── hooks/                  # 自定义 Hooks
├── lib/                    # 工具函数 & Mock 数据
├── public/                 # 静态资源（图标、占位图、MCP 引导图）
├── styles/                 # 备用样式
├── v2-workbench/           # V2 工作台原型（独立 HTML）
└── docs/archive/           # 历史设计文档归档
```

---

## 路由一览

| 路由              | 说明           |
| ----------------- | -------------- |
| `/`               | 首页 — 工作台  |
| `/agent`          | 智能体广场列表  |
| `/agent/[id]`     | 智能体详情页   |
| `/design-system`  | 设计系统预览页  |

---

## 模块职责

- **Workspace** — 应用主容器，单页内切换视图（Home / Chat / Agent 详情 / MCP 中心 / 计费等）
- **NavPanel / Sidebar** — 左侧可折叠导航，负责对话历史、新建会话、邀请入口、用户中心
- **Agent** — 智能体能力展示与体验：音视频处理、文案生成、图像处理等，含场景选择、参数配置、结果预览
- **Chat** — 多模型并发回复、Markdown 渲染、代码高亮、流式消息、视频预览
- **MCPContext** — MCP 服务管理：平台市场（13 种服务）、用户自定义 MCP、工具调用结果展示、思考过程
- **Billing** — 消费记录与支付记录展示
- **Auth** — 模拟登录 & 充值弹窗（纯 UI Mock）

---

## 开发规范

- **路径别名**: `@/` → 项目根目录
- **设计系统**: 严格遵守 `DESIGN_SYSTEM.md` — 色板、间距、圆角、排版
- **颜色**: 禁止硬编码，统一使用 CSS 变量令牌（`--primary`、`--background` 等）
- **间距**: 8px Grid，数值为 4 的倍数
- **组件**: 优先复用 `components/ui/` 基础组件，新 UI 组件使用 shadcn/ui CLI 生成
- **数据**: 当前阶段全部使用 `lib/` 下的 Mock 数据，不调用外部 API
- **亮/暗主题**: 所有组件需适配双主题

---

## 忽略目录

| 目录/文件           | 说明           |
| ------------------- | -------------- |
| `node_modules/`     | 依赖           |
| `.next/`            | 构建产物       |
| `.vercel/`          | Vercel 部署    |
| `.snowflake/`       | v0 沙箱内部    |
| `.v0-trash/`        | v0 回收站      |
| `.superpowers/`     | 内部工具会话   |
| `.trae/`            | 规划文档       |
| `server-*.log`      | 服务器日志     |
| `pm2-*.log`         | PM2 日志       |
| `*.env*.local`      | 本地环境变量   |
