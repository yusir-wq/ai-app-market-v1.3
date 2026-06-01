# MCP管理区域调整计划

## 一、需求摘要

对个人中心-MCP管理区域进行多项调整，包括分类筛选、智点显示、详情弹窗、交互流程优化等。

## 二、详细变更计划

### 2.1 数据模型调整 (`lib/mcp-data.ts`)

#### 变更1：增加分类字段
- **新增**: `category` 字段到 `PlatformMCPService` 接口
- **分类枚举**: 'all' | 'seo' | 'whois' | 'security' | 'enterprise' | 'lifestyle' | 'traffic' | 'other'
- **分类映射**:
  - 全部: all
  - SEO指标: seo
  - whois/备案: whois
  - 安全检测: security
  - 企业工商: enterprise
  - 生活服务: lifestyle
  - 交通地理: traffic
  - 其他事务: other

#### 变更2：增加智点消耗字段
- **新增**: `points` 字段到 `PlatformMCPService` 接口
- **格式**: 数字，表示每次调用消耗的智点
- **显示**: "{points}智点/次"

### 2.2 MCP中心页面调整 (`mcp-center.tsx`)

#### 变更3：搜索框下方增加分类Tabs
- **位置**: 搜索框下方
- **组件**: Tabs 或 Button Group
- **选项**: 全部，SEO指标，whois/备案，安全检测，企业工商，生活服务，交通地理，其他事务
- **功能**: 点击后过滤对应分类的MCP服务
- **过滤逻辑**: 同时支持搜索关键词和分类筛选

#### 变更4：MCP服务卡片调整
- **新增显示**: 消耗智点（如：5智点/次）
- **新增按钮**: "详情"按钮
- **我的MCP卡片删除**:
  - 删除"启用开关"
  - 删除"编辑MCP服务"按钮
- **MCP市场卡片保留**: "添加"按钮（状态变为"已添加"后显示Badge）

#### 变更5：删除快速配置弹窗
- **删除**: `mcp-config-modal.tsx` 不再使用
- **新流程**: MCP市场点击"添加"→卡片状态变为"已添加"→全局提示

#### 变更6：Toast提示调整
- **添加成功**: "MCP服务已添加，可到个人中心-我的MCP查看"
- **删除成功**: "MCP服务已删除，可到个人中心-MCP市场重新添加"

### 2.3 新增MCP服务详情弹窗 (`mcp-service-detail-modal.tsx`)

#### 变更7：创建详情弹窗组件
- **触发**: 点击卡片"详情"按钮
- **窗口内容**:
  - **基本信息区域**:
    - 服务icon
    - 服务名称
    - 服务英文名
    - 服务介绍
    - 消耗智点（N智点/次）
  - **请求/返回参数信息区域**:
    - 介绍文本（使用现有的description字段）
  - **底部按钮**:
    - MCP市场：显示"添加MCP"按钮（如未添加）
    - 我的MCP：不显示添加按钮

#### 变更8：Context状态管理
- **新增**: `showDetailModal`, `detailService`, `setShowDetailModal`, `setDetailService`

## 三、文件变更清单

| 文件 | 变更类型 | 变更说明 |
|------|----------|----------|
| `lib/mcp-data.ts` | 修改 | 增加category和points字段 |
| `contexts/mcp-context.tsx` | 修改 | 新增详情弹窗状态管理 |
| `components/workspace/mcp-center.tsx` | 修改 | 分类Tabs、卡片调整、删除配置弹窗调用 |
| `components/workspace/mcp-service-detail-modal.tsx` | 新增 | 详情弹窗组件 |
| `components/workspace/mcp-config-modal.tsx` | 删除 | 不再使用 |

## 四、实现细节

### 4.1 分类Tabs组件

```tsx
const categories = [
  { id: 'all', name: '全部' },
  { id: 'seo', name: 'SEO指标' },
  { id: 'whois', name: 'whois/备案' },
  { id: 'security', name: '安全检测' },
  { id: 'enterprise', name: '企业工商' },
  { id: 'lifestyle', name: '生活服务' },
  { id: 'traffic', name: '交通地理' },
  { id: 'other', name: '其他事务' },
]
```

### 4.2 过滤逻辑

```tsx
const filteredServices = useMemo(() => {
  let result = activeTab === 'my' ? userMCPServices : platformMCPServices
  
  // 分类过滤
  if (selectedCategory !== 'all') {
    result = result.filter(s => s.category === selectedCategory)
  }
  
  // 搜索过滤
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    result = result.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.englishName.toLowerCase().includes(query)
    )
  }
  
  return result
}, [activeTab, selectedCategory, searchQuery, userMCPServices])
```

### 4.3 卡片布局

```tsx
<Card>
  <CardContent>
    <div className="flex items-start gap-3">
      <div className="icon">{service.icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span>{service.name}</span>
          <span>{service.englishName}</span>
        </div>
        <p>{service.description}</p>
        <div className="flex items-center justify-between">
          <span>{service.points}智点/次</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">详情</Button>
            {/* 我的MCP：删除开关和编辑 */}
            {/* MCP市场：添加按钮或已添加Badge */}
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

## 五、验证步骤

1. **分类筛选**:
   - 点击各分类Tabs，正确过滤对应分类的服务
   - 分类+搜索组合过滤正常

2. **智点显示**:
   - 卡片显示"N智点/次"
   - 详情弹窗显示智点消耗

3. **详情弹窗**:
   - 点击"详情"正确打开弹窗
   - 显示icon、名称、英文名、介绍、智点
   - 显示参数信息（description）
   - MCP市场显示"添加MCP"按钮

4. **添加流程**:
   - MCP市场点击"添加"→状态变为"已添加"
   - 显示Toast："MCP服务已添加，可到个人中心-我的MCP查看"
   - 不再弹出配置窗口

5. **删除流程**:
   - 删除后显示Toast："MCP服务已删除，可到个人中心-MCP市场重新添加"

6. **我的MCP卡片**:
   - 不显示启用开关
   - 不显示编辑按钮
   - 显示详情按钮
