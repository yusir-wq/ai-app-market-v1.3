# MCP服务选择器和个人中心调整计划

## 一、需求摘要

基于附件图片和用户需求，对 MCP 服务选择器和个人中心-MCP服务页面进行调整。

## 二、当前状态分析

### 2.1 MCP服务选择器 (`mcp-service-selector.tsx`)
- 当前使用 Popover 组件，Hover 触发
- 显示：图标、服务名称、英文名称
- 按钮显示：MCP服务(x) 徽章
- 底部显示：已选择 x 个服务

### 2.2 MCP中心页面 (`mcp-center.tsx`)
- 我的MCP和MCP市场使用单列卡片列表
- 卡片显示：图标、名称、英文名称（下方）、描述、开关、操作按钮
- MCP市场卡片显示"已添加"标签和添加按钮

### 2.3 MCP配置弹窗 (`mcp-config-modal.tsx`)
- 当前只有一个API_KEY输入框和图例说明
- 用于从市场添加服务时配置

## 三、详细变更计划

### 3.1 MCP服务选择器调整 (`mcp-service-selector.tsx`)

#### 变更1：移除icon和英文名称，增加"启用中"提示
- 删除服务项中的图标显示
- 删除英文名称显示
- 在服务名称右侧增加小字"启用中"提示

#### 变更2：标题改为"选择MCP服务（x）"
- 标题格式：选择MCP服务（x）
- x 表示已选MCP服务的数量

#### 变更3：标题右侧增加开关控制
- 在标题行右侧增加 Switch 开关
- 开关控制 MCP 服务的启用/关闭状态
- 关闭后，已选MCP服务选项透明度变为80%
- 参考附件图片样式

#### 变更4：底部按钮改为"MCP管理配置"
- 删除"已选择 x 个服务"文本
- 改为"MCP管理配置"按钮
- 点击后跳转到个人中心-MCP服务页面

**实现方式**：
```tsx
// 需要新增状态控制MCP服务整体开关
const [mcpEnabled, setMcpEnabled] = useState(true)

// 标题区域
<div className="flex items-center justify-between">
  <span>选择MCP服务（{selectedCount}）</span>
  <Switch checked={mcpEnabled} onCheckedChange={setMcpEnabled} />
</div>

// 服务列表项（关闭时透明度80%）
<div className={cn("flex items-center gap-2", !mcpEnabled && "opacity-80")}>
  <Checkbox />
  <span>服务名称</span>
  <span className="text-xs text-muted-foreground">启用中</span>
</div>

// 底部按钮
<Button onClick={() => onNavigate?.('mcp-center')}>
  MCP管理配置
</Button>
```

### 3.2 个人中心-MCP服务调整 (`mcp-center.tsx`)

#### 变更1：卡片布局改为一行3列
- 当前：单列布局
- 改为：CSS Grid 一行3列
- 使用 `grid-cols-3` 或响应式 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

#### 变更2：编辑弹窗字段顺序调整
调整 `mcp-quick-create-modal.tsx` 中的字段顺序：
1. 服务名称（可编辑）
2. MCP英文名称（只读）
3. 服务介绍（只读）
4. 服务类型（只读）
5. URL（只读）
6. 请求头（可编辑）
7. 长时间运行模式（可编辑）
8. 超时时间（秒）（可编辑）

#### 变更3：MCP卡片英文名称位置调整
- 当前：服务名称下方
- 改为：服务名称右侧
- 格式：`服务名称 englishName`

#### 变更4：MCP市场卡片状态标签优化
- 已添加状态：使用明显的标签样式（如 Badge variant="secondary"）
- 删除服务名称右侧重复的"已添加"标签
- 只保留操作区域的1个状态标识

**实现方式**：
```tsx
// 卡片头部
<div className="flex items-center gap-2">
  <span className="font-medium">{service.name}</span>
  <span className="text-xs text-muted-foreground">{service.englishName}</span>
  {isAdded && <Badge variant="secondary">已添加</Badge>}
</div>

// 操作区域
{isAdded ? (
  <Badge variant="outline">已添加</Badge>
) : (
  <Button size="sm" variant="outline">+ 添加</Button>
)}
```

### 3.3 MCP市场添加流程调整

#### 变更5：点击MCP市场卡片后显示简化配置弹窗
- 当前：显示完整的配置弹窗（多个字段）
- 改为：显示简化弹窗（只有API_KEY输入框和图例说明）
- 复用 `mcp-config-modal.tsx` 组件
- 隐藏其他配置字段，只保留 API Key 输入

**实现方式**：
```tsx
// 在 mcp-center.tsx 中
const handleAddFromMarket = (platformService: PlatformMCPService) => {
  setConfigModalService(platformService)
  setShowConfigModal(true) // 打开简化配置弹窗
}

// mcp-config-modal.tsx 调整
// 只显示 API Key 输入框和图例
// 隐藏其他字段
```

## 四、文件变更清单

| 文件路径 | 变更类型 | 变更说明 |
|----------|----------|----------|
| `components/workspace/mcp-service-selector.tsx` | 修改 | 标题、开关、样式、底部按钮调整 |
| `components/workspace/mcp-center.tsx` | 修改 | 卡片布局、英文名称位置、状态标签优化 |
| `components/workspace/mcp-quick-create-modal.tsx` | 修改 | 字段顺序调整 |
| `components/workspace/mcp-config-modal.tsx` | 修改 | 简化配置弹窗（只保留API Key） |

## 五、实现细节

### 5.1 MCP服务选择器新增状态
需要在组件内新增本地状态：
```tsx
const [mcpEnabled, setMcpEnabled] = useState(true)
```

### 5.2 卡片3列布局
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {services.map(service => <MCPServiceCard key={service.id} ... />)}
</div>
```

### 5.3 透明度控制
```tsx
className={cn(
  "transition-opacity",
  !mcpEnabled && "opacity-80"
)}
```

## 六、验证步骤

1. **MCP服务选择器**:
   - 标题显示"选择MCP服务（x）"
   - 标题右侧有开关
   - 服务项不显示icon和英文名称
   - 服务名称右侧显示"启用中"
   - 关闭开关后服务项透明度80%
   - 底部显示"MCP管理配置"按钮

2. **MCP中心-我的MCP**:
   - 卡片一行3列
   - 英文名称在服务名称右侧

3. **MCP中心-MCP市场**:
   - 卡片一行3列
   - 已添加状态标签明显
   - 不重复显示"已添加"

4. **配置弹窗**:
   - 字段顺序正确
   - 从市场添加时只显示API Key输入
