# MCP管理功能回滚计划

## 任务目标
完整回滚最近对MCP管理区域的修改，恢复到包含快速配置MCP服务窗口的版本。

## 当前状态分析

### 问题
1. `mcp-config-modal.tsx` 已被删除
2. `workspace.tsx` 已将 `MCPConfigModal` 替换为 `MCPServiceDetailModal`
3. 项目没有Git历史，无法通过Git恢复

### 需要回滚的文件
| 文件 | 当前状态 | 目标状态 |
|------|----------|----------|
| `mcp-config-modal.tsx` | 已删除 | 恢复（重新创建） |
| `mcp-service-detail-modal.tsx` | 新创建 | 删除 |
| `workspace.tsx` | 使用 MCPServiceDetailModal | 改回 MCPConfigModal |

## 实施步骤

### 步骤1：删除不需要的文件
- [ ] 删除 `components/workspace/mcp-service-detail-modal.tsx`

### 步骤2：恢复/创建 MCPConfigModal
创建 `components/workspace/mcp-config-modal.tsx`，包含：
- 基本信息展示（服务icon、名称、英文名、介绍）
- 服务配置表单（URL、Headers、Timeout等）
- 添加/保存功能
- 使用 `useMCP` context 中的 `showConfigModal`、`setShowConfigModal`、`configModalService`、`setConfigModalService` 状态

### 步骤3：更新 workspace.tsx
- [ ] 将 `import { MCPServiceDetailModal }` 改回 `import { MCPConfigModal }`
- [ ] 将所有 `<MCPServiceDetailModal />` 改回 `<MCPConfigModal />`（共4处）

### 步骤4：验证编译
- [ ] 运行 `npm run build` 确认无错误

## 依赖文件（保持不变）
- `contexts/mcp-context.tsx` - 保持 showConfigModal、configModalService 等状态定义
- `lib/mcp-data.ts` - 保持 PlatformMCPService、MCPService 等类型定义
- `components/workspace/mcp-center.tsx` - 保持分类Tabs等功能（如果用户要求保留）

## 验证标准
1. `mcp-config-modal.tsx` 文件存在且功能完整
2. `mcp-service-detail-modal.tsx` 文件已删除
3. `workspace.tsx` 正确引用 `MCPConfigModal`
4. `npm run build` 编译成功
5. 页面可以正常加载，MCP配置弹窗可以正常弹出
