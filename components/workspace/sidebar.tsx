'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ModelCard } from './model-card'
import { mockModels, type Model, mockAgents, agentCategories, getAgentById } from '@/lib/mock-data'
import { Search, PanelLeftClose, PanelLeft, Clock, Zap, Film, Mic, PenTool, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  selectedModel: Model | null
  onSelectModel: (model: Model) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  activeTab: 'models' | 'agents'
  onTabChange: (tab: 'models' | 'agents') => void
  recentAgents: string[]
  onSelectAgent: (agentId: string) => void
}

type ModelType = 'all' | 'chat' | 'image' | 'video'

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Film,
  audio: Mic,
  copywriting: PenTool,
  image: ImageIcon,
}

export function Sidebar({
  selectedModel,
  onSelectModel,
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onTabChange,
  recentAgents,
  onSelectAgent,
}: SidebarProps) {
  const [modelFilter, setModelFilter] = useState<ModelType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤模型
  const filteredModels = useMemo(() => {
    let models = [...mockModels]

    // 按类型过滤
    if (modelFilter !== 'all') {
      models = models.filter((m) => m.type === modelFilter)
    }

    // 按搜索词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      models = models.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
      )
    }

    // 按添加时间倒序
    return models.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
  }, [modelFilter, searchQuery])

  // 最近使用的智能体数据
  const recentAgentItems = useMemo(() => {
    return recentAgents
      .slice(0, 3)
      .map((id) => getAgentById(id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)
  }, [recentAgents])

  if (isCollapsed) {
    return (
      <div className="w-12 bg-muted/30 border-r border-border flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="mb-4"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[280px] bg-muted/30 border-r border-border flex flex-col h-full">
      {/* 折叠按钮 */}
      <div className="p-3 flex justify-end">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleCollapse}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* 顶部 Tabs */}
      <div className="px-3 pb-3">
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as 'models' | 'agents')}>
          <TabsList className="w-full">
            <TabsTrigger value="models" className="flex-1">模型广场</TabsTrigger>
            <TabsTrigger value="agents" className="flex-1">智能应用</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 模型广场 Tab 内容 */}
      {activeTab === 'models' && (
        <>
          {/* 模型分类 Tabs */}
          <div className="px-3 pb-3">
            <Tabs value={modelFilter} onValueChange={(v) => setModelFilter(v as ModelType)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">全部</TabsTrigger>
                <TabsTrigger value="chat" className="flex-1">聊天</TabsTrigger>
                <TabsTrigger value="image" className="flex-1">图片</TabsTrigger>
                <TabsTrigger value="video" className="flex-1">视频</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 搜索框 */}
          <div className="px-3 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模型..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* 模型列表 */}
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1">
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isSelected={selectedModel?.id === model.id}
                  onClick={() => {
                    onSelectModel(model)
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </>
      )}

      {/* 智能应用 Tab 内容 */}
      {activeTab === 'agents' && (
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-4 pb-2">
            {agentCategories.map((category) => {
              const agents = mockAgents.filter((a) => a.category === category.id)
              const IconComp = categoryIconMap[category.id] || Zap
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-1.5 px-1 py-2">
                    <IconComp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {category.name}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => onSelectAgent(agent.id)}
                        className={cn(
                          'w-full text-left rounded-lg border border-border bg-card p-3 transition-colors',
                          'hover:bg-accent hover:border-accent'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* 渐变图标 */}
                          <div
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br',
                              agent.gradient
                            )}
                          >
                            <Zap className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium truncate">
                                {agent.name}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {agent.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                <Zap className="h-3 w-3 mr-0.5" />
                                {agent.costPoints}智点
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {agent.avgProcessTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {/* 最近使用区域（两个Tab都显示） */}
      {recentAgentItems.length > 0 && (
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">最近使用</span>
          </div>
          <div className="space-y-1.5">
            {recentAgentItems.map((agent) => (
              <button
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={cn(
                  'w-full text-left rounded-md border border-border/50 bg-background/50 p-2 transition-colors',
                  'hover:bg-accent hover:border-accent'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br',
                      agent.gradient
                    )}
                  >
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium truncate block">
                      {agent.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      {agent.avgProcessTime} · {agent.costPoints}智点
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
