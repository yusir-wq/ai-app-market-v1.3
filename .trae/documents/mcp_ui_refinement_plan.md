# MCP UI 优化实施计划

本计划旨在根据用户反馈，对 MCP 管理页面的 UI 布局、交互逻辑及信息展示进行精细化调整。

## 当前状态分析
- **`mcp-center.tsx`**: `MyMCPServiceCard` 和 `MCPMarketCard` 目前仅在描述超过 60 字符时才在 hover 状态下显示“详情”按钮。
- **`mcp-service-detail-modal.tsx`**: 详情弹窗中包含“智点/次”的 Badge 标签。
- **`mcp-quick-config-modal.tsx`**: 包含 1-2-3 步骤的文字说明和链接，位于视频占位符上方。

## 拟议变更

### 1. `components/workspace/mcp-center.tsx`
- **MyMCPServiceCard 授权状态调整**:
    - 确认右侧操作容器 `div` (line 143) 保持 `flex-col items-center` 布局。
    - 确保该容器在父级 `flex` 布局中通过 `items-center` 实现垂直居中。
- **详情按钮显示逻辑修改**:
    - 在 `MyMCPServiceCard` 中，移除 `shouldShowDetailBtn` 变量 (line 102)。
    - 修改渲染条件 (line 131)，仅保留 `showDetailBtn` 判断。
    - 在 `MCPMarketCard` 中，移除 `shouldShowDetailBtn` 变量 (line 200)。
    - 修改渲染条件 (line 227)，仅保留 `showDetailBtn` 判断。

### 2. `components/workspace/mcp-service-detail-modal.tsx`
- **移除智点字段**:
    - 删除获取 `points` 的逻辑代码 (lines 30-32)。
    - 删除渲染 `Badge` 的代码块 (lines 62-64)。

### 3. `components/workspace/mcp-quick-config-modal.tsx`
- **简化配置步骤区域**:
    - 删除 `steps` 数据常量 (lines 19-33)。
    - 删除“配置步骤”标签及其下方的步骤 Grid 渲染代码 (lines 114-139)。
    - 保留视频占位区域 (lines 141-148)，并根据需要调整间距。

## 验证步骤
1. **授权状态**: 检查“我的MCP”卡片，确认授权状态标签位于“更多”按钮下方，且整体在卡片右侧垂直居中。
2. **详情按钮**: 鼠标悬停在任意 MCP 服务的描述文本上，确认“详情”按钮均能正常显示。
3. **详情弹窗**: 点击“详情”，确认弹窗内不再显示“智点/次”信息。
4. **快速配置**: 点击“添加”或“配置”，确认弹窗中不再显示 1-2-3 步骤文字，仅显示 APIKey 输入框和视频教程区域。

## 决策与假设
- 假设用户提到的“移除操作步骤文字说明”是指移除整个步骤列表（编号+标题），因为这些信息通常与视频内容重复。
- 保持视频占位符的 `aspect-video` 比例，确保视觉一致性。
