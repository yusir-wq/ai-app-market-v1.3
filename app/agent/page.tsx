'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Agent, AgentCategory, mockAgents, agentCategories } from '@/lib/mock-data'
import {
  Search,
  Mic,
  Film,
  PenTool,
  Image,
  ArrowRight,
  Zap,
  Clock,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'

export default function AgentListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredAgents = useMemo(() => {
    let agents = mockAgents
    if (selectedCategory !== 'all') {
      agents = agents.filter((a) => a.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      agents = agents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      )
    }
    return agents
  }, [selectedCategory, searchQuery])

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
      <div className="flex flex-col max-w-7xl mx-auto w-full p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            AI智能体广场
          </h1>
          <p className="text-sm text-muted-foreground">
            选择智能体，一键处理音视频、文案、图片
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索智能体..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-9"
              onClick={() => setSelectedCategory('all')}
            >
              全部 {mockAgents.length}
            </Button>
            {agentCategories.map((cat) => {
              const count = mockAgents.filter((a) => a.category === cat.id).length
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  className="h-9"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name} {count}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map((agent) => {
            const IconComponent =
              (LucideIcons as any)[agent.icon] || LucideIcons.Sparkles
            return (
              <Card
                key={agent.id}
                className="border-border/60 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => router.push(`/agent/${agent.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0`}
                    >
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {agent.costPoints} 智点
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {agent.avgProcessTime}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">未找到匹配的智能体</p>
          </div>
        )}
      </div>
    </div>
  )
}
