'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Upload,
  FileVideo,
  X,
  AlertCircle,
  Sparkles,
  Play,
  Pause,
  CheckCircle2,
  Download,
  Eraser,
  Subtitles,
  Droplets,
  GripHorizontal,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'

// ============================================================
// Types
// ============================================================

interface WatermarkRegion {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: 'subtitle' | 'watermark'
}

let regionIdCounter = 0
function nextRegionId() { return `r-${++regionIdCounter}` }

interface VideoWatermarkRemovalExperienceProps {
  agent: Agent
  onStartProcess?: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0, s = bytes
  while (s >= 1024 && i < u.length - 1) { s /= 1024; i++ }
  return `${s.toFixed(i > 0 ? 1 : 0)} ${u[i]}`
}

// ============================================================
// Upload Zone
// ============================================================

function UploadZone({ agent, onFileSelected }: { agent: Agent; onFileSelected: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden">
      <CardContent className="p-0">
        <div onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false) }}
          onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) { setError(undefined); onFileSelected(f) } }}
          className={cn('p-4 text-center transition-all flex flex-col items-center gap-5', 'bg-[#FAFAFC] dark:bg-[#111115]', isDragging && 'bg-primary/5')}>
          <div onClick={() => inputRef.current?.click()}
            className={cn('w-full border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center gap-5',
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent/30')}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Upload className="h-4 w-6 text-primary" /></div>
            <p className="text-sm text-muted-foreground">拖拽本地视频文件到这里</p>
            <Button className="h-8 text-[12px] gap-2 px-8" onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>
              <Upload className="h-4 w-4" />上传文件
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>mp4/mov/avi/mkv等视频格式</span>
              <span className="text-border/60">|</span>
              <span>视频 ≤ 2GB</span>
              <span className="text-border/60">|</span>
              <span>AI智能识别或手动框选</span>
            </div>
          </div>
        </div>
      </CardContent>
      <input ref={inputRef} type="file" accept="video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { setError(undefined); onFileSelected(f) }; e.target.value = '' }} />
      {error && <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm"><AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span></div>}
    </Card>
  )
}

// ============================================================
// Region Selection Editor
// ============================================================

function RegionSelector({
  file, onRegionsChange, regions, drawMode,
}: { file: File; onRegionsChange: (regions: WatermarkRegion[]) => void; regions: WatermarkRegion[]; drawMode: 'subtitle' | 'watermark' | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [resizing, setResizing] = useState<{ regionId: string; corner: string } | null>(null)
  const [dragging, setDragging] = useState<{ regionId: string; startX: number; startY: number; origX: number; origY: number } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const subtitleCount = regions.filter(r => r.type === 'subtitle').length
  const watermarkCount = regions.filter(r => r.type === 'watermark').length

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
      else { videoRef.current.pause(); setIsPlaying(false) }
    }
  }

  const getPos = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (e.clientX - rect.left) / rect.width * 100, y: (e.clientY - rect.top) / rect.height * 100 }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    // Don't draw if clicking on a handle
    if (target.closest('[data-handle]')) return
    if (target.closest('[data-region]')) return
    const pos = getPos(e)
    setIsDrawing(true)
    setStartPos(pos)
    setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (resizing) {
      const pos = getPos(e)
      onRegionsChange(regions.map(r => {
        if (r.id !== resizing.regionId) return r
        if (resizing.corner === 'se') return { ...r, width: Math.max(5, pos.x - r.x), height: Math.max(5, pos.y - r.y) }
        if (resizing.corner === 'sw') { const nw = Math.max(5, r.x + r.width - pos.x); return { ...r, x: pos.x, width: nw, height: Math.max(5, pos.y - r.y) } }
        if (resizing.corner === 'ne') { const nh = Math.max(5, r.y + r.height - pos.y); return { ...r, y: pos.y, height: nh, width: Math.max(5, pos.x - r.x) } }
        if (resizing.corner === 'nw') { const nw = Math.max(5, r.x + r.width - pos.x); const nh = Math.max(5, r.y + r.height - pos.y); return { ...r, x: pos.x, y: pos.y, width: nw, height: nh } }
        return r
      }))
      return
    }
    if (dragging) {
      const pos = getPos(e)
      const dx = pos.x - dragging.startX, dy = pos.y - dragging.startY
      onRegionsChange(regions.map(r => r.id === dragging.regionId ? { ...r, x: dragging.origX + dx, y: dragging.origY + dy } : r))
      return
    }
    if (!isDrawing || !startPos) return
    const pos = getPos(e)
    setCurrentRect({ x: Math.min(startPos.x, pos.x), y: Math.min(startPos.y, pos.y), width: Math.abs(pos.x - startPos.x), height: Math.abs(pos.y - startPos.y) })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDrawing && currentRect && currentRect.width > 2 && currentRect.height > 2) {
      if (drawMode) {
        const maxReached = drawMode === 'subtitle' ? subtitleCount >= 5 : watermarkCount >= 5
        if (!maxReached) {
          onRegionsChange([...regions, { id: nextRegionId(), ...currentRect, type: drawMode }])
        }
      }
    }
    setIsDrawing(false)
    setStartPos(null)
    setCurrentRect(null)
    setResizing(null)
    setDragging(null)
  }

  const handleResizeStart = (regionId: string, corner: string) => (e: React.MouseEvent) => {
    e.stopPropagation()
    setResizing({ regionId, corner })
  }

  const handleDragStart = (regionId: string, origX: number, origY: number) => (e: React.MouseEvent) => {
    e.stopPropagation()
    const pos = getPos(e)
    setDragging({ regionId, startX: pos.x, startY: pos.y, origX, origY })
  }

  const removeRegion = (id: string) => { onRegionsChange(regions.filter(r => r.id !== id)) }

  const typeLabel = (t: string) => t === 'subtitle' ? '字幕' : '水印'
  const typeColor = (t: string) => t === 'subtitle' ? 'border-blue-400 bg-blue-400/10' : 'border-orange-400 bg-orange-400/10'
  const typeBadgeColor = (t: string) => t === 'subtitle' ? 'bg-blue-500' : 'bg-orange-500'

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden select-none w-full aspect-video"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsDrawing(false); setStartPos(null); setCurrentRect(null); setResizing(null); setDragging(null) }}
        style={{ cursor: drawMode ? 'crosshair' : 'default' }}
      >
        <video ref={videoRef} src={URL.createObjectURL(file)} className="w-full h-full object-contain pointer-events-none"
          onEnded={() => setIsPlaying(false)} />

        {/* Saved regions */}
        {regions.map((r) => (
          <div key={r.id} data-region
            className={cn('absolute border-2 border-dashed', typeColor(r.type))}
            style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.width}%`, height: `${r.height}%` }}>
            {/* Region label */}
            <span className={cn('absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full text-[10px] text-white px-2 py-0.5 rounded whitespace-nowrap', typeBadgeColor(r.type))}>
              {typeLabel(r.type)}
            </span>
            {/* Delete button */}
            <button data-handle
              className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 z-20"
              onClick={e => { e.stopPropagation(); removeRegion(r.id) }}
            >×</button>
            {/* Drag handle */}
            <button data-handle
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center opacity-0 hover:opacity-100 z-10"
              onMouseDown={handleDragStart(r.id, r.x, r.y)}
            ><GripHorizontal className="h-3 w-3 text-white" /></button>
            {/* Resize corners */}
            {['nw', 'ne', 'sw', 'se'].map(corner => (
              <div key={corner} data-handle
                className={cn('absolute w-3 h-3 bg-white border border-border/40 rounded-full z-10',
                  corner === 'nw' && '-top-1 -left-1 cursor-nw-resize',
                  corner === 'ne' && '-top-1 -right-1 cursor-ne-resize',
                  corner === 'sw' && '-bottom-1 -left-1 cursor-sw-resize',
                  corner === 'se' && '-bottom-1 -right-1 cursor-se-resize',
                )}
                onMouseDown={handleResizeStart(r.id, corner)}
              />
            ))}
          </div>
        ))}

        {/* Drawing rect */}
        {currentRect && drawMode && (
          <div className={cn('absolute border-2 border-dashed border-yellow-400 bg-yellow-400/10', typeColor(drawMode))}
            style={{ left: `${currentRect.x}%`, top: `${currentRect.y}%`, width: `${currentRect.width}%`, height: `${currentRect.height}%` }} />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-foreground" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <span className="text-[11px] text-muted-foreground/50">
            {drawMode ? `在视频上拖拽框选${typeLabel(drawMode)}区域` : '请先在右侧选择去除类型'}
          </span>
        </div>
        {regions.length > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-[11px] text-red-500 hover:text-red-600" onClick={() => onRegionsChange([])}>
            清除全部
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Editor Page (左右布局)
// ============================================================

function EditorPage({
  agent, file, onBack, onFileChange, onProcess,
}: { agent: Agent; file: File; onBack: () => void; onFileChange: (f: File) => void; onProcess: (params: Record<string, any>) => void }) {
  const [regions, setRegions] = useState<WatermarkRegion[]>([])
  const [fillMode, setFillMode] = useState('ai-inpaint')
  const [drawMode, setDrawMode] = useState<'subtitle' | 'watermark' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const subtitleCount = regions.filter(r => r.type === 'subtitle').length
  const watermarkCount = regions.filter(r => r.type === 'watermark').length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT: Video preview with region selection */}
      <div className="flex flex-col gap-3">
        <RegionSelector file={file} regions={regions} onRegionsChange={setRegions} drawMode={drawMode} />
        <div className="flex items-center gap-2 px-1 justify-between">
          <div className="flex items-center gap-2">
            <FileVideo className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => inputRef.current?.click()}>
              <Upload className="h-3 w-3" />替换
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onBack}><X className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
        <input ref={inputRef} type="file" accept="video/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange(f); e.target.value = '' }} />
      </div>

      {/* RIGHT: Config Panel */}
      <div className="flex flex-col gap-4">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0">
          <CardContent className="p-4 space-y-4">
            {/* 去除类型 */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">去除类型</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDrawMode(drawMode === 'subtitle' ? null : 'subtitle')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-[13px] font-medium transition-all',
                    drawMode === 'subtitle'
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-400/30'
                      : 'border-border/30 bg-white dark:bg-[#1A1A1E] text-muted-foreground hover:border-blue-400/30'
                  )}
                >
                  <Subtitles className="h-3.5 w-3.5" />
                  去字幕
                  <span className="text-[10px] ml-1 opacity-60">{subtitleCount}/5</span>
                </button>
                <button
                  onClick={() => setDrawMode(drawMode === 'watermark' ? null : 'watermark')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-[13px] font-medium transition-all',
                    drawMode === 'watermark'
                      ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 ring-1 ring-orange-400/30'
                      : 'border-border/30 bg-white dark:bg-[#1A1A1E] text-muted-foreground hover:border-orange-400/30'
                  )}
                >
                  <Droplets className="h-3.5 w-3.5" />
                  去水印
                  <span className="text-[10px] ml-1 opacity-60">{watermarkCount}/5</span>
                </button>
              </div>
            </div>

            {/* 填充方式 */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">填充方式</span>
              <div className="space-y-1.5">
                <label className={cn('flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all',
                  fillMode === 'ai-inpaint' ? 'border-primary/30 bg-white dark:bg-[#1A1A1E] ring-1 ring-primary/20' : 'border-border/30 bg-white dark:bg-[#1A1A1E] hover:border-primary/20')}>
                  <input type="radio" name="fillMode" className="sr-only" checked={fillMode === 'ai-inpaint'} onChange={() => setFillMode('ai-inpaint')} />
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center"><Sparkles className="h-4 w-4 text-primary" /></div>
                  <div><p className="text-[13px] font-medium text-foreground">AI智能填充</p><p className="text-[11px] text-muted-foreground/60">AI自动分析画面补全移除区域</p></div>
                </label>
                <label className={cn('flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all',
                  fillMode === 'blur' ? 'border-primary/30 bg-white dark:bg-[#1A1A1E] ring-1 ring-primary/20' : 'border-border/30 bg-white dark:bg-[#1A1A1E] hover:border-primary/20')}>
                  <input type="radio" name="fillMode" className="sr-only" checked={fillMode === 'blur'} onChange={() => setFillMode('blur')} />
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Droplets className="h-4 w-4 text-muted-foreground" /></div>
                  <div><p className="text-[13px] font-medium text-foreground">模糊处理</p><p className="text-[11px] text-muted-foreground/60">高斯模糊覆盖目标区域</p></div>
                </label>
              </div>
            </div>

            {/* 选区概况 */}
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-muted-foreground/60">已选区域</span>
                <span className="text-xs font-medium text-foreground">{regions.length} 个框选区</span>
              </div>
              {regions.length === 0 && (
                <p className="text-[11px] text-muted-foreground/50">在视频画面上拖拽框选需去除的区域</p>
              )}
              {regions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {regions.map(r => (
                    <span key={r.id} className={cn('text-[10px] px-1.5 py-0.5 rounded', r.type === 'subtitle' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300')}>
                      {r.type === 'subtitle' ? '字幕' : '水印'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-10 text-sm gap-2" onClick={() => onProcess({ regions, fillMode })}>
          <Eraser className="h-4 w-4" />开始去水印<span className="text-xs font-normal opacity-70 ml-1">{agent.costPoints} 智点</span>
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Loading State
// ============================================================

function LoadingState({ progress, currentStep }: { progress: number; currentStep: number }) {
  const steps = [
    "上传成功!可在历史任务中查看结果",
    "正在分析视频画面，定位目标区域",
    "AI正在智能填充并渲染帧画面",
    "正在进行最后的细节优化与合成",
  ]
  return (
    <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">{progress}%</div>
          </div>
          <div><p className="text-lg font-semibold text-foreground">预计共需1分钟，内容即将呈现</p>
            <p className="text-sm text-muted-foreground mt-1">AI正在去除水印并渲染视频</p></div>
          <div className="w-full max-w-md"><div className="w-full bg-secondary rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} /></div></div>
          <div className="space-y-3 w-full max-w-md">
            {steps.map((step, i) => (
              <div key={i} className={cn('flex items-center gap-3 p-3 rounded-lg', i <= currentStep ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50')}>
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium', i <= currentStep ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>{i + 1}</div>
                <span className={cn('text-sm', i <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground')}>{step}</span>
                {i < currentStep && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Result Page
// ============================================================

function ResultPage({ agent, src, fileName, onBack, params }: {
  agent: Agent; src: string; fileName: string; onBack: () => void; params: Record<string, any>
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after')

  const ft = (t: number) => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` }
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
      else { videoRef.current.pause(); setIsPlaying(false) }
    }
  }
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value); setCurrentTime(t)
    if (videoRef.current) videoRef.current.currentTime = t
  }

  const fillModeLabel = params.fillMode === 'ai-inpaint' ? 'AI智能填充' : '模糊处理'
  const regionCount = params.regions?.length || 0

  return (
    <div className="space-y-4">
      {/* Result Video */}
      <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden">
        <div className="relative bg-black">
          <div className="absolute top-3 right-3 z-10 flex rounded-lg bg-black/50 p-0.5 gap-0.5">
            <button onClick={() => setViewMode('before')}
              className={cn('px-3 py-1 rounded-md text-[11px] font-medium transition-all',
                viewMode === 'before' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80')}>处理前</button>
            <button onClick={() => setViewMode('after')}
              className={cn('px-3 py-1 rounded-md text-[11px] font-medium transition-all',
                viewMode === 'after' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80')}>处理后</button>
          </div>
          <video ref={videoRef} src={src} className="w-full aspect-video"
            onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
            onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
            onEnded={() => setIsPlaying(false)} />
          {viewMode === 'after' && (
            <div className="absolute top-3 left-3 bg-green-600 text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
              <Eraser className="h-3 w-3" /> 已去除
            </div>
          )}
        </div>
        <div className="p-3 space-y-2 border-t border-border/40 bg-[#F8F9FB] dark:bg-[#131418]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground/50 w-10">{ft(currentTime)}</span>
            <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
              className="flex-1 h-1.5 bg-muted/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            <span className="text-[11px] text-muted-foreground/50 w-10 text-right">{duration ? ft(duration) : '00:00'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-foreground" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <a href={src} download={`clean_${fileName}`}>
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 rounded-md">
                <Download className="h-3 w-3" />下载去水印视频
              </Button>
            </a>
          </div>
        </div>
      </Card>
      <div className="flex items-center gap-2 px-1">
        <FileVideo className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">clean_{fileName}</span>
      </div>

      <Button variant="outline" className="w-full" onClick={onBack}>返回重新框选</Button>
    </div>
  )
}

// ============================================================
// Main
// ============================================================

export function VideoWatermarkRemovalExperienceArea({ agent, onStartProcess }: VideoWatermarkRemovalExperienceProps) {
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<'upload' | 'edit' | 'loading' | 'result'>('upload')
  const [lastParams, setLastParams] = useState<Record<string, any>>({})
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const handleProcess = (params: Record<string, any>) => {
    setLastParams(params)
    setPhase('loading')
    setProgress(0); setCurrentStep(0)
    if (onStartProcess) onStartProcess()

    const interval = setInterval(() => {
      setProgress(prev => {
        const np = prev + 10
        if (np >= 100) { clearInterval(interval); setTimeout(() => setPhase('result'), 500); return 100 }
        if (np >= 25 && currentStep < 1) setCurrentStep(1)
        else if (np >= 50 && currentStep < 2) setCurrentStep(2)
        else if (np >= 75 && currentStep < 3) setCurrentStep(3)
        return np
      })
    }, 300)
  }

  if (phase === 'result' && file) return <ResultPage agent={agent} src={URL.createObjectURL(file)} fileName={file.name} onBack={() => setPhase('edit')} params={lastParams} />
  if (phase === 'loading') return <LoadingState progress={progress} currentStep={currentStep} />
  if (phase === 'edit' && file) return <EditorPage agent={agent} file={file} onBack={() => { setFile(null); setPhase('upload') }} onFileChange={setFile} onProcess={handleProcess} />
  return <UploadZone agent={agent} onFileSelected={f => { setFile(f); setPhase('edit') }} />
}
