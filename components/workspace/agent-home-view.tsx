'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { mockAgents, agentCategories, AgentCategory } from '@/lib/mock-data'
import * as LucideIcons from 'lucide-react'
import { Search, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

// 按 category 分配柔和的图标背景渐变与主题色
const categoryTheme: Record<
  AgentCategory,
  { bg: string; icon: string; badge: string; darkBadge: string }
> = {
  video: {
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30',
    icon: 'from-sky-400/80 to-indigo-400/80 dark:from-sky-500/70 dark:to-indigo-500/70',
    badge: 'bg-sky-50 text-sky-600 border-sky-100',
    darkBadge: 'dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/50',
  },
  audio: {
    bg: 'from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/30',
    icon: 'from-rose-400/80 to-amber-400/80 dark:from-rose-500/70 dark:to-amber-500/70',
    badge: 'bg-amber-50 text-amber-600 border-amber-100',
    darkBadge: 'dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50',
  },
  copywriting: {
    bg: 'from-violet-50 to-fuchsia-50 dark:from-violet-950/40 dark:to-fuchsia-950/30',
    icon: 'from-violet-400/80 to-fuchsia-400/80 dark:from-violet-500/70 dark:to-fuchsia-500/70',
    badge: 'bg-violet-50 text-violet-600 border-violet-100',
    darkBadge: 'dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900/50',
  },
  image: {
    bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30',
    icon: 'from-emerald-400/80 to-teal-400/80 dark:from-emerald-500/70 dark:to-teal-500/70',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    darkBadge: 'dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50',
  },
}

interface AgentHomeViewProps {
  onSelectAgent?: (agentId: string) => void
}

export function AgentHomeView({ onSelectAgent }: AgentHomeViewProps = {}) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<AgentCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAgents = useMemo(() => {
    return mockAgents.filter((agent) => {
      const matchCategory = activeCategory === 'all' || agent.category === activeCategory
      const matchSearch =
        !searchQuery ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [activeCategory, searchQuery])

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="flex flex-col w-full max-w-[1280px] mx-auto px-3 md:px-4 pt-6 pb-10">
          {/* 头部 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">AI智能体广场</h1>
              <p className="text-sm text-muted-foreground mt-1">
                选择智能体，一键处理音视频、文案、图片
              </p>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索智能体..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAgents.map((agent) => {
              const IconComponent =
                (LucideIcons as any)[agent.icon] || LucideIcons.Sparkles
              const theme = categoryTheme[agent.category]

              return (
                <Card
                  key={agent.id}
                  className={cn(
                    'group cursor-pointer overflow-hidden',
                    'bg-gradient-to-br from-white to-slate-50/70 dark:from-card dark:to-slate-950/50',
                    'border-slate-100/80 dark:border-slate-800/60',
                    'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] dark:shadow-none',
                    'backdrop-blur-sm',
                    'transition-all duration-300 ease-out',
                    'hover:-translate-y-1 hover:shadow-md hover:border-primary/20 dark:hover:border-primary/30',
                    '!py-0 !gap-0'
                  )}
                  onClick={() => {
                    if (onSelectAgent) {
                      onSelectAgent(agent.id)
                    } else {
                      router.push(`/agent/${agent.id}`)
                    }
                  }}
                >
                  <CardContent className="!p-0">
                    <div
                      className={cn(
                        'relative flex items-start gap-4 px-5 py-4',
                        'bg-gradient-to-br',
                        theme.bg
                      )}
                    >
                      {/* 装饰光斑 */}
                      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/40 blur-2xl dark:bg-white/5" />

                      {/* 图标 */}
                      <div
                        className={cn(
                          'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center',
                          'rounded-xl bg-gradient-to-br shadow-sm',
                          'transition-transform duration-300 ease-out',
                          'group-hover:scale-110 group-hover:rotate-3',
                          theme.icon
                        )}
                      >
                        <IconComponent className="h-5 w-5 text-white drop-shadow-sm" />
                      </div>

                      {/* 文本内容 */}
                      <div className="relative z-10 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-semibold text-sm text-foreground truncate">
                            {agent.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              'shrink-0 px-1.5 py-0 text-[10px] font-medium leading-none',
                              'border',
                              theme.badge,
                              theme.darkBadge
                            )}
                          >
                            <Zap className="mr-0.5 h-2.5 w-2.5" />
                            {agent.costPoints}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
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
