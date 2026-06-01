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
import { ExternalLink } from 'lucide-react'

// 步骤数据
const steps = [
  {
    number: 1,
    title: '访问chinaz.net官网',
    link: 'https://www.chinaz.net',
    image: '/images/mcp-step1.png',
  },
  {
    number: 2,
    title: '购买MCP API接口服务',
    image: '/images/mcp-step2.png',
  },
  {
    number: 3,
    title: '进入控制台复制APIKey',
    image: '/images/mcp-step3.png',
  },
]

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

  // 处理点击链接
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
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

            {/* 步骤区域 */}
            <div className="space-y-4">
              <Label>配置步骤</Label>
              <div className="grid grid-cols-3 gap-4">
                {steps.map((step) => (
                  <div key={step.number} className="flex flex-col items-center text-center space-y-2">
                    {/* 步骤编号 */}
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {step.number}
                    </div>
                    {/* 步骤标题 */}
                    <div className="text-sm">
                      {step.link ? (
                        <button
                          onClick={() => handleLinkClick(step.link!)}
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {step.title}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground">{step.title}</span>
                      )}
                    </div>
                    {/* 步骤图片 */}
                    <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={step.image}
                        alt={`步骤${step.number}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
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
