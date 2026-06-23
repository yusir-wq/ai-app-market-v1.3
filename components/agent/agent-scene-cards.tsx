'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AgentScene } from '@/lib/mock-data'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentSceneCardsProps {
  scenes: AgentScene[]
}

export function AgentSceneCards({ scenes }: AgentSceneCardsProps) {
  return (
    <div className="w-full mb-6">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">
        🎯 适用场景
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scenes.map((scene, index) => {
          const IconComponent = (LucideIcons as any)[scene.icon] || LucideIcons.Circle
          return (
            <Card
              key={index}
              className={cn(
                'border-border/60 hover:border-primary/30 transition-colors',
                'cursor-default'
              )}
            >
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {scene.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {scene.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
