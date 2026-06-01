# MCP服务功能迭代实施计划

## 一、需求概述

为 AI应用市场 V1.1 项目增加 MCP服务功能，包括：
- 工作台左侧增加服务Tabs和MCP服务列表
- 工作台右侧增加MCP服务选择功能
- 导航栏增加MCP服务入口
- 个人中心增加MCP服务管理页面

---

## 二、当前状态分析

### 现有设计规范

| 规范项 | 具体值 |
|-------|-------|
| UI框架 | shadcn/ui + Tailwind CSS |
| 圆角 | rounded-md/lg/xl (基础0.625rem) |
| 间距 | p-3/p-4, gap-2/gap-3 |
| 颜色系统 | OKLCH，选中bg-accent，hover:bg-accent |
| 输入框样式 | bg-muted/50 rounded-xl border border-border p-3 |
| 卡片样式 | bg-card rounded-xl border py-6 |
| Badge样式 | inline-flex rounded-md border px-2 py-0.5 text-xs |
| 字体 | Geist (sans) + Geist Mono (mono) |

### 现有相关文件

| 文件 | 功能 |
|-----|-----|
| `components/workspace/sidebar.tsx` | 左侧边栏（模型列表） |
| `components/workspace/model-card.tsx` | 模型卡片组件 |
| `components/workspace/input-area.tsx` | 输入区域 |
| `components/workspace/header.tsx` | 导航栏 |
| `components/workspace/workspace.tsx` | 工作台主组件 |
| `lib/mock-data.ts` | Mock数据 |
| `contexts/auth-context.tsx` | 认证上下文 |

---

## 三、实施步骤

### 阶段一：基础架构搭建

#### 步骤1：创建数据类型和Mock数据

**新建文件**: `lib/mcp-data.ts`

**数据结构定义**:

```typescript
// MCP服务类型
export type MCPServiceType = 'HTTP' | 'stdio' | 'SSE'

// MCP服务状态
export type MCPServiceStatus = 'enabled' | 'disabled' | 'configuring'

// MCP服务配置
export interface MCPServiceConfig {
  url?: string           // HTTP/SSE
  headers?: Record<string, string>  // HTTP/SSE
  command?: 'npx' | 'uvx'  // stdio
  args?: string[]        // stdio
  env?: Record<string, string>  // stdio
  longRunning?: boolean
  timeout?: number       // 默认60
}

// MCP服务高级设置
export interface MCPServiceAdvancedSettings {
  iconUrl?: string
  providerName?: string
  providerUrl?: string
  tags?: string[]
}

// MCP服务完整定义
export interface MCPService {
  id: string
  name: string
  description: string
  icon: string
  type: MCPServiceType
  provider: string
  status: MCPServiceStatus
  apiKey?: string
  config: MCPServiceConfig
  advancedSettings?: MCPServiceAdvancedSettings
  createdAt: Date
  updatedAt: Date
}

// 平台MCP服务（示例服务）
export interface PlatformMCPService {
  id: string
  name: string
  description: string
  icon: string
  provider: string
  providerUrl: string  // 服务商入驻链接
  tags: string[]
}

// MCP工具调用结果
export interface MCPToolResult {
  id: string
  toolCallId: string
  status: 'success' | 'error'
  data: any
  timestamp: Date
}

// MCP思考过程
export interface MCPThinkingProcess {
  id: string
  content: string
  timestamp: Date
}

// MCP对话消息扩展
export interface MCPMessageContent {
  thinkingProcess?: MCPThinkingProcess[]
  toolResults?: MCPToolResult[]
  finalResponse: string
}
```

**Mock数据**: 7个示例平台MCP服务
- IP查询、IP反查域名、Whois查询、ICP备案查询、Whois反查、Whois历史信息、企业工商信息模糊查询

---

#### 步骤2：创建MCP上下文

**新建文件**: `contexts/mcp-context.tsx`

**状态管理**:
- `userMCPServices`: 用户已配置的MCP服务列表
- `mcpMode`: 'disabled' | 'auto' | 'manual'（默认disabled）
- `selectedMCPServices`: 手动模式下选中的服务
- `showConfigModal`: 配置弹窗状态
- `configModalService`: 当前配置的服务

**操作方法**:
- `addService(service)`: 添加服务
- `updateService(id, service)`: 更新服务
- `deleteService(id)`: 删除服务
- `toggleServiceStatus(id)`: 启用/关闭服务
- `importFromJSON(json)`: JSON导入解析

---

#### 步骤3：修改Workspace集成MCP上下文

**修改文件**: `components/workspace/workspace.tsx`

- 引入 `MCPProvider` 包裹
- 添加 `mcp-center` 页面路由处理

---

### 阶段二：工作台左侧模型列表区

#### 步骤4：修改Sidebar组件

**修改文件**: `components/workspace/sidebar.tsx`

**修改内容**:
1. 新增状态: `serviceTab` ('model' | 'mcp')
2. 在模型类型Tabs上方增加服务Tabs
3. 根据serviceTab显示模型列表或MCP服务列表

**布局结构**:
```
折叠按钮
├── 服务Tabs（大模型 | MCP服务）
├── [model] 模型类型Tabs + 搜索框 + 模型列表
├── [mcp] MCP搜索框 + MCP服务列表
```

---

#### 步骤5：创建MCP服务列表组件

**新建文件**: `components/workspace/mcp-service-list.tsx`

**功能**:
- 搜索框（模糊搜索，样式与模型搜索框一致）
- 服务卡片列表（ScrollArea包裹）
- 点击卡片弹出配置弹窗

---

#### 步骤6：创建MCP服务卡片组件

**新建文件**: `components/workspace/mcp-service-card.tsx`

**样式规范**:
- 容器: `p-3 rounded-xl cursor-pointer hover:bg-accent`
- Icon区域: `w-10 h-10 rounded-lg bg-muted`
- 名称: `font-medium text-sm text-foreground truncate`
- 描述: `text-xs text-muted-foreground line-clamp-1`

---

#### 步骤7：创建MCP配置弹窗

**新建文件**: `components/workspace/mcp-config-modal.tsx`

**组件结构**:
```
Dialog
├── DialogHeader: 窗口标题（配置MCP服务）
├── 服务商入驻按钮（右侧，跳转外部链接）
├── API_KEY输入框（bg-muted/50 rounded-xl border border-border p-3）
├── 图例说明区域（aspect-square自适应宽度1:1）
├── DialogFooter: 取消 | 确认按钮
```

---

### 阶段三：工作台右侧对话区

#### 步骤8：修改InputArea组件

**修改文件**: `components/workspace/input-area.tsx`

**修改内容**:
- 在聊天模型参数栏上方增加MCP服务按钮
- 集成 `MCPServiceSelector` 组件

---

#### 步骤9：创建MCP服务选择器组件

**新建文件**: `components/workspace/mcp-service-selector.tsx`

**功能**:
1. MCP服务按钮（显示当前模式状态）
2. 下拉菜单：
   - 禁用/自动/手动选项（默认禁用）
   - 选项右侧显示提示文本
3. 手动模式：
   - 已配置MCP服务列表（可多选）
   - Tab切换显示平台MCP服务
   - 最多显示10个，超出滚动
   - "返回上级"按钮

---

#### 步骤10：创建MCP消息展示组件

**新建文件**: `components/workspace/mcp-message-view.tsx`

**展示内容**（仅MCP对话显示）:
1. 调用前思考过程（bg-muted/50 rounded-xl border border-border p-4）
2. MCP工具返回参数（折叠面板，默认折叠）
3. 整理参数信息
4. 模型生成最终回复

---

#### 步骤11：创建工具返回折叠面板组件

**新建文件**: `components/workspace/mcp-tool-result.tsx`

**样式**:
- 使用 `Collapsible` 组件
- 默认折叠状态
- 展开后显示JSON格式数据

---

### 阶段四：导航栏区域

#### 步骤12：修改Header组件

**修改文件**: `components/workspace/header.tsx`

**修改内容**:
1. 增加"已配置MCP服务：x个"显示（点击跳转个人中心）
2. 用户ID下拉菜单增加"MCP服务"选项

---

### 阶段五：个人中心-MCP服务内页

#### 步骤13：创建MCP中心页面组件

**新建文件**: `components/workspace/mcp-center.tsx`

**页面结构**:
```
顶部标题栏
├── 返回按钮 + 标题
├── 添加MCP按钮 | JSON导入按钮 | 返回工作台按钮

服务列表（ScrollArea）
├── 卡片网格（grid-cols-1 md:grid-cols-2 lg:grid-cols-3）
├── 每个卡片：icon + 名称 + 介绍 + 类型 + 提供商 + 标签
├── 操作按钮：编辑 | 删除 | 启用/关闭

弹窗
├── 快速创建弹窗
├── JSON导入弹窗
```

---

#### 步骤14：创建快速创建弹窗

**新建文件**: `components/workspace/mcp-quick-create-modal.tsx`

**表单字段**:
| 字段 | 类型 | 必填 | 显示条件 |
|-----|-----|-----|---------|
| 服务名称 | 文本框 | ✓ | 始终显示 |
| 服务介绍 | 多行文本框 | | 始终显示 |
| 服务类型 | 下拉框 | ✓ | 始终显示（HTTP/stdio/SSE） |
| URL | 文本框 | ✓ | HTTP或SSE |
| 请求头 | 多行文本框 | | HTTP或SSE |
| 命令 | 下拉框 | ✓ | stdio（npx/uvx） |
| 参数 | 多行文本框 | | stdio |
| 环境变量 | 多行文本框 | | stdio |
| 长时间运行 | 开关 | | 始终显示（默认关闭） |
| 超时 | 文本框 | | 始终显示（默认60） |
| 高级设置 | 折叠面板 | | 默认折叠 |

**高级设置内容**:
- 提供商icon地址
- 提供商名称
- 提供商网址
- 标签

---

#### 步骤15：创建JSON导入弹窗

**新建文件**: `components/workspace/mcp-json-import-modal.tsx`

**组件结构**:
```
Dialog
├── DialogHeader: 从JSON导入
├── 提示文本：请从 MCP Servers 的介绍页面复制配置JSON...
├── JSON多行文本框（font-mono）
├── DialogFooter: 取消 | 确定
```

---

## 四、文件变更汇总

### 新增文件（11个）

| 文件路径 | 说明 |
|---------|-----|
| `lib/mcp-data.ts` | MCP数据类型和Mock数据 |
| `contexts/mcp-context.tsx` | MCP状态管理上下文 |
| `components/workspace/mcp-service-card.tsx` | MCP服务卡片组件 |
| `components/workspace/mcp-service-list.tsx` | MCP服务列表组件 |
| `components/workspace/mcp-config-modal.tsx` | MCP配置弹窗 |
| `components/workspace/mcp-service-selector.tsx` | MCP服务选择器 |
| `components/workspace/mcp-message-view.tsx` | MCP消息展示组件 |
| `components/workspace/mcp-tool-result.tsx` | 工具返回折叠面板 |
| `components/workspace/mcp-center.tsx` | 个人中心MCP页面 |
| `components/workspace/mcp-quick-create-modal.tsx` | 快速创建弹窗 |
| `components/workspace/mcp-json-import-modal.tsx` | JSON导入弹窗 |

### 修改文件（5个）

| 文件路径 | 修改内容 |
|---------|---------|
| `components/workspace/sidebar.tsx` | 增加服务Tabs、MCP服务列表 |
| `components/workspace/input-area.tsx` | 增加MCP服务按钮 |
| `components/workspace/header.tsx` | 增加MCP服务入口 |
| `components/workspace/workspace.tsx` | 集成MCP上下文和路由 |
| `lib/mock-data.ts` | 扩展Message类型支持MCP对话 |

---

## 五、验证方案

### 功能验证清单

| 模块 | 验证项 |
|-----|-------|
| 左侧面板 | 服务Tabs切换、MCP搜索、服务卡片点击、配置弹窗完整性 |
| 右侧对话 | MCP按钮显示、模式切换、手动服务选择、多选限制、MCP对话展示 |
| 导航栏 | MCP数量显示、点击跳转、下拉菜单选项 |
| 个人中心 | 服务列表展示、添加/编辑/删除/启用功能、JSON导入 |

### UI规范验证

- 圆角：rounded-md/lg/xl
- 间距：p-3/p-4, gap-2/gap-3
- 选中状态：bg-accent
- 输入框：bg-muted/50 rounded-xl border border-border p-3
- Badge：inline-flex rounded-md border px-2 py-0.5 text-xs

### 代码质量验证

- TypeScript类型完整定义
- 复用shadcn/ui组件
- ESLint检查无错误

---

## 六、假设与决策

| 决策项 | 决策内容 |
|-----|---------|
| 服务类型命名 | 流式=HTTP, STDIO=stdio, SSE=SSE |
| 服务商入驻按钮 | 跳转外部链接（providerUrl） |
| 图例区域尺寸 | 自适应宽度，1:1比例 |
| MCP对话展示 | 仅MCP对话显示思考过程和工具返回 |
| 平台服务数量 | 7个示例服务 |
| 手动选择上限 | 最多10个服务 |