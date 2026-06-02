'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMCP } from '@/contexts/mcp-context'
import { toast } from 'sonner'

export function MCPQuickConfigModal() {
  const {
    showQuickConfigModal,
    setShowQuickConfigModal,
    quickConfigService,
    setQuickConfigService,
    addService,
  } = useMCP()

  const [apiKey, setApiKey] = useState('')

  // 处理关闭
  const handleClose = () => {
    setQuickConfigService(null)
    setApiKey('')
    setShowQuickConfigModal(false)
  }

  // 处理添加
  const handleAdd = () => {
    if (!quickConfigService) return

    // 创建新服务
    const newService = {
      id: `user-${quickConfigService.id}-${Date.now()}`,
      name: quickConfigService.name,
      englishName: quickConfigService.englishName,
      description: quickConfigService.description,
      icon: quickConfigService.icon,
      type: 'HTTP' as const,
      provider: quickConfigService.provider,
      status: 'enabled' as const,
      config: {
        url: quickConfigService.defaultUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 60,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    addService(newService)
    toast.success(`${quickConfigService.name}已添加`)
    handleClose()
  }

  if (!quickConfigService) return null

  return (
    <Dialog open={showQuickConfigModal} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* 固定标题 */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>配置MCP服务</DialogTitle>
        </DialogHeader>

        {/* 可滚动内容区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* APIKey输入框 */}
            <div className="space-y-2">
              <Label htmlFor="apikey">APIKey</Label>
              <Input
                id="apikey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入您的APIKey"
              />
            </div>

            {/* 操作演示 */}
            <div className="space-y-2">
              <Label>操作演示</Label>
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:bg-muted/80 transition-colors">
                <div className="text-center px-4">
                  <div className="text-4xl mb-2">▶️</div>
                  <p className="text-sm text-muted-foreground">
                    这是一段自动播放的操作视频教程，支持点击放大查看详情。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 固定底部按钮 */}
        <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleAdd} disabled={!apiKey.trim()}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
