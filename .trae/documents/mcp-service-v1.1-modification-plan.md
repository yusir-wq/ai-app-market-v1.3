# MCP服务V1.1迭代修改计划

## 一、需求概述

基于用户提供的修改需求，对AI应用市场V1.1的MCP服务功能进行11项修改。

---

## 二、当前状态分析

### 相关文件

| 文件 | 当前功能 |
|-----|---------|
| `lib/mcp-data.ts` | MCP数据类型定义、7个示例平台服务、2个用户配置服务 |
| `contexts/mcp-context.tsx` | MCP状态管理上下文 |
| `components/workspace/mcp-config-modal.tsx` | 配置弹窗（服务商入驻跳转example.com） |
| `components/workspace/mcp-center.tsx` | 个人中心MCP页面（返回工作台按钮在右侧） |
| `components/workspace/mcp-service-list.tsx` | MCP服务列表（无登录检查、无状态显示） |
| `components/workspace/mcp-service-selector.tsx` | MCP服务选择器 |
| `components/workspace/input-area.tsx` | 输入区域（仅聊天模型有MCP按钮） |
| `components/workspace/workspace-content.tsx` | 工作台内容区 |

---

## 三、修改清单

### 1. 上传图片替换（配置弹窗图例）

**修改文件**: `components/workspace/mcp-config-modal.tsx`

**操作**: 将用户提供的chinaz教程图片保存到 `public/images/mcp-guide.png`，替换配置弹窗中的图例区域

**新布局**:
```tsx
<div className="aspect-square bg-muted/30 rounded-xl border border-border p-4 flex items-center justify-center">
  <img 
    src="/images/mcp-guide.png" 
    alt="MCP服务配置指南" 
    className="max-w-full max-h-full object-contain rounded-lg"
  />
</div>
```

---

### 2. 图片/视频模型增加MCP按钮

**修改文件**: `components/workspace/input-area.tsx`

**操作**: 在图片模型参数栏和视频模型参数栏开头增加 `<MCPServiceSelector />`

**新增位置**:
- 图片模型参数栏（showImageParams）：在 `<div className="flex items-center gap-2 flex-wrap">` 开头
- 视频模型参数栏（showVideoParams）：在 `<div className="flex items-center gap-2 flex-wrap">` 开头

---

### 3. 服务商入驻地址修改

**修改文件**: `components/workspace/mcp-config-modal.tsx`

**操作**: 将所有 `providerUrl` 替换为固定值 `https://www.chinaz.net/partner`

**位置**: 第76-83行的服务商入驻按钮 href

```tsx
<a
  href="https://www.chinaz.net/partner"
  target="_blank"
  rel="noopener noreferrer"
>
```

---

### 4. MCP服务Icon改为名称前2字

**修改文件**: `lib/mcp-data.ts`

**操作**: 
1. 添加辅助函数获取名称前2字作为icon
2. 更新所有服务的icon字段

**新增函数**:
```typescript
// 获取服务名称前2字作为图标
export function getServiceIcon(name: string): string {
  if (name.length <= 2) return name
  return name.substring(0, 2)
}
```

**更新Mock数据**:
- `platformMCPServices`: 7个服务的icon改为"IP"、"IP"、"Wh"、"IC"、"Wh"、"Wh"、"企"
- `mockUserMCPServices`: 2个服务的icon改为"IP"、"Wh"

---

### 5. MCP服务列表增加状态显示

**修改文件**: `components/workspace/mcp-service-list.tsx`

**操作**: 显示每个服务的"已启用/待配置"状态Badge

**新增**:
```tsx
<Badge 
  variant={service.status === 'enabled' ? 'default' : 'secondary'}
  className="text-xs"
>
  {service.status === 'enabled' ? '已启用' : '待配置'}
</Badge>
```

**待配置状态卡片点击逻辑**:
- 已启用服务：直接选中
- 待配置服务：弹出配置窗口

---

### 6. 未登录检查

**修改文件**: `components/workspace/mcp-service-list.tsx`

**操作**: 点击服务卡片前检查登录状态

```tsx
const { isLoggedIn, setShowLoginModal } = useAuth()

const handleServiceClick = (service) => {
  if (!isLoggedIn) {
    setShowLoginModal(true)
    return
  }
  // 原有逻辑
  setConfigModalService(service)
  setShowConfigModal(true)
}
```

---

### 7. MCP服务选择器"手动"模式优化

**修改文件**: `components/workspace/mcp-service-selector.tsx`

**操作**:
1. 选择"手动"时直接显示服务列表，无需再点"选择MCP服务"
2. 增加Tab切换（已配置/平台服务）
3. 底部增加"添加MCP服务"按钮，点击跳转到个人中心MCP页面

**新布局**:
```
DropdownMenuContent
├── 模式选择（禁用/自动/手动）
├── [手动模式下直接显示]
│   ├── Tabs: 已配置服务 | 平台MCP服务
│   ├── 服务列表（可多选，最多10个）
│   └── 底部：添加MCP服务按钮
```

**新增props**: `onNavigate?: (page: string) => void`

---

### 8. MCP服务Mock数据增加至12个

**修改文件**: `lib/mcp-data.ts`

**操作**: 将 `mockUserMCPServices` 从2个增加到12个

**新增5个服务**:
- ICP备案查询（enabled）
- IP反查域名（enabled）
- Whois反查（disabled）
- Whois历史信息（enabled）
- 企业工商信息查询（disabled）

**保持2个原有服务**

---

### 9. 历史对话展示MCP数据

**修改文件**: `components/workspace/workspace-content.tsx` 或 `components/chat/chat-messages.tsx`

**操作**: 
1. 在Mock数据中增加一个使用MCP服务的对话
2. 在消息展示组件中判断是否为MCP对话
3. MCP对话显示：思考过程、工具返回参数、整理参数信息、最终回复

**新增Mock数据**:
```typescript
// 在mock-data.ts中
export const mockMCPDialogue = {
  id: 'mcp-dialogue-1',
  title: 'IP查询对话',
  modelId: 'deepseek-v4-pro',
  messages: [
    {
      role: 'user',
      content: '查询192.168.1.1的详细信息',
    },
    {
      role: 'assistant',
      isMCP: true,
      mcpContent: mockMCPMessages['mcp-conversation-1'],
    }
  ]
}
```

---

### 10. 删除确认弹窗

**修改文件**: `components/workspace/mcp-center.tsx`

**操作**: 添加AlertDialog组件，删除前弹出确认

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// 状态
const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

// 修改删除按钮
<Button onClick={() => setDeleteConfirmId(service.id)} />

// 添加确认弹窗
<AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>确认删除</AlertDialogTitle>
      <AlertDialogDescription>
        确定要删除该MCP服务吗？此操作无法撤销。
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>取消</AlertDialogCancel>
      <AlertDialogAction onClick={() => {
        if (deleteConfirmId) deleteService(deleteConfirmId)
        setDeleteConfirmId(null)
      }}>
        删除
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### 11. 返回工作台按钮位置调整

**修改文件**: `components/workspace/mcp-center.tsx`

**操作**: 参考 `billing-usage.tsx` 的布局，将返回工作台按钮放到左侧

**当前布局**:
```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-4">
    <Button>返回</Button>
    <h1>标题</h1>
  </div>
  <Button>返回工作台</Button>  // ← 在右侧
</div>
```

**修改后**:
```tsx
<div className="flex items-center justify-between">
  <Button variant="ghost" className="gap-2" onClick={onBack}>
    <ArrowLeft className="h-4 w-4" />
    返回工作台
  </Button>
  <h1>标题</h1>
  <div className="w-[100px]" />  // 占位
</div>
```

---

## 四、文件变更汇总

### 修改文件（7个）

| 文件 | 修改内容 |
|-----|---------|
| `lib/mcp-data.ts` | 新增icon函数、12个mock数据 |
| `contexts/mcp-context.tsx` | 新增onNavigate回调 |
| `components/workspace/mcp-config-modal.tsx` | 图片引用、服务商入驻地址 |
| `components/workspace/mcp-center.tsx` | 返回按钮位置、删除确认弹窗 |
| `components/workspace/mcp-service-list.tsx` | 状态显示、未登录检查 |
| `components/workspace/mcp-service-selector.tsx` | Tab切换、添加MCP按钮 |
| `components/workspace/input-area.tsx` | 图片/视频模型增加MCP按钮 |
| `components/chat/chat-messages.tsx` | MCP对话展示 |
| `lib/mock-data.ts` | MCP对话mock数据 |

### 新增文件（1个）

| 文件 | 说明 |
|-----|-----|
| `public/images/mcp-guide.png` | chinaz教程图片（用户上传） |

---

## 五、假设与决策

| 决策项 | 决策内容 |
|-----|---------|
| 图片存储 | 保存到public目录，支持内网访问 |
| Icon生成 | 中英文混合处理，英文取前2字符 |
| Tab组件 | 使用现有Tabs组件实现切换 |
| 删除确认 | 使用AlertDialog组件 |