# MCP模块重构实施计划

## 一、需求摘要

对 AI应用市场 V1.1 项目的 MCP 模块进行全面重构，主要涉及：
1. 导航栏移除 MCP 服务计数组件
2. 工作台左侧列表区域调整（MCP服务移至个人中心）
3. 工作台右侧对话区 MCP 按钮交互重构（hover下拉选择）
4. 个人中心-MCP服务内页重构（Tabs切换、卡片调整、MCP市场）

## 二、当前状态分析

### 2.1 现有组件结构
- `mcp-center.tsx`: MCP服务管理页面，包含服务卡片网格、添加/导入按钮
- `mcp-service-selector.tsx`: MCP服务选择器下拉菜单，支持禁用/自动/手动模式
- `mcp-quick-create-modal.tsx`: 新增/编辑MCP服务弹窗
- `mcp-service-card.tsx`: MCP服务卡片组件
- `mcp-service-list.tsx`: MCP服务列表组件
- `sidebar.tsx`: 侧边栏，包含大模型和MCP服务Tabs
- `input-area.tsx`: 输入区域，包含MCP服务选择器按钮
- `mcp-context.tsx`: MCP状态管理Context
- `mcp-data.ts`: MCP类型定义和Mock数据

### 2.2 当前数据模型
```typescript
// MCP服务
interface MCPService {
  id: string
  name: string
  description: string
  icon: string
  type: 'HTTP' | 'stdio' | 'SSE'
  provider: string
  status: 'enabled' | 'disabled' | 'configuring'
  config: MCPServiceConfig
  advancedSettings?: MCPServiceAdvancedSettings
  createdAt: Date
  updatedAt: Date
}

// 平台MCP服务
interface PlatformMCPService {
  id: string
  name: string
  description: string
  icon: string
  provider: string
  providerUrl: string
  tags: string[]
}
```

## 三、详细变更计划

### 3.1 导航栏调整

**文件**: `components/workspace/header.tsx`

**变更内容**:
- 移除"已配置MCP服务：x个"组件（如果存在）

**实现方式**:
- 检查 header.tsx 中是否有 MCP 服务计数显示，如有则删除

---

### 3.2 工作台左侧列表区域

**文件**: `components/workspace/sidebar.tsx`

**变更内容**:
1. 移除"服务"Tabs（大模型/MCP服务切换）
2. 左侧只保留大模型Tabs（全部/聊天/图片/视频）
3. 保留大模型搜索框和大模型列表
4. 删除MCP服务列表及相关逻辑

**实现方式**:
- 删除 `serviceType` state 和相关切换逻辑
- 删除 `MCPServiceList` 组件引用
- 简化侧边栏为仅展示大模型列表

---

### 3.3 工作台右侧对话区 - MCP服务按钮重构

**文件**: `components/workspace/mcp-service-selector.tsx`（完全重写）

**变更内容**:
1. 去掉禁用/自动/手动模式选项
2. 改为鼠标移入(hover)触发下拉显示
3. 下拉内容显示已配置MCP服务列表（多选）
4. 按钮显示已选择的MCP服务数量
5. 弹窗样式参考附件图片

**实现方式**:
```typescript
// 新组件结构
- Hover触发下拉（使用 Popover 或自定义实现）
- 下拉内容：已配置MCP服务列表（Checkbox多选）
- 按钮显示：MCP服务(x) 表示已选择x个
- 不限制可选数量，超出部分使用 ScrollArea 滚动查看
```

**交互逻辑**:
- 鼠标移入按钮 → 显示下拉弹窗
- 点击服务项 → 切换选中状态（不关闭弹窗）
- 鼠标移出按钮或弹窗区域 → 延迟关闭弹窗
- 按钮显示已选择数量徽章
- 服务列表超出窗口高度时可滚动查看

---

### 3.4 个人中心-MCP服务内页重构

**文件**: `components/workspace/mcp-center.tsx`（大幅修改）

**变更内容**:

#### 3.4.1 删除按钮
- 删除"从JSON导入"按钮
- 删除"新增MCP"按钮
- 只允许从MCP市场添加服务

#### 3.4.2 服务卡片调整
- 增加MCP服务英文名称字段（如：get_ip_location）
- 移除：MCP服务类型、提供商名称、标签字段
- 启用/关闭状态和开关按钮合并为1个开关

**新卡片字段**:
- 图标
- 服务名称（中文）
- 英文名称
- 描述
- 开关（启用/关闭）
- 操作按钮（编辑、删除）

#### 3.4.3 增加Tabs
- "我的MCP": 显示当前用户已配置的MCP服务
- "MCP市场": 显示平台提供的MCP服务

#### 3.4.4 MCP市场
- 添加MCP服务搜索框
- 卡片样式与"我的MCP"一致
- 操作按钮只有"+"添加按钮
- 已添加的MCP服务显示"已添加"标签
- 分页组件（仅展示1页mock数据）

---

### 3.5 新增/编辑MCP服务窗口调整

**文件**: `components/workspace/mcp-quick-create-modal.tsx`

**变更内容**:

#### 3.5.1 删除高级设置
- 删除高级设置折叠面板
- 删除：图标URL、提供商名称、提供商网址、标签字段

#### 3.5.2 增加字段
- 增加MCP服务英文名称字段（只读，从市场数据带入）

#### 3.5.3 字段只读/可编辑状态
| 字段 | 状态 | 说明 |
|------|------|------|
| 服务类型 | 只读 | 固定显示"可流式传输的HTTP（Streamable HTTP）" |
| MCP英文名称 | 只读 | 从市场数据带入 |
| 服务介绍 | 只读 | 从市场数据带入 |
| URL | 只读 | 从市场数据带入 |
| 服务名称 | 可编辑 | 用户可自定义名称 |
| 请求头 | 可编辑 | 用户可配置 |
| 长时间运行模式 | 可编辑 | 开关 |
| 超时时间 | 可编辑 | 数字输入 |

**实现方式**:
- 通过 `editingService` 或 `configModalService` 判断数据来源
- 市场添加时，部分字段预填充且只读
- 编辑时，可编辑字段保持可编辑状态

---

### 3.6 数据模型调整

**文件**: `lib/mcp-data.ts`

**变更内容**:

#### 3.6.1 MCPService接口调整
```typescript
interface MCPService {
  id: string
  name: string              // 中文名称（可编辑）
  englishName: string       // 英文名称（新增，只读）
  description: string       // 介绍（从市场带入，只读）
  icon: string
  type: 'HTTP' | 'stdio' | 'SSE'  // 固定为'HTTP'，只读
  provider: string          // 移除展示，但保留数据
  status: 'enabled' | 'disabled'  // 简化为只有两种状态
  config: MCPServiceConfig
  // 删除 advancedSettings
  createdAt: Date
  updatedAt: Date
}
```

#### 3.6.2 PlatformMCPService接口调整
```typescript
interface PlatformMCPService {
  id: string
  name: string              // 中文名称
  englishName: string       // 英文名称（新增）
  description: string
  icon: string
  provider: string          // 后台使用，不展示
  defaultUrl: string        // 默认URL（新增）
  // 删除 providerUrl, tags
}
```

#### 3.6.3 Mock数据调整
- 更新 `platformMCPServices` 数据，增加 `englishName` 和 `defaultUrl`
- 更新 `mockUserMCPServices` 数据，增加 `englishName` 字段

---

### 3.7 MCP Context调整

**文件**: `contexts/mcp-context.tsx`

**变更内容**:
1. 删除 `mcpMode` state（不再需要模式选择）
2. 保留 `selectedMCPServices` 用于存储手动选择的服务
3. 删除 `setMcpMode` 方法
4. 调整服务状态：只有 'enabled' | 'disabled' 两种

---

## 四、文件变更清单

| 文件路径 | 变更类型 | 变更说明 |
|----------|----------|----------|
| `components/workspace/header.tsx` | 修改 | 移除MCP服务计数组件 |
| `components/workspace/sidebar.tsx` | 修改 | 删除MCP服务列表，只保留大模型 |
| `components/workspace/mcp-service-selector.tsx` | 重写 | Hover下拉，显示已配置服务列表 |
| `components/workspace/mcp-center.tsx` | 大幅修改 | Tabs切换、卡片调整、MCP市场 |
| `components/workspace/mcp-quick-create-modal.tsx` | 大幅修改 | 字段调整、只读状态 |
| `components/workspace/mcp-service-card.tsx` | 修改 | 卡片字段调整 |
| `lib/mcp-data.ts` | 修改 | 数据模型调整、Mock数据更新 |
| `contexts/mcp-context.tsx` | 修改 | 删除mcpMode相关逻辑 |
| `components/workspace/mcp-json-import-modal.tsx` | 删除 | 不再使用JSON导入 |

## 五、实现细节

### 5.1 MCP服务按钮Hover下拉实现

使用 Popover 组件实现Hover触发：
```tsx
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button 
      variant="outline" 
      size="sm"
      onMouseEnter={() => setOpen(true)}
    >
      MCP服务({selectedCount})
    </Button>
  </PopoverTrigger>
  <PopoverContent 
    onMouseLeave={() => setOpen(false)}
    className="w-80"
  >
    {/* 已配置服务列表 */}
  </PopoverContent>
</Popover>
```

### 5.2 MCP市场分页

使用 shadcn/ui Pagination 组件：
```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### 5.3 服务卡片开关合并

将状态标签和开关按钮合并：
```tsx
<div className="flex items-center gap-2">
  <Switch 
    checked={service.status === 'enabled'}
    onCheckedChange={onToggle}
  />
  <span>{service.status === 'enabled' ? '已启用' : '已关闭'}</span>
</div>
```

## 六、验证步骤

1. **导航栏**: 确认没有MCP服务计数显示
2. **侧边栏**: 确认只显示大模型列表，没有MCP服务Tab
3. **MCP按钮**: 
   - Hover显示下拉
   - 显示已配置服务列表
   - 可多选
   - 按钮显示已选择数量
4. **个人中心-MCP服务**:
   - 显示"我的MCP"和"MCP市场"Tabs
   - 卡片显示英文名称
   - 开关合并
   - 没有JSON导入和新增按钮
5. **MCP市场**:
   - 卡片样式一致
   - 显示"+"添加按钮
   - 已添加显示"已添加"标签
   - 分页组件正常
6. **新增/编辑弹窗**:
   - 字段只读/可编辑状态正确
   - 服务类型固定显示
   - 高级设置已删除

## 七、注意事项

1. 保持现有路由和导航逻辑不变
2. 确保与现有对话功能兼容
3. 保持TypeScript类型安全
4. 保持UI风格与现有设计一致
