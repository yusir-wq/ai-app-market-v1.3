'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMCP } from '@/contexts/mcp-context'
import { toast } from 'sonner'

export function MCPServiceDetailModal() {
  const {
    showDetailModal,
    setShowDetailModal,
    detailService,
    addService,
    isServiceAdded,
  } = useMCP()

  if (!detailService) return null

  const isAdded = isServiceAdded(detailService.id)

  const handleAdd = () => {
    if (isAdded) return

    // 创建新服务
    const newService = {
      id: `user-${detailService.id}-${Date.now()}`,
      name: detailService.name,
      englishName: detailService.englishName,
      description: detailService.description,
      icon: detailService.icon,
      type: 'HTTP' as const,
      provider: detailService.provider,
      status: 'enabled' as const,
      config: {
        url: detailService.defaultUrl,
        headers: { 'Content-Type': 'application/json' },
        timeout: 60,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    addService(newService)
    toast.success('MCP服务已添加，可到个人中心-我的MCP查看')
    setShowDetailModal(false)
  }

  return (
    <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>MCP服务详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基本信息 */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
              {detailService.icon}
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-lg font-semibold">{detailService.name}</h3>
                <p className="text-sm text-muted-foreground">{detailService.englishName}</p>
              </div>
              <p className="text-sm text-muted-foreground">{detailService.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{detailService.points}智点/次</Badge>
              </div>
            </div>
          </div>

          {/* 请求/返回参数信息 */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium">请求/返回参数信息</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {detailService.description}
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDetailModal(false)}>
            关闭
          </Button>
          {!isAdded && (
            <Button onClick={handleAdd}>
              添加MCP
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
