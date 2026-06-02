# MCP管理页面调整计划（第二轮）

## 概述
对MCP管理页面进行第二轮UI和功能调整，包括移除开关、添加更多按钮、授权状态标签、请求头表格形式、移除长时间运行模式、添加联系客服按钮。

---

## 当前状态分析

### 相关文件
- `components/workspace/mcp-center.tsx` - MCP中心主页面
- `components/workspace/mcp-quick-create-modal.tsx` - 编辑MCP服务弹窗

### 当前我的MCP卡片
- 右侧有：启用开关(Switch)、编辑按钮、删除按钮
- 无授权状态标签

### 当前编辑弹窗
- 请求头使用JSON格式的Textarea
- 有长时间运行模式选项

### 头部按钮
- 服务商入驻按钮
- 企业级MCP定制按钮

---

## 待实施变更

### 变更1: 移除Switch开关
**文件**: `components/workspace/mcp-center.tsx`

**修改内容**:
1. 移除 `MyMCPServiceCard` 组件中的 `Switch` 导入
2. 移除组件中的 `onToggle` 属性
3. 移除Switch开关UI

---

### 变更2: 增加"更多"按钮及hover下拉菜单
**文件**: `components/workspace/mcp-center.tsx`

**修改内容**:
1. 导入 `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` 组件
2. 导入 `MoreHorizontal` 图标
3. 修改 `MyMCPServiceCard` 组件:
   - 添加 `DropdownMenu` 包裹操作区域
   - 添加"更多"按钮（`MoreHorizontal` 图标）
   - hover下拉菜单包含：
     - "编辑MCP服务"选项
     - "移除"选项
4. 移除独立的编辑按钮和删除按钮（移到下拉菜单中）

**布局**（从右到左）:
```
[... 更多按钮]
```

**下拉菜单**:
- "编辑MCP服务" - 铅笔图标
- "移除" - 垃圾桶图标（红色警告样式）

**图标**: 使用 `MoreHorizontal` 图标（三个点）表示"更多"按钮

---

### 变更3: 增加授权状态标签
**文件**: `components/workspace/mcp-center.tsx`

**修改内容**:
1. 导入 `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` 组件
2. 导入 `CheckCircle` 和 `XCircle` 图标
3. 在 `MyMCPServiceCard` 中添加授权状态标签:
   - 服务信息区域底部添加状态标签
   - "已授权"状态：绿色标签，显示 `CheckCircle` 图标
   - "未授权"状态：红色/灰色标签，显示 `XCircle` 图标
4. hover状态：显示底纹和tooltip
5. tooltip内容（已授权和未授权保持一致）：
   - "MCP服务正常使用时显示“已授权”；服务不可用时（如APIKey 失效/次数不足/服务下架等）显示“未授权”。点击可获取MCP服务最新状态。"
6. 点击后：显示loading状态，更新授权状态（模拟API调用）
7. 标签可点击

**状态数据结构**:
```typescript
interface MCPService {
  // ... 现有字段
  authStatus?: 'authorized' | 'unauthorized' | 'checking'
}
```

---

### 变更4: 请求头改为列表形式
**文件**: `components/workspace/mcp-quick-create-modal.tsx`

**修改内容**:
1. 移除 `Textarea` 导入
2. 导入必要的组件（根据设计图实现）
3. 将JSON Textarea替换为表格形式:
   - 表格标题行："请求头名称" | "请求头值" | ""
   - 每行包含：输入框、输入框、删除按钮
   - 底部添加"添加请求头"按钮
   - Authorization行有特殊样式（底纹高亮）
   - 值的掩码显示（如 `Be******************************`）

**UI布局**:
```
请求头

发送到 MCP 服务器的额外 HTTP 请求头
为了安全，请求头值已被掩码处理

| 请求头名称      | 请求头值                      |    |
|----------------|-------------------------------|----|
| Authorization  | Be*************************** | 🗑️ |
+----------------+-------------------------------+----+

+ 添加请求头
```

---

### 变更5: 移除长时间运行模式选项
**文件**: `components/workspace/mcp-quick-create-modal.tsx`

**修改内容**:
1. 移除 `Switch` 导入（如果仅用于此选项）
2. 移除表单中的"长时间运行模式"选项（第178-190行）
3. 移除相关的 `longRunning` 状态
4. 保存时不再包含 `longRunning` 字段

---

### 变更6: 增加联系MCP客服按钮
**文件**: `components/workspace/mcp-center.tsx`

**修改内容**:
1. 导入客服二维码图片
2. 添加客服二维码图片到 `public/images/` 目录
3. 在服务商入驻按钮左侧添加"联系MCP客服"按钮
4. 按钮为hover下拉样式，显示：
   - 按钮文字"联系MCP客服"
   - hover下拉显示二维码图片
   - tooltip提示："手机扫码加我微信"

**布局**（从左到右）:
```
[联系MCP客服▼] [服务商入驻] [企业级MCP定制]
```

---

## 实施步骤

### 步骤1: 保存客服二维码图片
1. 将用户提供的二维码图片保存到 `public/images/customer-service-qrcode.png`

### 步骤2: 修改mcp-center.tsx
1. 更新导入语句
2. 修改 `MyMCPServiceCard` 组件
3. 添加授权状态标签功能
4. 修改头部按钮区域

### 步骤3: 修改mcp-quick-create-modal.tsx
1. 更新导入语句
2. 移除长时间运行模式
3. 将请求头改为表格列表形式
4. 更新保存逻辑

### 步骤4: 验证测试
1. 测试卡片更多按钮下拉菜单
2. 测试授权状态标签hover和点击
3. 测试编辑弹窗请求头表格
4. 测试联系客服按钮hover

---

## 技术细节

### 依赖组件
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` - 下拉菜单
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` - tooltip提示
- `MoreHorizontal` - 更多按钮图标
- `CheckCircle`, `XCircle` - 授权状态图标

### 图标
- `MoreHorizontal` - 更多按钮
- `Pencil` - 编辑（移入下拉）
- `Trash2` - 删除（移入下拉，红色）
- `CheckCircle` - 已授权
- `XCircle` - 未授权

### 状态管理
- 授权状态需要新增字段到 `MCPService` 类型
- 点击授权标签时触发模拟API调用更新状态

---

## 用户确认

用户已提供：
1. ✅ 请求头列表形式设计参考图
2. ✅ 客服二维码图片
