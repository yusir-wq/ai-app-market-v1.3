'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { mockAgents, agentCategories, AgentCategory } from '@/lib/mock-data'
import * as LucideIcons from 'lucide-react'
import { Search, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentHomeViewProps {
  onSelectAgent: (agentId: string) => void
}

export function AgentHomeView({ onSelectAgent }: AgentHomeViewProps) {
  const [activeCategory, setActiveCategory] = useState<AgentCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAgents = mockAgents.filter((agent) => {
    const matchCategory = activeCategory === 'all' || agent.category === activeCategory
    const matchSearch =
      !searchQuery ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="flex flex-col w-full max-w-[1280px] mx-auto px-3 md:px-4 pt-6 pb-10">
          {/* 头部 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">AI智能体广场</h1>
              <p className="text-sm text-muted-foreground mt-1">
                选择智能体，一键处理音视频、文案、图片
              </p>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索智能体..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className="shrink-0"
            >
              全部
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0">
                {mockAgents.length}
              </Badge>
            </Button>
            {agentCategories.map((cat) => {
              const CatIcon = (LucideIcons as any)[cat.icon] || LucideIcons.Circle
              const count = mockAgents.filter((a) => a.category === cat.id).length
              return (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="shrink-0"
                >
                  <CatIcon className="h-3.5 w-3.5 mr-1.5" />
                  {cat.name}
                  <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0">
                    {count}
                  </Badge>
                </Button>
              )
            })}
          </div>

          {/* 智能体卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => {
              const IconComponent =
                (LucideIcons as any)[agent.icon] || LucideIcons.Sparkles
              return (
                <Card
                  key={agent.id}
                  className={cn(
                    'cursor-pointer transition-all duration-200',
                    'hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5'
                  )}
                  onClick={() => onSelectAgent(agent.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-3 px-4 py-2">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0',
                          agent.gradient
                        )}
                      >
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm text-foreground truncate">
                            {agent.name}
                          </h3>
                          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground shrink-0">
                            <Zap className="h-3 w-3" />
                            {agent.costPoints} 智点
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 空状态 */}
          {filteredAgents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                没有找到匹配的智能体，试试其他关键词
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
