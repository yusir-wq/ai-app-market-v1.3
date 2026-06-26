'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload,
  FileVideo,
  X,
  AlertCircle,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  Download,
  Eraser,
  CropIcon,
  Target,
  Wand2,
  Image,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'

// ============================================================
// Types
// ============================================================

interface WatermarkRegion {
  x: number
  y: number
  width: number
  height: number
}

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
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false) }}
          onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) { setError(undefined); onFileSelected(f) } }}
          className={cn('p-4 text-center transition-all flex flex-col items-center gap-5', 'bg-secondary/20', isDragging && 'bg-primary/5')}>
          <div onClick={() => inputRef.current?.click()}
            className={cn('w-full border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center gap-5',
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent/30')}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><Upload className="h-6 w-6 text-primary" /></div>
            <p className="text-sm text-muted-foreground">拖拽本地视频文件到这里</p>
            <Button className="h-11 gap-2 px-8" onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>
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
  file, onRegionsChange, regions,
}: { file: File; onRegionsChange: (regions: WatermarkRegion[]) => void; regions: WatermarkRegion[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
      else { videoRef.current.pause(); setIsPlaying(false) }
    }
  }

  const getPos = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    const pos = getPos(e)
    setIsDrawing(true)
    setStartPos(pos)
    setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos) return
    const pos = getPos(e)
    setCurrentRect({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !currentRect) return
    setIsDrawing(false)
    if (currentRect.width > 10 && currentRect.height > 10) {
      onRegionsChange([...regions, currentRect])
    }
    setStartPos(null)
    setCurrentRect(null)
  }

  const removeRegion = (index: number) => {
    onRegionsChange(regions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden cursor-crosshair select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsDrawing(false); setStartPos(null); setCurrentRect(null) }}
      >
        <video ref={videoRef} src={URL.createObjectURL(file)} className="w-full aspect-video pointer-events-none"
          onEnded={() => setIsPlaying(false)} />

        {/* Saved regions */}
        {regions.map((r, i) => (
          <div key={i} className="absolute border-2 border-red-500 bg-red-500/10"
            style={{ left: r.x, top: r.y, width: r.width, height: r.height }}>
            <button
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] hover:bg-red-600"
              onClick={e => { e.stopPropagation(); removeRegion(i) }}
            >
              ×
            </button>
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full text-[10px] text-white bg-red-500 px-1.5 py-0.5 rounded whitespace-nowrap">
              框选区 {i + 1}
            </span>
          </div>
        ))}

        {/* Drawing rect */}
        {currentRect && (
          <div className="absolute border-2 border-yellow-400 bg-yellow-400/10"
            style={{ left: currentRect.x, top: currentRect.y, width: currentRect.width, height: currentRect.height }} />
        )}
      </div>

      {/* Video controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Target className="h-3 w-3" />
            拖拽框选水印/字幕区域（可多选）
          </div>
          {regions.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-[11px] text-destructive hover:text-destructive" onClick={() => onRegionsChange([])}>
              清除全部
            </Button>
          )}
        </div>
      </div>

      {/* Region info */}
      {regions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {regions.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-red-500/10 text-red-600 px-2 py-1 rounded text-[11px] font-medium">
              <Eraser className="h-3 w-3" />框选区 {i + 1}: {Math.round(r.width)}×{Math.round(r.height)}
            </div>
          ))}
        </div>
      )}
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
  const [removalMode, setRemovalMode] = useState('smart')
  const [fillMode, setFillMode] = useState('ai-inpaint')
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [volume, setVolume] = useState(1)

  const ft = (t: number) => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT: Video preview with region selection */}
      <div className="flex flex-col gap-3">
        <RegionSelector file={file} regions={regions} onRegionsChange={setRegions} />
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
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 space-y-4">
            {/* 去除模式 */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">去除模式</Label>
              <div className="flex rounded-lg bg-secondary/50 p-1 gap-1">
                <button onClick={() => setRemovalMode('smart')}
                  className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
                    removalMode === 'smart' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                  <Wand2 className="h-3.5 w-3.5" />智能识别
                </button>
                <button onClick={() => setRemovalMode('manual')}
                  className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
                    removalMode === 'manual' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                  <Target className="h-3.5 w-3.5" />手动框选
                </button>
              </div>
            </div>

            {/* 填充方式 */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">填充方式</Label>
              <div className="space-y-2">
                <label className={cn('flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  fillMode === 'ai-inpaint' ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/25' : 'border-border/50 hover:border-primary/20')}>
                  <input type="radio" name="fillMode" className="sr-only" checked={fillMode === 'ai-inpaint'} onChange={() => setFillMode('ai-inpaint')} />
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center"><Sparkles className="h-4 w-4 text-primary" /></div>
                  <div><p className="text-sm font-medium text-foreground">AI智能填充</p><p className="text-xs text-muted-foreground">AI自动分析画面补全移除区域</p></div>
                </label>
                <label className={cn('flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  fillMode === 'blur' ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/25' : 'border-border/50 hover:border-primary/20')}>
                  <input type="radio" name="fillMode" className="sr-only" checked={fillMode === 'blur'} onChange={() => setFillMode('blur')} />
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Image className="h-4 w-4 text-muted-foreground" /></div>
                  <div><p className="text-sm font-medium text-foreground">模糊处理</p><p className="text-xs text-muted-foreground">高斯模糊覆盖目标区域</p></div>
                </label>
                <label className={cn('flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  fillMode === 'solid' ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/25' : 'border-border/50 hover:border-primary/20')}>
                  <input type="radio" name="fillMode" className="sr-only" checked={fillMode === 'solid'} onChange={() => setFillMode('solid')} />
                  <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center"><div className="w-4 h-4 rounded bg-muted-foreground/40" /></div>
                  <div><p className="text-sm font-medium text-foreground">纯色填充</p><p className="text-xs text-muted-foreground">使用纯色块遮挡目标区域</p></div>
                </label>
              </div>
            </div>

            {/* 选区概况 */}
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">已选区域</span>
                <span className="text-[11px] font-medium text-foreground">{regions.length} 个框选区</span>
              </div>
              {regions.length === 0 && (
                <p className="text-[11px] text-muted-foreground">在视频画面上拖拽框选需去除的水印或字幕区域</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-12 text-base gap-2" onClick={() => onProcess({ regions, removalMode, fillMode })}>
          <Eraser className="h-4 w-4" />开始去除水印
        </Button>
        <p className="text-center text-xs text-muted-foreground">预计消耗：{agent.costPoints} 智点 · 预计耗时 {agent.avgProcessTime}</p>
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
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"><Sparkles className="h-6 w-6 text-white" /></div>
              </div>
            </div>
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

  const fillModeLabel = params.fillMode === 'ai-inpaint' ? 'AI智能填充' : params.fillMode === 'blur' ? '模糊处理' : '纯色填充'
  const regionCount = params.regions?.length || 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT: Result Video */}
      <div className="flex flex-col gap-3">
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <div className="relative bg-black">
            {/* Before/After tabs */}
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
            {/* Clean badge */}
            {viewMode === 'after' && (
              <div className="absolute top-3 left-3 bg-green-600 text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
                <Eraser className="h-3 w-3" /> 已去除
              </div>
            )}
          </div>
          {/* Controls */}
          <div className="p-3 space-y-2 border-t border-border/40 bg-secondary/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-10">{ft(currentTime)}</span>
              <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
                className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
              <span className="text-xs text-muted-foreground w-10 text-right">{duration ? ft(duration) : '00:00'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <a href={src} download={`clean_${fileName}`}>
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
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
      </div>

      {/* RIGHT: Result Info */}
      <div className="flex flex-col gap-3">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div><h3 className="text-sm font-semibold text-foreground mb-3">处理详情</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">去除模式</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{params.removalMode === 'smart' ? '智能识别' : '手动框选'}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">填充方式</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{fillModeLabel}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">框选区域</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{regionCount} 个</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">消耗</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{agent.costPoints} 智点</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">处理完成</span>
              </div>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">AI已成功去除指定区域的水印/字幕，视频画面已智能填充修复。</p>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={onBack}>返回重新框选</Button>
      </div>
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
