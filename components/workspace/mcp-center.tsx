'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'
import { useMCP } from '@/contexts/mcp-context'
import { MCPService, PlatformMCPService, platformMCPServices, categories, MCPCategory } from '@/lib/mcp-data'
import { ArrowLeft, Trash2, Plus, Search, ExternalLink, Pencil } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
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
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MCPCenterProps {
  onBack: () => void
}

// 我的MCP服务卡片组件
function MyMCPServiceCard({
  service,
  onDelete,
  onEdit,
  onToggle,
}: {
  service: MCPService
  onDelete: () => void
  onEdit: () => void
  onToggle: (enabled: boolean) => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium shrink-0">
            {service.icon}
          </div>
          
          {/* 信息 */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* 服务名称 + 英文名称 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{service.name}</span>
              <span className="text-xs text-muted-foreground truncate">{service.englishName}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 启用开关 */}
            <Switch
              checked={service.status === 'enabled'}
              onCheckedChange={onToggle}
              title={service.status === 'enabled' ? '已启用' : '已关闭'}
            />
            {/* 编辑按钮 */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              title="编辑MCP服务"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {/* 删除按钮 */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              title="删除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// MCP市场服务卡片组件
function MCPMarketCard({
  service,
  isAdded,
  onAdd,
}: {
  service: PlatformMCPService
  isAdded: boolean
  onAdd: () => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium shrink-0">
            {service.icon}
          </div>
          
          {/* 信息 */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* 服务名称 + 英文名称 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{service.name}</span>
              <span className="text-xs text-muted-foreground truncate">{service.englishName}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center gap-1 shrink-0">
            {!isAdded ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onAdd}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                添加
              </Button>
            ) : (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                已添加
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MCPCenter({ onBack }: MCPCenterProps) {
  const {
    userMCPServices,
    addService,
    deleteService,
    updateService,
    toggleServiceStatus,
    setEditingService,
    setShowQuickCreateModal,
    setQuickConfigService,
    setShowQuickConfigModal,
    isServiceAdded,
  } = useMCP()
  
  // Tab状态
  const [activeTab, setActiveTab] = useState<'my' | 'market'>('my')
  
  // 分类筛选状态
  const [selectedCategory, setSelectedCategory] = useState<MCPCategory>('all')
  
  // MCP市场搜索
  const [marketSearchQuery, setMarketSearchQuery] = useState('')
  
  // 我的MCP搜索
  const [mySearchQuery, setMySearchQuery] = useState('')
  
  // 删除确认弹窗
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<MCPService | null>(null)
  
  // 过滤MCP市场服务
  const filteredMarketServices = useMemo(() => {
    let result = platformMCPServices
    
    // 分类过滤
    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category === selectedCategory)
    }
    
    // 搜索过滤
    if (marketSearchQuery.trim()) {
      const query = marketSearchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.englishName.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      )
    }
    
    return result
  }, [selectedCategory, marketSearchQuery])
  
  // 过滤我的MCP服务
  const filteredMyServices = useMemo(() => {
    let result = userMCPServices
    
    // 分类过滤（通过englishName匹配平台服务）
    if (selectedCategory !== 'all') {
      result = result.filter(s => {
        const platformService = platformMCPServices.find(p => p.englishName === s.englishName)
        return platformService?.category === selectedCategory
      })
    }
    
    // 搜索过滤
    if (mySearchQuery.trim()) {
      const query = mySearchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.englishName.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      )
    }
    
    return result
  }, [userMCPServices, selectedCategory, mySearchQuery])
  
  // 处理删除确认
  const handleDeleteConfirm = (service: MCPService) => {
    setServiceToDelete(service)
    setDeleteDialogOpen(true)
  }
  
  // 执行删除
  const handleDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete.id)
      toast.success('MCP服务已删除，可到个人中心-MCP市场重新添加')
    }
    setDeleteDialogOpen(false)
    setServiceToDelete(null)
  }
  
  // 处理从市场添加 - 打开快速配置弹窗
  const handleAddFromMarket = (platformService: PlatformMCPService) => {
    setQuickConfigService(platformService)
    setShowQuickConfigModal(true)
  }

  // 处理编辑MCP服务
  const handleEditService = (service: MCPService) => {
    setEditingService(service)
    setShowQuickCreateModal(true)
  }

  // 处理启用/关闭切换
  const handleToggleService = (service: MCPService, enabled: boolean) => {
    toggleServiceStatus(service.id)
    toast.success(`${service.name}已${enabled ? '启用' : '关闭'}`)
  }
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* 头部：返回 + Tabs居中 + 按钮 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {/* 左侧：返回工作台按钮 */}
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            返回工作台
          </Button>
          
          {/* 中间：Tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'my' | 'market')}
            className="max-w-sm mx-auto"
          >
            <TabsList>
              <TabsTrigger value="my">我的MCP</TabsTrigger>
              <TabsTrigger value="market">MCP市场</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* 右侧：服务商入驻 + 企业级MCP定制 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              asChild
            >
              <a
                href="https://www.chinaz.net/partner"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                服务商入驻
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-700 hover:from-amber-100 hover:to-orange-100 hover:text-amber-800"
              asChild
            >
              <a
                href="https://www.chinaz.net/custom"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                企业级MCP定制
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* 内容区域 */}
      <ScrollArea className="flex-1 px-4 py-4">
        {/* 分类Tabs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id as MCPCategory)}
                className={cn(
                  "text-xs",
                  selectedCategory === category.id && "bg-primary text-primary-foreground"
                )}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {activeTab === 'my' ? (
          <>
          {/* 搜索框 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索MCP服务..."
              value={mySearchQuery}
              onChange={(e) => setMySearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* 我的MCP - 一行3列布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMyServices.length > 0 ? (
              filteredMyServices.map((service) => (
                <MyMCPServiceCard
                  key={service.id}
                  service={service}
                  onDelete={() => handleDeleteConfirm(service)}
                  onEdit={() => handleEditService(service)}
                  onToggle={(enabled) => handleToggleService(service, enabled)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">暂无MCP服务</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => setActiveTab('market')}
                >
                  前往MCP市场添加
                </Button>
              </div>
            )}
          </div>
          
          {/* 我的MCP分页组件 */}
          <div className="pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索MCP服务..."
                value={marketSearchQuery}
                onChange={(e) => setMarketSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* 服务列表 - 一行3列布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarketServices.map((service) => (
                <MCPMarketCard
                  key={service.id}
                  service={service}
                  isAdded={isServiceAdded(service.id)}
                  onAdd={() => handleAddFromMarket(service)}
                />
              ))}
            </div>
            
            {filteredMarketServices.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">未找到匹配的MCP服务</p>
              </div>
            )}
            
            {/* 分页组件 */}
            <div className="pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </ScrollArea>
      
      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 &quot;{serviceToDelete?.name}&quot; 服务吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}