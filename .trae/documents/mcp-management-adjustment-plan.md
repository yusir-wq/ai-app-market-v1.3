# MCP管理页面调整实施计划

## 概述
对MCP管理页面进行多项UI和功能调整，包括移除智点显示、详情弹窗，新增编辑功能和快速配置弹窗。

## 当前状态分析

### 现有文件结构
- `components/workspace/mcp-center.tsx` - MCP中心主页面（我的MCP + MCP市场）
- `components/workspace/mcp-service-detail-modal.tsx` - MCP服务详情弹窗
- `components/workspace/mcp-quick-create-modal.tsx` - MCP快速创建/编辑弹窗
- `contexts/mcp-context.tsx` - MCP状态管理上下文
- `lib/mcp-data.ts` - MCP数据类型定义和mock数据

### 当前功能
1. **我的MCP页面**: 展示用户已添加的MCP服务卡片，支持删除和查看详情
2. **MCP市场页面**: 展示平台MCP服务，支持添加和查看详情
3. **服务卡片**: 显示图标、名称、英文名称、描述、智点消耗、详情按钮
4. **详情弹窗**: 展示服务完整信息，支持添加服务
5. **编辑弹窗**: 编辑服务名称、请求头、长时间运行模式、超时时间

---

## 需求确认清单

在继续之前，请确认以下细节：

### 问题1: 我的MCP卡片按钮设计
当前我的MCP卡片右侧有"详情"和"删除"按钮。根据需求需要替换为：
- **启用开关**（Switch组件）
- **编辑MCP服务**按钮

**请确认**: 删除按钮是否保留？还是完全替换为上述两个按钮？
- 删除按钮保留。

### 问题2: 快速配置MCP服务的触发时机
需求提到"点击添加按钮后触发"快速配置弹窗。

**请确认**: 
- 是指MCP市场页面中每个服务的"添加"按钮吗？
- 添加成功后是否还需要显示"{服务名}已添加"的Toast提示？
- 是指MCP市场页面中每个服务的"添加"按钮，添加成功后还需要显示"{服务名}已添加"的Toast提示。

### 问题3: 步骤图片
快速配置弹窗需要3张1:1截图占位图。

**请确认**: 
- 是否需要我生成3张占位图片？
- 还是使用纯色/图标占位即可？
- 生成3张纯色占位图片即可，后续我将提供实际图片给你替换。

---

## 待实施变更

### 变更1: MCP服务卡片移除智点显示和详情按钮
**文件**: `components/workspace/mcp-center.tsx`

**修改内容**:
1. `MyMCPServiceCard` 组件:
   - 移除第64-67行的智点显示代码
   - 移除第71-79行的"详情"按钮

2. `MCPMarketCard` 组件:
   - 移除第126-129行的智点显示代码
   - 移除第134-141行的"详情"按钮

---

### 变更2: 移除MCP服务详情弹窗
**文件**: 
- `components/workspace/mcp-service-detail-modal.tsx` - 删除整个文件
- `components/workspace/workspace.tsx` - 移除详情弹窗组件引用
- `contexts/mcp-context.tsx` - 移除详情弹窗相关状态

**修改内容**:
1. 删除 `mcp-service-detail-modal.tsx` 文件
2. 在 `workspace.tsx` 中移除 `MCPServiceDetailModal` 组件渲染
3. 在 `mcp-context.tsx` 中移除以下状态:
   - `showDetailModal`
   - `setShowDetailModal`
   - `detailService`
   - `setDetailService`
4. 在 `mcp-center.tsx` 中移除详情相关的处理函数和引用

---

### 变更3: 我的MCP卡片增加启用开关和编辑按钮
**文件**: `components/workspace/mcp-center.tsx`

**修改内容**:
1. 导入 `Switch` 组件和 `Pencil` 图标
2. 修改 `MyMCPServiceCard` 组件:
   - 添加 `onEdit` 和 `onToggle` 回调属性
   - 在操作区域添加启用开关（Switch组件）
   - 添加编辑按钮（Pencil图标）
3. 在 `MCPCenter` 组件中:
   - 添加处理编辑的函数，打开编辑弹窗
   - 添加处理开关切换的函数，调用 `toggleServiceStatus`

**卡片按钮布局**（从右到左）:
```
[删除按钮] [编辑按钮] [启用开关]
```

---

### 变更4: 编辑MCP服务窗口字段调整
**文件**: `components/workspace/mcp-quick-create-modal.tsx`

**当前字段**:
- 服务名称（可编辑）
- MCP英文名称（只读）
- 服务介绍（只读）
- 服务类型（只读）
- URL（只读）
- 请求头（可编辑）
- 长时间运行模式（可编辑）
- 超时时间（可编辑）

**确认**: 当前字段已满足需求第4点要求，无需修改。

---

### 变更5: MCP市场页面增加快速配置弹窗
**文件**: 
- `components/workspace/mcp-quick-config-modal.tsx` - 新建文件
- `components/workspace/mcp-center.tsx` - 集成弹窗
- `contexts/mcp-context.tsx` - 添加弹窗状态

**弹窗内容**:
1. **窗口标题**: "配置MCP服务"
2. **APIKey输入框**: 文本输入框，placeholder提示
3. **Steps组件**: 1行3列水平排列
   - 步骤编号 + 标题 + 图片 上下对应
   - Step1: 访问chinaz.net官网（可点击域名跳转）
   - Step2: 购买MCP API接口服务
   - Step3: 进入控制台复制APIKey
   - 3张1:1截图占位图
4. **添加成功提示**: Toast显示 "{服务名}已添加"

**交互流程**:
1. 在MCP市场点击"添加"按钮
2. 弹出快速配置弹窗
3. 用户输入APIKey
4. 点击确认添加
5. 关闭弹窗，显示成功Toast

---

## 实施步骤

### 步骤1: 更新 MCP Context
**文件**: `contexts/mcp-context.tsx`

1. 移除详情弹窗相关状态
2. 添加快速配置弹窗状态:
   - `showQuickConfigModal`
   - `setShowQuickConfigModal`
   - `quickConfigService`
   - `setQuickConfigService`

### 步骤2: 修改 MCP Center 页面
**文件**: `components/workspace/mcp-center.tsx`

1. 移除智点显示和详情按钮
2. 修改我的MCP卡片，添加启用开关和编辑按钮
3. 修改MCP市场添加逻辑，打开快速配置弹窗

### 步骤3: 创建快速配置弹窗
**文件**: `components/workspace/mcp-quick-config-modal.tsx`

1. 创建新组件
2. 实现Steps组件布局
3. 实现APIKey输入
4. 实现添加逻辑

### 步骤4: 删除详情弹窗文件
**文件**: `components/workspace/mcp-service-detail-modal.tsx`

1. 删除整个文件
2. 在 `workspace.tsx` 中移除引用

### 步骤5: 验证测试
1. 验证我的MCP页面卡片显示正常
2. 验证启用开关功能正常
3. 验证编辑按钮打开编辑弹窗
4. 验证MCP市场添加按钮打开快速配置弹窗
5. 验证快速配置弹窗步骤显示正确
6. 验证添加成功Toast提示

---

## 技术细节

### 依赖组件
- `Switch` - 启用开关
- `Dialog` - 弹窗基础
- `Input` - 输入框
- `Button` - 按钮
- `Label` - 标签
- `Steps` - 步骤组件（需要确认项目中是否有现成组件）

### 图标
- `Pencil` - 编辑按钮
- `Trash2` - 删除按钮（保留）
- `Plus` - 添加按钮

### 状态管理
- 使用现有的 `useMCP` hook
- 新增状态通过 context 管理

---

## 等待用户确认

请回复确认以下问题，我将开始实施：

1. **删除按钮是否保留？** 我的MCP卡片上除了启用开关和编辑按钮，是否还需要保留删除按钮？

2. **步骤图片如何处理？** 快速配置弹窗的3张步骤图片需要我生成占位图，还是使用其他方式（如图标、纯色块）？

3. **Steps组件**: 项目中是否有现成的Steps/Stepper组件？如果没有，我可以使用简单的自定义布局实现。
