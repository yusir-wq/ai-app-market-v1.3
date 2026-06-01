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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useMCP } from '@/contexts/mcp-context'
import { MCPService, serviceTypeFullLabels } from '@/lib/mcp-data'

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
  const [requestHeaders, setRequestHeaders] = useState('')
  const [longRunning, setLongRunning] = useState(false)
  const [timeout, setTimeoutValue] = useState(60)
  
  // 只处理编辑模式（从市场添加由 MCPConfigModal 处理）
  const isEditing = showQuickCreateModal && editingService
  
  // 获取只读字段数据
  const readOnlyData = isEditing ? editingService : null
  
  // 初始化表单
  useEffect(() => {
    if (isEditing && editingService) {
      setServiceName(editingService.name)
      setRequestHeaders(
        editingService.config.headers
          ? JSON.stringify(editingService.config.headers, null, 2)
          : ''
      )
      setLongRunning(editingService.config.longRunning || false)
      setTimeoutValue(editingService.config.timeout || 60)
    } else {
      // 重置表单
      setServiceName('')
      setRequestHeaders('')
      setLongRunning(false)
      setTimeoutValue(60)
    }
  }, [isEditing, editingService])
  
  // 处理保存
  const handleSave = () => {
    // 解析请求头
    let headers: Record<string, string> = {}
    if (requestHeaders.trim()) {
      try {
        headers = JSON.parse(requestHeaders)
      } catch (e) {
        // 如果解析失败，使用空对象
        headers = {}
      }
    }
    
    if (isEditing && editingService) {
      // 更新现有服务
      updateService(editingService.id, {
        name: serviceName,
        config: {
          ...editingService.config,
          headers,
          longRunning,
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
            
            {/* 6. 请求头（可编辑） */}
            <div className="space-y-2">
              <Label>请求头（JSON格式）</Label>
              <Textarea
                value={requestHeaders}
                onChange={(e) => setRequestHeaders(e.target.value)}
                placeholder='{"Content-Type": "application/json"}'
                className="resize-none font-mono text-sm"
                rows={4}
              />
            </div>
            
            {/* 7. 长时间运行模式（可编辑） */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>长时间运行模式</Label>
                <p className="text-xs text-muted-foreground">
                  适用于需要长时间处理的任务
                </p>
              </div>
              <Switch
                checked={longRunning}
                onCheckedChange={setLongRunning}
              />
            </div>
            
            {/* 8. 超时时间（秒）（可编辑） */}
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