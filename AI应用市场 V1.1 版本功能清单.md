The user wants me to compile a comprehensive changelog/feature list of all the changes made in the V1.1 version. Let me review the conversation history to compile all the modifications that were made.

Let me organize the changes by module/area:

1. **MCP服务选择器区域 (mcp-service-selector.tsx)**
   - 移除MCP服务选项的icon和英文名称
   - 服务名称右侧增加"启用中"提示（仅已勾选的显示）
   - 标题改为"选择MCP服务（x）"，x表示已选数量
   - 标题右侧增加Switch开关，控制MCP服务启用/关闭
   - 关闭后选项禁用，不可勾选，增加禁用样式（opacity-50, cursor-not-allowed）
   - 按钮有选中/未选中样式区分（选中时边框高亮+背景色）
   - 停用时隐藏已选MCP服务数量显示
   - 底部"已选择x个服务"改为"MCP管理"按钮，点击跳转到个人中心-MCP服务页面
   - MCP启用/关闭增加全局Toast提示
   - MCP总开关状态同步到Context

2. **个人中心-MCP服务 (mcp-center.tsx)**
   - 移除页面标题"MCP服务"
   - Tabs居中显示，缩小宽度
   - 头部布局：左侧"返回工作台"按钮、中间Tabs、右侧服务商入驻+企业级MCP定制按钮
   - 我的MCP和MCP市场卡片改为一行3列布局
   - MCP卡片英文名称从服务名称下方移动到右侧
   - MCP市场卡片已添加状态使用Badge样式，删除重复标签
   - 我的MCP页面增加搜索框
   - 我的MCP和MCP市场都增加分页组件（中文：上一页/下一页）
   - 添加/启用/关闭/删除服务时显示Toast提示
   - MCP市场增加"企业级MCP定制"按钮（渐变背景，跳转链接）

3. **快速配置MCP服务弹窗 (mcp-config-modal.tsx)**
   - 删除右上角"企业级MCP定制"和"服务商入驻"按钮
   - 添加窗口标题"配置MCP服务"
   - API_KEY改为APIKey
   - 图例说明区域改为Steps组件（1行3列）
   - Step1: 访问chinaz.net官网（可点击跳转）
   - Step2: 购买MCP API接口服务
   - Step3: 进入控制台复制APIKey
   - 3个1:1图片占位（已替换为实际截图）
   - 添加服务成功时显示Toast提示

4. **编辑MCP服务弹窗 (mcp-quick-create-modal.tsx)**
   - 字段顺序调整：服务名称→MCP英文名称→服务介绍→服务类型→URL→请求头→长时间运行模式→超时时间
   - 只处理编辑模式，不再处理从市场添加

5. **数据模型 (lib/mcp-data.ts)**
   - 增加englishName字段
   - 状态简化为enabled/disabled
   - 平台服务增加defaultUrl字段

6. **Context (contexts/mcp-context.tsx)**
   - 删除mcpMode相关逻辑
   - 新增mcpEnabled全局状态

7. **侧边栏 (sidebar.tsx)**
   - 删除MCP服务列表，只保留大模型列表

8. **导航栏 (header.tsx)**
   - 移除"已配置MCP服务：x个"组件

9. **历史对话详情 (mcp-message-view.tsx, mcp-tool-result.tsx)**
   - "工具返回参数"改为"whois历史信息 : get_whois_history"

10. **历史对话时间显示 (user-message.tsx, ai-message.tsx, chat-messages.tsx)**
    - 同一轮对话的最近1条显示时分（14:15）
    - 其余显示完整时间（2026/05/20 09:50）

11. **充值窗口 (recharge-modal.tsx)**
    - 文本改为"支付成功即视为您同意《购买协议》"
    - 移除复选框，只保留文本
    - 确认支付按钮默认启用

12. **全局Toast提示 (app/layout.tsx)**
    - 添加Toaster组件，position="top-center"

13. **删除文件**
    - 删除mcp-json-import-modal.tsx

14. **分页组件中文化 (pagination.tsx)**
    - "Previous"→"上一页"，"Next"→"下一页"
根据本次会话的所有修改，整理如下：

---

## AI应用市场 V1.1 版本功能清单

### 一、MCP服务选择器

| 序号 | 功能项 | 说明 |
|------|--------|------|
| 1 | 移除icon和英文名称 | 选项仅显示服务名称 |
| 2 | "启用中"提示 | 仅已勾选的MCP服务显示 |
| 3 | 标题格式 | 改为"选择MCP服务（x）"，x为已选数量 |
| 4 | MCP总开关 | 标题右侧Switch，控制启用/关闭，状态同步到全局Context |
| 5 | 禁用样式 | 停用时选项不可点击，opacity-50 + cursor-not-allowed |
| 6 | 按钮选中样式 | 启用且有选择时边框高亮+背景色，停用时隐藏数量 |
| 7 | Toast提示 | 启用显示"MCP服务已启用"，停用显示"MCP服务已停用" |
| 8 | 底部按钮 | "已选择x个服务"改为"MCP管理"，点击跳转到MCP服务页面 |

### 二、个人中心-MCP服务

| 序号 | 功能项 | 说明 |
|------|--------|------|
| 1 | 页面标题 | 移除"MCP服务"标题 |
| 2 | Tabs布局 | 居中显示，缩小宽度 |
| 3 | 头部布局 | 左侧"返回工作台"按钮 + 中间Tabs + 右侧"服务商入驻"+"企业级MCP定制" |
| 4 | 卡片布局 | 我的MCP和MCP市场均改为一行3列 |
| 5 | 英文名称位置 | 从服务名称下方移到右侧 |
| 6 | 已添加状态 | Badge样式，不重复显示 |
| 7 | 搜索功能 | 我的MCP和MCP市场均增加搜索框，支持按名称/英文名/描述搜索 |
| 8 | 分页组件 | 我的MCP和MCP市场均增加分页，中文显示（上一页/下一页） |
| 9 | Toast提示 | 添加/启用/停用/删除服务时显示全局提示 |
| 10 | 企业级MCP定制 | 渐变背景按钮，跳转 https://www.chinaz.net/custom |
| 11 | 服务商入驻 | ExternalLink图标按钮，跳转 https://www.chinaz.net/partner |

### 三、快速配置MCP服务弹窗（从市场添加）

| 序号 | 功能项 | 说明 |
|------|--------|------|
| 1 | 窗口标题 | 显示"配置MCP服务" |
| 2 | APIKey标题 | "API_KEY"改为"APIKey" |
| 3 | Steps组件 | 1行3列水平排列，步骤编号+标题+图片上下对应 |
| 4 | Step1 | 访问chinaz.net官网（可点击跳转） |
| 5 | Step2 | 购买MCP API接口服务 |
| 6 | Step3 | 进入控制台复制APIKey |
| 7 | 步骤图片 | 3张1:1截图占位（已替换为实际图片） |
| 8 | Toast提示 | 添加成功时显示"xxx 已添加" |

### 四、编辑MCP服务弹窗

| 序号 | 功能项 | 说明 |
|------|--------|------|
| 1 | 字段顺序 | 服务名称→MCP英文名称→服务介绍→服务类型→URL→请求头→长时间运行模式→超时时间 |
| 2 | 职责分离 | 仅处理编辑模式，从市场添加由配置弹窗处理 |

### 五、数据模型与Context

| 序号 | 功能项 | 说明 |
|------|--------|------|
| 1 | englishName字段 | MCPService增加英文名称 |
| 2 | defaultUrl字段 | 平台服务增加默认URL |
| 3 | 状态简化 | enabled/disabled |
| 4 | mcpEnabled全局状态 | MCP总开关同步到Context |
| 5 | 删除mcpMode | 移除旧的MCP模式逻辑 |

### 六、侧边栏与导航栏

| 序号 | 功能项 | 说明 |
|------|--------|------|
| 1 | 侧边栏 | 删除MCP服务列表，只保留大模型列表 |
| 2 | 导航栏 | 移除"已配置MCP服务：x个"组件 |

### 七、历史对话

| 序号 | 功能项 | 说明 |
|------|--------|------|
| 1 | 时间格式 | 最近1条显示时分（14:15），其余显示完整时间（2026/05/20 09:50） |
| 2 | 工具返回参数 | 改为"whois历史信息 : get_whois_history" |

### 八、充值窗口

| 序号 | 功能项 | 说明 |
|------|--------|------|
| 1 | 协议文本 | 改为"支付成功即视为您同意《购买协议》" |
| 2 | 复选框 | 移除，只保留文本 |
| 3 | 确认按钮 | 默认启用，不再需要勾选协议 |

### 九、基础设施

| 序号 | 功能项 | 说明 |
|------|--------|------|
| 1 | 全局Toast | layout.tsx添加Toaster组件（position="top-center"） |
| 2 | 分页中文化 | "Previous"→"上一页"，"Next"→"下一页" |
| 3 | 删除文件 | 移除mcp-json-import-modal.tsx |