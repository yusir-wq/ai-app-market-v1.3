# MCP 卡片与弹窗 UI 调整计划

## Summary
本次调整聚焦 MCP 管理区域的卡片操作层级与弹窗信息精简：将“更多”按钮固定到卡片右上角，授权状态放在其下方并保持右侧中线对齐；将服务介绍区的“详情”入口改为稳定可见；从服务详情弹窗移除“消耗智点”；从快速配置弹窗移除步骤文字，仅保留 APIKey 输入区与视频占位区域。整体遵循前端界面最佳实践：减少视觉噪音、强化状态与操作分层、让高频任务路径更直接。

## Current State Analysis
### 1. `components/workspace/mcp-center.tsx`
- `MyMCPServiceCard` 当前采用横向三栏布局：左侧图标、中部信息、右侧“更多按钮 + 授权状态”。
- “更多”按钮和授权状态目前位于同一个右侧竖向容器中，但“更多”按钮并未固定到卡片右上角。
- `MyMCPServiceCard` 和 `MCPMarketCard` 都使用 `showDetailBtn` + `onMouseEnter/onMouseLeave` 控制“详情”按钮显示。
- 当前“详情”按钮虽然已不再受文本长度限制，但仍依赖 hover 状态，不满足“固定显示详情按钮”的更强要求。

### 2. `components/workspace/mcp-service-detail-modal.tsx`
- 详情弹窗当前会通过 `platformMCPServices` 查找 `points`，并渲染 `<Badge variant="secondary">{points}智点/次</Badge>`。
- 该字段属于附加信息，不是当前详情窗口的核心任务信息。

### 3. `components/workspace/mcp-quick-config-modal.tsx`
- 当前保留 `steps` 常量、步骤区标题“配置步骤”、三个步骤编号与文字/链接，以及下方视频占位区。
- 用户最新需求是移除操作步骤文字说明，仅保留视频占位区域组件。

## Proposed Changes

### 一、调整 `components/workspace/mcp-center.tsx`

#### 变更 1：重构 `MyMCPServiceCard` 右侧操作布局
- **What**
  - 将“更多”按钮改为绝对定位到卡片右上角。
  - 将授权状态标签调整到“更多”按钮下方，并让其整体落在卡片右侧中线附近，满足“更多按钮右上角、状态在其下方、卡片视觉上垂直对齐”的要求。
- **Why**
  - “更多”属于低频管理动作，固定在右上角更符合通用操作预期。
  - 授权状态属于高频查看信息，应该稳定处于卡片右侧、便于扫视但不干扰主信息流。
  - 该布局更符合前端 skill 提倡的“操作收敛、状态清晰、层级克制”。
- **How**
  - 保留 `Card` 的 `relative` 定位能力。
  - 将“更多”按钮改为 `absolute top-3 right-3` 一类定位方式。
  - 将授权状态放到同一右侧区域，采用竖向排列方案，并通过右侧容器整体垂直居中或局部绝对定位实现稳定对齐。
  - 为防止操作区遮挡正文，中部信息容器增加足够右侧留白，如 `pr-16` 或等效值。

#### 变更 2：将“详情”入口改为稳定可见，不再依赖 hover 状态
- **What**
  - 删除 `MyMCPServiceCard` 与 `MCPMarketCard` 中用于 hover 控制的 `showDetailBtn` 状态及 `onMouseEnter/onMouseLeave` 事件。
  - 将“详情”按钮从 hover 出现改为稳定显示。
- **Why**
  - 用户要求无论文本是否超过 2 行，都固定显示“详情”文字按钮。
  - 稳定可见的详情入口能减少闪烁、提升可发现性，也更符合产品界面的操作效率优先原则。
- **How**
  - 删除相关 `useState(false)`、mouseenter/mouseleave 逻辑。
  - 将“详情”按钮放到描述下方单独一行，右对齐显示；或保留在描述区域右下角但始终渲染。
  - 优先采用“描述下方单独一行右对齐”的形式，避免遮挡文本，保证两行描述的可读性。
  - 保持按钮为弱化样式，如 `text-xs text-primary hover:underline`，避免喧宾夺主。

#### 变更 3：统一 `MCPMarketCard` 的详情入口行为
- **What**
  - 同步调整 `MCPMarketCard` 的“详情”按钮显示策略，与 `MyMCPServiceCard` 保持一致。
- **Why**
  - 两类卡片都位于同一页面体系内，详情入口交互不应割裂。
- **How**
  - 删除 `MCPMarketCard` 的 hover 显隐控制，改为始终显示“详情”按钮。

### 二、调整 `components/workspace/mcp-service-detail-modal.tsx`

#### 变更 4：移除“消耗智点”字段
- **What**
  - 删除 `points` 的查找逻辑与 `Badge` 展示。
- **Why**
  - 当前详情弹窗应聚焦服务本身介绍与能力信息，不再混入计费字段，减少噪音。
- **How**
  - 删除 `platformMCPServices.find(...)` 与 `points` 变量。
  - 删除 `<Badge variant="secondary">{points}智点/次</Badge>` 区块。
  - 同时清理不再需要的 import，如 `Badge`、`platformMCPServices`，以及确认未使用的其他 import 是否可一并移除。

### 三、调整 `components/workspace/mcp-quick-config-modal.tsx`

#### 变更 5：移除步骤文字说明，仅保留视频占位区域组件
- **What**
  - 删除 `steps` 常量、步骤区标题“配置步骤”、编号+标题+链接渲染逻辑。
  - 仅保留 APIKey 输入区、视频占位区域和底部按钮。
- **Why**
  - 用户明确要求去掉步骤文字说明，只保留视频占位区。
  - 这会使弹窗更聚焦于“填写 + 查看演示 + 添加”这条主路径。
- **How**
  - 删除 `steps` 常量。
  - 删除 `handleLinkClick` 与 `ExternalLink` import。
  - 删除步骤区 grid 渲染。
  - 保留视频占位区所在模块，并将该模块标题从“配置步骤”改为更准确的“操作演示”或保留无标题，仅显示视频组件。
  - 在不影响现有结构的前提下，保持 `aspect-video` 占位比例不变。

## Assumptions & Decisions
1. 对“授权状态标签位置移动到更多按钮下方，和卡片垂直居中对齐”的理解为：
   - “更多”按钮视觉上必须固定在卡片右上角；
   - 授权状态位于其下方，并通过右侧操作区布局使其在卡片右边区域保持稳定、接近垂直中线的对齐效果。
2. 对“固定显示详情按钮”的实现，采用“始终渲染详情按钮”的方式，而不是继续依赖 hover 状态控制。
3. `MCPMarketCard` 虽未在第 1 点中单独提到授权状态，但其详情按钮逻辑与 `MyMCPServiceCard` 同类，因此按统一交互策略一并调整。
4. 视频占位区属于当前快速配置弹窗的核心可视说明组件，保留其 `aspect-video` 比例与占位样式，避免额外引入新组件。
5. 本次只做用户明确要求的 UI 与信息裁剪调整，不扩展到数据结构、接口调用逻辑或其它视觉重构。

## Verification Steps
1. 打开“个人中心 - MCP管理”页面，在“我的MCP”卡片中确认：
   - “更多”按钮位于卡片右上角；
   - 授权状态显示在其下方；
   - 右侧操作区不遮挡标题、英文名或描述内容。
2. 在“我的MCP”和“MCP市场”卡片中确认：
   - 服务介绍区域始终可见“详情”文字按钮；
   - 详情按钮不再依赖 hover 才显示；
   - 描述文本仍保持两行截断且无遮挡。
3. 打开 MCP 服务详情弹窗确认：
   - 页面中已不再出现“智点/次”或“消耗智点”相关展示；
   - 服务名、英文名、描述信息仍正常显示。
4. 打开快速配置 MCP 服务弹窗确认：
   - 步骤 1/2/3 的文字说明与链接已移除；
   - APIKey 输入框、视频占位区域、底部按钮仍正常显示；
   - 弹窗布局没有出现明显空白或错位。
