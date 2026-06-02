# MCP UI优化计划

## 任务概述
根据用户提供的图片和需求，对MCP中心进行UI优化，包括授权状态标签位置调整、服务介绍文本截断与详情展示、MCP服务详情弹窗内容完善、快速配置弹窗视频占位等。

## 当前状态分析

### 现有文件结构
- `mcp-center.tsx` - MCP中心主页面，包含我的MCP和市场卡片组件
- `mcp-context.tsx` - MCP状态管理Context
- `mcp-data.ts` - MCP数据类型和mock数据
- `mcp-quick-config-modal.tsx` - 快速配置弹窗
- `mcp-quick-create-modal.tsx` - 快速创建/编辑弹窗

### 当前问题
1. 授权状态标签位于Icon下方，需要移动到右上角"..."按钮下方并与卡片垂直居中对齐
2. 服务介绍文本没有截断处理，缺少hover显示"详情"按钮功能
3. MCP服务详情弹窗不存在，需要新建
4. 快速配置弹窗使用步骤图片，需要改为视频占位区域

## 详细实施计划

### 1. 授权状态标签位置调整

**文件**: `mcp-center.tsx`

**修改内容**:
- 将MyMCPServiceCard组件中的授权状态标签从Icon下方移动到右上角DropdownMenu下方
- 使用flex布局使授权状态标签与卡片垂直居中对齐
- 保持原有的Tooltip和点击检测功能

**具体实现**:
```tsx
// 当前位置：Icon下方
// 目标位置：右上角"..."按钮下方，与卡片垂直居中对齐
// 需要调整布局结构，将授权状态移到右侧操作区域
```

### 2. 服务介绍文本截断与详情展示

**文件**: `mcp-center.tsx`

**修改内容**:
- MyMCPServiceCard和MCPMarketCard的服务介绍文本最多显示2行
- 超出部分显示"..."
- hover状态下显示"详情"文字按钮
- 点击"详情"按钮显示MCP服务详情弹窗

**新增状态管理**:
- 在mcp-context.tsx中添加showDetailModal和detailService状态（如果尚未存在）

**mock数据更新**:
- 在`mcp-data.ts`中我的MCP和MCP市场的mock数据各增加1个介绍文本超过2行的卡片

### 3. MCP服务详情弹窗

**新建文件**: `mcp-service-detail-modal.tsx`

**弹窗内容**:
- 基本信息区域：服务icon、服务名称、服务英文名、服务介绍、消耗智点
- 请求/返回参数信息区域：一段详细介绍文本
- 底部按钮：MCP市场的服务显示"添加MCP"按钮，点击后可将服务添加到我的MCP

**数据传递**:
- 通过Context的detailService传递当前查看的服务信息
- 区分我的MCP和市场服务的展示逻辑

### 4. 快速配置弹窗视频占位

**文件**: `mcp-quick-config-modal.tsx`

**修改内容**:
- 移除原有的3个步骤图片
- 添加视频占位区域
- 占位文本："这是一段自动播放的操作视频教程，支持点击放大查看详情。"
- 视频区域样式：灰色背景，居中文本，模拟视频播放器外观

### 5. 数据模型更新

**文件**: `mcp-data.ts`

**修改内容**:
- 在mockUserMCPServices中添加1个description超过2行的服务
- 在platformMCPServices中添加1个description超过2行的服务

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `mcp-center.tsx` | 修改 | 调整授权状态位置，添加文本截断和详情按钮 |
| `mcp-context.tsx` | 修改 | 添加详情弹窗状态管理 |
| `mcp-data.ts` | 修改 | 添加长描述mock数据 |
| `mcp-quick-config-modal.tsx` | 修改 | 步骤图片改为视频占位 |
| `mcp-service-detail-modal.tsx` | 新建 | MCP服务详情弹窗组件 |

## 验证步骤

1. 授权状态标签显示在右上角"..."按钮下方
2. 服务介绍文本最多2行，超出显示"..."
3. hover服务介绍显示"详情"按钮
4. 点击"详情"按钮弹出MCP服务详情弹窗
5. 弹窗显示完整的服务信息
6. MCP市场服务的详情弹窗显示"添加MCP"按钮
7. 快速配置弹窗显示视频占位区域
8. 项目build成功
