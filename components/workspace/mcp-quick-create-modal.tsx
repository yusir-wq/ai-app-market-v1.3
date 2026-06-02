'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { useMCP } from '@/contexts/mcp-context'
import { MCPService, serviceTypeFullLabels } from '@/lib/mcp-data'


// 请求头项类型
interface HeaderItem {
  key: string
  value: string
  isMasked?: boolean
}

export function MCPQuickCreateModal() {
  const {
    showQuickCreateModal,
    setShowQuickCreateModal,
    editingService,
    setEditingService,
    updateService,
  } = useMCP()

  // 表单状态
  const [serviceName, setServiceName] = useState('')
  const [headerItems, setHeaderItems] = useState<HeaderItem[]>([])
  const [timeout, setTimeoutValue] = useState(60)

  // 只处理编辑模式（从市场添加由 MCPConfigModal 处理）
  const isEditing = showQuickCreateModal && editingService

  // 获取只读字段数据
  const readOnlyData = isEditing ? editingService : null

  // 初始化表单
  useEffect(() => {
    if (isEditing && editingService) {
      setServiceName(editingService.name)
      // 将headers对象转换为数组形式
      const headers = editingService.config.headers || {}
      const items: HeaderItem[] = Object.entries(headers).map(([key, value]) => ({
        key,
        value: String(value),
        isMasked: key.toLowerCase() === 'authorization',
      }))
      setHeaderItems(items.length > 0 ? items : [{ key: 'Authorization', value: 'Bearer token123', isMasked: true }])
      setTimeoutValue(editingService.config.timeout || 60)
    } else {
      // 重置表单
      setServiceName('')
      setHeaderItems([])
      setTimeoutValue(60)
    }
  }, [isEditing, editingService])

  // 添加请求头
  const addHeader = () => {
    setHeaderItems([...headerItems, { key: 'Authorization', value: 'Bearer token123', isMasked: true }])
  }

  // 更新请求头
  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newItems = [...headerItems]
    newItems[index][field] = value
    setHeaderItems(newItems)
  }

  // 删除请求头
  const removeHeader = (index: number) => {
    setHeaderItems(headerItems.filter((_, i) => i !== index))
  }

  // 掩码显示值 - 使用固定掩码
  const maskValue = (value: string) => {
    // 对于Authorization类型的值，使用固定的掩码格式
    if (value.includes('Bearer')) {
      return 'Be*************************************************************************************7a'
    }
    if (value.length <= 2) return value
    return value.substring(0, 2) + '*'.repeat(Math.min(value.length - 2, 30))
  }

  // 处理保存
  const handleSave = () => {
    // 将数组转换为对象
    const headers: Record<string, string> = {}
    headerItems.forEach(item => {
      if (item.key.trim()) {
        headers[item.key.trim()] = item.value
      }
    })

    if (isEditing && editingService) {
      // 更新现有服务
      updateService(editingService.id, {
        name: serviceName,
        config: {
          ...editingService.config,
          headers,
          timeout,
        },
      })
      setEditingService(null)
      setShowQuickCreateModal(false)
    }
  }

  // 处理关闭
  const handleClose = () => {
    setEditingService(null)
    setShowQuickCreateModal(false)
  }

  // 弹窗标题
  const dialogTitle = '编辑MCP服务'

  return (
    <Dialog open={showQuickCreateModal} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
        {/* 固定标题 */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {/* 可滚动表单区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* 1. 服务名称（可编辑） */}
            <div className="space-y-2">
              <Label>服务名称</Label>
              <Input
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="请输入服务名称"
              />
            </div>

            {/* 2. MCP英文名称（只读） */}
            {readOnlyData && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">MCP英文名称</Label>
                <Input
                  value={readOnlyData.englishName}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {/* 3. 服务介绍（只读） */}
            {readOnlyData && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">服务介绍</Label>
                <Textarea
                  value={readOnlyData.description}
                  disabled
                  className="bg-muted resize-none"
                  rows={2}
                />
              </div>
            )}

            {/* 4. 服务类型（只读） */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">服务类型</Label>
              <Input
                value={serviceTypeFullLabels['HTTP']}
                disabled
                className="bg-muted"
              />
            </div>

            {/* 5. URL（只读） */}
            {isEditing && editingService && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">URL</Label>
                <Input
                  value={editingService.config.url || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {/* 6. 请求头（表格形式） */}
            <div className="space-y-2">
              <Label>请求头</Label>
              <p className="text-xs text-muted-foreground">
                发送到 MCP 服务器的额外 HTTP 请求头
              </p>
              <p className="text-xs text-muted-foreground">
                为了安全，请求头值已被掩码处理。修改将更新实际值。
              </p>

              {/* 请求头表格 */}
              <div className="border rounded-md overflow-hidden">
                {/* 表头 */}
                <div className="grid grid-cols-2 gap-2 px-3 py-2 bg-muted text-xs font-medium text-muted-foreground">
                  <div>请求头名称</div>
                  <div>请求头值</div>
                </div>

                {/* 表体 */}
                <div className="divide-y">
                  {headerItems.map((item, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-2 gap-2 px-3 py-2 items-center ${
                        item.key.toLowerCase() === 'authorization' ? 'bg-muted/50' : ''
                      }`}
                    >
                      <Input
                        value={item.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        placeholder="例如：Authorization"
                        className="h-8 text-sm"
                      />
                      <Input
                        value={item.isMasked ? maskValue(item.value) : item.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        placeholder="Bearer token123"
                        className="h-8 text-sm font-mono"
                        onFocus={() => {
                          // 聚焦时显示真实值
                          if (item.isMasked) {
                            const newItems = [...headerItems]
                            newItems[index].isMasked = false
                            setHeaderItems(newItems)
                          }
                        }}
                        onBlur={() => {
                          // 失焦时恢复掩码
                          if (item.key.toLowerCase() === 'authorization') {
                            const newItems = [...headerItems]
                            newItems[index].isMasked = true
                            setHeaderItems(newItems)
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7. 超时时间（秒）（可编辑） */}
            <div className="space-y-2">
              <Label>超时时间（秒）</Label>
              <Input
                type="number"
                value={timeout}
                onChange={(e) => setTimeoutValue(parseInt(e.target.value) || 60)}
                min={1}
                max={600}
              />
            </div>
          </div>
        </div>

        {/* 固定底部按钮 */}
        <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!serviceName.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
