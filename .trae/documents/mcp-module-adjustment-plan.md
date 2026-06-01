# MCP模块调整详细计划

## 一、需求摘要

对 MCP 模块进行多项调整，包括：启用/禁用提示、按钮样式优化、布局调整等。

## 二、详细变更计划

### 2.1 MCP服务选项区域调整

#### 变更1：MCP启用/关闭增加全局提示
- **文件**: `components/workspace/mcp-service-selector.tsx`
- **变更**: MCP总开关切换时，显示 Toast 提示：
  - 启用：`MCP服务已启用`
  - 停用：`MCP服务已停用`
- **实现**: 使用 `sonner` Toast 组件（项目中已有）

#### 变更2：MCP停用状态下选项禁用
- **文件**: `components/workspace/mcp-service-selector.tsx`
- **变更**: 当 `mcpEnabled = false` 时：
  - 选项不可点击/勾选
  - 增加 `opacity-50 cursor-not-allowed` 禁用样式
  - Checkbox 禁用状态

#### 变更3：MCP服务按钮选中样式
- **文件**: `components/workspace/mcp-service-selector.tsx`
- **变更**:
  - 选中状态（mcpEnabled=true）：按钮有边框高亮或背景色
  - 未选中状态（mcpEnabled=false）：默认样式
  - 停用时隐藏已选数量显示

#### 变更4：按钮名称修改
- **文件**: `components/workspace/mcp-service-selector.tsx`
- **变更**: "MCP管理配置" → "MCP管理"

#### 变更5：MCP总开关状态同步到Context
- **文件**: `contexts/mcp-context.tsx`
- **变更**: 新增 `mcpEnabled` 全局状态

---

### 2.2 历史对话详情区域调整

#### 变更6：工具返回参数名称修改
- **文件**: `components/workspace/mcp-message-view.tsx`
- **变更**: "工具返回参数" → "whois历史信息 : get_whois_history"
- **范围**: MCP消息视图中所有 "工具返回参数" 文本

---

### 2.3 个人中心-MCP服务区域调整

#### 变更7：页面标题和Tabs布局
- **文件**: `components/workspace/mcp-center.tsx`
- **变更**:
  - 移除 "MCP服务" 标题
  - Tabs 居中显示，缩小宽度（使用 `max-w-sm mx-auto`）
  - 移除标题行

#### 变更8：头部按钮布局
- **文件**: `components/workspace/mcp-center.tsx`
- **变更**:
  - 左侧：返回按钮（样式与消费记录页面一致）
  - 右侧：企业级MCP定制按钮（icon 改为 ExternalLink）
  - Tabs 在中间

#### 变更9：Toast提示（添加和启用/关闭）
- **文件**: `components/workspace/mcp-center.tsx`
- **变更**:
  - 添加 MCP 服务成功：`xxx 已添加`
  - 启用服务：`xxx 已启用`
  - 停用服务：`xxx 已停用`

#### 变更10：快速配置窗口按钮顺序
- **文件**: `components/workspace/mcp-config-modal.tsx`
- **变更**:
  - 顺序：企业级MCP定制（主） > 服务商入驻（次）
  - 两者都在 DialogHeader 右侧

#### 变更11：输入框标题修改
- **文件**: `components/workspace/mcp-config-modal.tsx`
- **变更**: "API_KEY" → "APIKey"

#### 变更12：快速配置窗口布局重构
- **文件**: `components/workspace/mcp-config-modal.tsx`
- **变更**:
  - 弹窗宽度增加（`sm:max-w-xl`）
  - 移除图例说明图片区域
  - 新增步骤条组件（Steps）
  - 新增3个1:1图片占位区域（`aspect-square`）
  - Step1 的 "访问chinaz.net官网" 文字作为按钮，可点击跳转

---

## 三、实现细节

### 3.1 Toast 使用（Sonner）

```typescript
import { toast } from 'sonner'

// 在 mcp-service-selector.tsx 中
const handleToggleMCP = (enabled: boolean) => {
  setMcpEnabled(enabled)
  toast.success(enabled ? 'MCP服务已启用' : 'MCP服务已停用')
}
```

### 3.2 Context 新增状态

```typescript
// contexts/mcp-context.tsx
interface MCPContextType {
  // ... 现有状态
  mcpEnabled: boolean
  setMcpEnabled: (enabled: boolean) => void
}
```

### 3.3 步骤条组件

```tsx
<div className="space-y-4">
  {/* 步骤条 */}
  <div className="flex items-center gap-2 text-sm">
    <div className="flex items-center gap-1">
      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
      <Button variant="link" size="sm" className="p-0 h-auto" asChild>
        <a href="https://www.chinaz.net/mall/a_TsMSRI22oR.html" target="_blank">访问chinaz.net官网</a>
      </Button>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
    <span>2. 购买MCP API接口服务</span>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
    <span>3. 进入控制台复制APIKey</span>
  </div>
  
  {/* 3个图片占位 */}
  <div className="grid grid-cols-3 gap-4">
    <div className="aspect-square bg-muted rounded-lg border flex items-center justify-center text-muted-foreground">图片1</div>
    <div className="aspect-square bg-muted rounded-lg border flex items-center justify-center text-muted-foreground">图片2</div>
    <div className="aspect-square bg-muted rounded-lg border flex items-center justify-center text-muted-foreground">图片3</div>
  </div>
</div>
```

### 3.4 头部布局

```tsx
<div className="flex items-center justify-between">
  <Button variant="ghost" size="icon-sm">
    <ArrowLeft className="h-4 w-4" />
  </Button>
  
  <Tabs value={activeTab} className="max-w-sm mx-auto">
    <TabsList>
      <TabsTrigger value="my">我的MCP</TabsTrigger>
      <TabsTrigger value="market">MCP市场</TabsTrigger>
    </TabsList>
  </Tabs>
  
  <Button variant="outline" size="sm" className="gap-1.5">
    <ExternalLink className="h-4 w-4" />
    企业级MCP定制
  </Button>
</div>
```

---

## 四、文件变更清单

| 文件 | 变更类型 | 变更说明 |
|------|----------|----------|
| `contexts/mcp-context.tsx` | 修改 | 新增 `mcpEnabled` 状态 |
| `components/workspace/mcp-service-selector.tsx` | 修改 | Toast提示、禁用样式、按钮名称、状态同步 |
| `components/workspace/mcp-center.tsx` | 修改 | 布局调整、Toast提示、按钮样式 |
| `components/workspace/mcp-config-modal.tsx` | 修改 | 按钮顺序、标题修改、步骤条+图片 |
| `components/workspace/mcp-message-view.tsx` | 修改 | 工具返回参数名称 |

---

## 五、验证步骤

1. **MCP服务选择器**:
   - 启用/关闭显示Toast提示
   - 停用时选项不可点击、样式禁用
   - 按钮有选中/未选中样式区分
   - 停用时隐藏数量显示
   - 按钮名称为"MCP管理"

2. **历史对话**:
   - MiniMax-M2.5消息显示"whois历史信息 : get_whois_history"

3. **个人中心-MCP服务**:
   - 无页面标题
   - Tabs居中、宽度缩小
   - 左侧返回按钮、右侧企业级MCP定制
   - 添加/启用/关闭显示Toast
   - 配置弹窗按钮顺序正确（企业级 > 服务商入驻）
   - APIKey标题正确
   - 步骤条+3个图片占位
   - Step1可点击跳转
