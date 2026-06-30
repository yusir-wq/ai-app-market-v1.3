'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Upload,
  FileVideo,
  X,
  AlertCircle,
  Sparkles,
  Mic2,
  Globe,
  Type,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  Loader2,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'

// ============================================================
// Types
// ============================================================

interface SubtitleEntry {
  id: number
  startTime: string
  endTime: string
  text: string
  translatedText: string
}

export interface VideoSubtitleResult {
  subtitles: SubtitleEntry[]
  videoUrl: string
  fileName: string
  sourceLang: string
  targetLang: string
  subtitleSource: string
}

interface SubtitleStyle {
  font: string
  position: string
  customPosition: number
  color: string
  size: string
  strokeColor: string
  strokeWidth: number
  background: boolean
  bgColor: string
  rounded: boolean
}

const FONT_OPTIONS = [
  { value: 'system', label: '系统默认' },
  { value: 'songti', label: '宋体' },
  { value: 'heiti', label: '黑体' },
  { value: 'kaiti', label: '楷体' },
  { value: 'arial', label: 'Arial' },
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'roboto', label: 'Roboto' },
]

const SIZE_OPTIONS = [
  { value: '12', label: '12px (小)' },
  { value: '14', label: '14px' },
  { value: '16', label: '16px (默认)' },
  { value: '18', label: '18px' },
  { value: '20', label: '20px' },
  { value: '24', label: '24px (大)' },
  { value: '28', label: '28px' },
  { value: '32', label: '32px' },
]

const POSITION_OPTIONS = [
  { value: 'bottom', label: '底部（默认）' },
  { value: 'middle', label: '中间' },
  { value: 'top', label: '顶部' },
  { value: 'custom', label: '自定义位置' },
]

const COLOR_PRESETS = [
  '#FFFFFF', '#FFD700', '#00FF00', '#00BFFF', '#FF6347',
  '#FF69B4', '#9400D3', '#FFA500', '#808080', '#000000',
]

const STROKE_COLOR_PRESETS = [
  '#000000', '#1A1A2E', '#333333', '#666666', '#FFFFFF',
  '#FF0000', '#0000FF', '#00AA00', '#8B4513', '#FFD700',
]

// ============================================================
// Subtitle Style Popover
// ============================================================

function SubtitleStylePopover({
  style, onChange,
}: {
  style: SubtitleStyle
  onChange: (s: SubtitleStyle) => void
}) {
  const [open, setOpen] = useState(false)
  const u = (key: keyof SubtitleStyle, value: any) => onChange({ ...style, [key]: value })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Type className="h-3 w-3" />字幕样式
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-[300px] p-0 shadow-md border border-border/30 bg-white dark:bg-[#1A1A1E]">
        <div className="flex items-center px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
          <span className="w-1.5 h-4 rounded-full bg-rose-400/60 dark:bg-rose-500/60 shrink-0" />
          <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight ml-2">字幕样式设置</h3>
        </div>
        <div className="p-3 space-y-3 max-h-[420px] overflow-y-auto">
          {/* 字幕字体 */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-muted-foreground/60 shrink-0 w-16">字幕字体</span>
            <Select value={style.font} onValueChange={v => u('font', v)}>
              <SelectTrigger className="h-7 text-[12px] flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>{FONT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* 字幕位置 */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-muted-foreground/60 shrink-0 w-16">字幕位置</span>
            <Select value={style.position} onValueChange={v => u('position', v)}>
              <SelectTrigger className="h-7 text-[12px] flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>{POSITION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* 自定义位置滑块 */}
          {style.position === 'custom' && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-muted-foreground/60 shrink-0 w-16">距顶部</span>
              <Slider value={[style.customPosition]} onValueChange={v => u('customPosition', v[0])} min={10} max={90} step={5} className="flex-1" />
              <span className="text-[11px] font-medium tabular-nums text-foreground/70 shrink-0 w-8 text-right">{style.customPosition}%</span>
            </div>
          )}

          {/* 字幕颜色 */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-muted-foreground/60">字幕颜色</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COLOR_PRESETS.map(c => (
                <button key={c} onClick={() => u('color', c)}
                  className={cn('w-6 h-6 rounded-md border-2 transition-all', style.color === c ? 'border-primary scale-110' : 'border-transparent hover:scale-105')}
                  style={{ backgroundColor: c }} />
              ))}
              <div className="relative ml-1">
                <input type="color" value={style.color} onChange={e => u('color', e.target.value)} className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer" />
                <div className="w-6 h-6 rounded-md border-2 border-dashed border-border/50 flex items-center justify-center bg-gradient-to-br from-red-400 via-green-400 to-blue-400" />
              </div>
            </div>
          </div>

          {/* 字幕大小 */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-muted-foreground/60 shrink-0 w-16">字幕大小</span>
            <Select value={style.size} onValueChange={v => u('size', v)}>
              <SelectTrigger className="h-7 text-[12px] flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>{SIZE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* 描边颜色 */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-muted-foreground/60">描边颜色</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {STROKE_COLOR_PRESETS.map(c => (
                <button key={c} onClick={() => u('strokeColor', c)}
                  className={cn('w-6 h-6 rounded-md border-2 transition-all', style.strokeColor === c ? 'border-primary scale-110' : 'border-transparent hover:scale-105')}
                  style={{ backgroundColor: c }} />
              ))}
              <div className="relative ml-1">
                <input type="color" value={style.strokeColor} onChange={e => u('strokeColor', e.target.value)} className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer" />
                <div className="w-6 h-6 rounded-md border-2 border-dashed border-border/50 flex items-center justify-center bg-gradient-to-br from-red-400 via-green-400 to-blue-400" />
              </div>
            </div>
          </div>

          {/* 描边粗细 */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-muted-foreground/60 shrink-0 w-16">描边粗细</span>
            <Slider value={[style.strokeWidth]} onValueChange={v => u('strokeWidth', v[0])} min={0} max={8} step={1} className="flex-1" />
            <span className="text-[11px] font-medium tabular-nums text-foreground/70 shrink-0 w-6 text-right">{style.strokeWidth}px</span>
          </div>

          {/* 字幕背景 */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground/60">字幕背景</span>
            <button role="switch" aria-checked={style.background} onClick={() => u('background', !style.background)}
              className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', style.background ? 'bg-primary' : 'bg-muted-foreground/30')}>
              <span className={cn('pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform', style.background ? 'translate-x-4' : 'translate-x-0')} />
            </button>
          </div>

          {/* 字幕背景颜色 */}
          {style.background && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-muted-foreground/60">背景颜色</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_PRESETS.map(c => (
                  <button key={c} onClick={() => u('bgColor', c)}
                    className={cn('w-6 h-6 rounded-md border-2 transition-all', style.bgColor === c ? 'border-primary scale-110' : 'border-transparent hover:scale-105')}
                    style={{ backgroundColor: c }} />
                ))}
                <div className="relative ml-1">
                  <input type="color" value={style.bgColor} onChange={e => u('bgColor', e.target.value)} className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer" />
                  <div className="w-6 h-6 rounded-md border-2 border-dashed border-border/50 flex items-center justify-center bg-gradient-to-br from-red-400 via-green-400 to-blue-400" />
                </div>
              </div>
            </div>
          )}

          {/* 圆角半透明背景 */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground/60">圆角半透明背景</span>
            <button role="switch" aria-checked={style.rounded} onClick={() => u('rounded', !style.rounded)}
              className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', style.rounded ? 'bg-primary' : 'bg-muted-foreground/30')}>
              <span className={cn('pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform', style.rounded ? 'translate-x-4' : 'translate-x-0')} />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface VideoSubtitleExperienceProps {
  agent: Agent
  onStartProcess?: () => void
  onProcessComplete?: (result: VideoSubtitleResult) => void
}

const LANGUAGES = [
  { value: 'auto', label: '智能识别' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁体中文' },
  { value: 'en', label: '英文' },
  { value: 'ja', label: '日文' },
  { value: 'ko', label: '韩文' },
  { value: 'fr', label: '法语' },
  { value: 'de', label: '德语' },
  { value: 'es', label: '西班牙语' },
  { value: 'pt', label: '葡萄牙语' },
  { value: 'it', label: '意大利语' },
  { value: 'ru', label: '俄语' },
  { value: 'ar', label: '阿拉伯语' },
  { value: 'th', label: '泰语' },
  { value: 'vi', label: '越南语' },
]

const TARGET_LANGUAGES = LANGUAGES.filter(l => l.value !== 'auto')

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++ }
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

// ============================================================
// Upload Zone
// ============================================================

function UploadZone({ agent, onFileSelected }: { agent: Agent; onFileSelected: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]; if (f) { setError(undefined); onFileSelected(f) }
  }, [onFileSelected])
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) { setError(undefined); onFileSelected(f) }; e.target.value = ''
  }, [onFileSelected])

  return (
    <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden">
      <CardContent className="p-0">
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          className={cn('p-4 text-center transition-all flex flex-col items-center gap-5', 'bg-[#FAFAFC] dark:bg-[#111115]', isDragging && 'bg-primary/5')}>
          <div onClick={() => inputRef.current?.click()}
            className={cn('w-full border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center gap-5',
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent/30')}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Upload className="h-4 w-4 text-primary" /></div>
            <p className="text-sm text-muted-foreground">拖拽本地音视频文件到这里</p>
            <Button className="h-8 text-[12px] gap-2 px-8" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
              <Upload className="h-4 w-4" />上传文件
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>mp3/mp4/mov/webm/wav等30种格式</span>
              <span className="text-border/60">|</span><span>视频 ≤ 4GB；音频 ≤ 500M</span>
              <span className="text-border/60">|</span><span>时长 ≤ 5小时</span>
            </div>
          </div>
        </div>
      </CardContent>
      <input ref={inputRef} type="file" accept="video/*,audio/*" className="hidden" onChange={handleFileInput} />
      {error && <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm"><AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span></div>}
    </Card>
  )
}

// ============================================================
// Editor Page (左右布局)
// ============================================================

function EditorPage({
  agent, file, onBack, onFileChange, onGenerate,
}: { agent: Agent; file: File; onBack: () => void; onFileChange: (f: File) => void; onGenerate: (params: Record<string, any>) => void }) {
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('en')
  const [bilingual, setBilingual] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
      else { videoRef.current.pause(); setIsPlaying(false) }
    }
  }
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60), s = Math.floor(t % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value); setCurrentTime(t)
    if (videoRef.current) videoRef.current.currentTime = t
  }
  const changeSpeed = (rate: number) => { setPlaybackRate(rate); if (videoRef.current) videoRef.current.playbackRate = rate }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT: Video Preview */}
      <div className="flex flex-col gap-3">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden flex flex-col">
          <div className="relative bg-black">
            <video ref={videoRef} src={URL.createObjectURL(file)} className="w-full aspect-video"
              onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
              onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
              onEnded={() => setIsPlaying(false)} />
          </div>
          {/* Video controls */}
          <div className="p-3 space-y-2 border-t border-border/40 bg-[#F8F9FB] dark:bg-[#131418]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground/50 w-10">{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
                className="flex-1 h-1.5 bg-muted/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
              <span className="text-[11px] text-muted-foreground/50 w-10 text-right">{duration ? formatTime(duration) : '00:00'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-foreground" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-foreground" onClick={() => setVolume(v => { const nv = v > 0 ? 0 : 1; if (videoRef.current) videoRef.current.volume = nv; return nv })}>
                  {volume > 0 ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                </Button>
                <div className="flex items-center gap-0.5 ml-1">
                  {[0.5, 1, 1.5, 2].map(rate => (
                    <Button key={rate} size="sm" variant={playbackRate === rate ? 'secondary' : 'ghost'}
                      className="h-6 text-[10px] px-1.5" onClick={() => changeSpeed(rate)}>
                      {rate}x
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => inputRef.current?.click()}>
                  <Upload className="h-3 w-3" />替换
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onBack}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
        {/* File name */}
        <div className="flex items-center gap-2 px-1">
          <FileVideo className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
        </div>
        <input ref={inputRef} type="file" accept="video/*,audio/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange(f); e.target.value = '' }} />
      </div>

      {/* RIGHT: Config Panel */}
      <div className="flex flex-col gap-4">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0">
          <CardContent className="p-4 space-y-4">
            {/* 源语言 */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-foreground/70 shrink-0 w-16">源语言</span>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger className="h-8 text-[13px] flex-1 border-border/30 bg-white dark:bg-[#1A1A1E] shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* 目标语言 */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-foreground/70 shrink-0 w-16">目标语言</span>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="h-8 text-[13px] flex-1 border-border/30 bg-white dark:bg-[#1A1A1E] shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent>{TARGET_LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* 双语字幕 */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-foreground/70 shrink-0 w-16">双语字幕</span>
              <button role="switch" aria-checked={bilingual} onClick={() => setBilingual(!bilingual)}
                className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', bilingual ? 'bg-primary' : 'bg-muted-foreground/30')}>
                <span className={cn('pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform', bilingual ? 'translate-x-4' : 'translate-x-0')} />
              </button>
            </div>
          </CardContent>
        </Card>
        {/* 立即生成 */}
        <Button className="w-full h-10 text-sm gap-2" onClick={() => onGenerate({ subtitleSource: 'asr', sourceLang, targetLang: bilingual ? targetLang : '', bilingual })}>
          <Sparkles className="h-4 w-4" />立即生成<span className="text-xs font-normal opacity-70 ml-1">{agent.costPoints} 智点</span>
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
    "上传成功!可在转换记录中查看结果",
    "正在深度解析，智能识别语种与说话人",
    "正在高精度转写，生成时间轴字幕",
    "正在进行最后的细节优化与渲染",
  ]
  return (
    <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">{progress}%</div>
          </div>
          <div><p className="text-lg font-semibold text-foreground">预计共需1分钟，内容即将呈现</p>
            <p className="text-sm text-muted-foreground mt-1">AI正在识别并生成字幕</p></div>
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

function ResultPage({ result, onBack }: { result: VideoSubtitleResult; onBack: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [subtitles, setSubtitles] = useState(result.subtitles)
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    font: 'system', position: 'bottom', customPosition: 70, color: '#FFFFFF',
    size: '16', strokeColor: '#000000', strokeWidth: 2, background: false, bgColor: '#000000', rounded: false,
  })

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
      else { videoRef.current.pause(); setIsPlaying(false) }
    }
  }
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60), s = Math.floor(t % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value); setCurrentTime(t)
    if (videoRef.current) videoRef.current.currentTime = t
  }
  const startEdit = (s: SubtitleEntry) => { setEditingId(s.id); setEditingText(s.translatedText) }
  const saveEdit = () => {
    setSubtitles(prev => prev.map(s => s.id === editingId ? { ...s, translatedText: editingText } : s))
    setEditingId(null)
  }
  const deleteSub = (id: number) => { setSubtitles(prev => prev.filter(s => s.id !== id)) }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT: Video with subtitles overlay */}
      <div className="flex flex-col gap-3">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden flex flex-col">
          <div className="relative bg-black">
            <video ref={videoRef} src={result.videoUrl} className="w-full aspect-video"
              onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
              onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
              onEnded={() => setIsPlaying(false)} />
            {/* Subtitle overlay */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
              {(() => {
                const active = subtitles.find(s => {
                  const [sh, sm, ss] = s.startTime.split(':').map(Number)
                  const [eh, em, es] = s.endTime.split(':').map(Number)
                  return currentTime >= sh * 3600 + sm * 60 + ss && currentTime <= eh * 3600 + em * 60 + es
                })
                if (!active) return null
                return (
                  <div className="text-center px-4">
                    <p className="text-white text-sm font-medium drop-shadow-lg bg-black/50 px-3 py-1 rounded">{active.text}</p>
                    <p className="text-yellow-300 text-xs drop-shadow-lg bg-black/50 px-3 py-0.5 rounded mt-0.5">{active.translatedText}</p>
                  </div>
                )
              })()}
            </div>
          </div>
          <div className="p-3 space-y-2 border-t border-border/40 bg-[#F8F9FB] dark:bg-[#131418]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-10">{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
                className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
              <span className="text-xs text-muted-foreground w-10 text-right">{duration ? formatTime(duration) : '00:00'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </Card>
        <div className="flex items-center gap-2 px-1">
          <FileVideo className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{result.fileName}</span>
        </div>
      </div>

      {/* RIGHT: Actions + Subtitles + Export */}
      <div className="flex flex-col gap-4">
        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <SubtitleStylePopover style={subtitleStyle} onChange={setSubtitleStyle} />
          <div className="flex rounded-lg bg-secondary/50 p-0.5 gap-0.5 ml-auto">
            <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 bg-background shadow-sm">原文</Button>
            <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2">译文</Button>
            <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2">双语</Button>
          </div>
        </div>

        {/* Subtitle list */}
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 flex-1">
          <CardContent className="p-4 max-h-[420px] overflow-y-auto">
            <div className="space-y-2">
              {subtitles.map(sub => (
                <div key={sub.id} className="p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{sub.startTime} - {sub.endTime}</span>
                    <div className="flex items-center gap-0.5">
                      {editingId === sub.id ? (
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5 text-emerald-600" onClick={saveEdit}>保存</Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5" onClick={() => startEdit(sub)}>编辑</Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteSub(sub.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{sub.text}</p>
                  {editingId === sub.id ? (
                    <input className="w-full mt-1 text-sm border border-border rounded px-2 py-1 bg-background" value={editingText}
                      onChange={e => setEditingText(e.target.value)} autoFocus />
                  ) : (
                    <p className="text-sm font-medium text-primary">{sub.translatedText}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <Button className="w-full h-11 gap-2">
          <Download className="h-4 w-4" />导出字幕文件（SRT）
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Main
// ============================================================

export function VideoSubtitleExperienceArea({
  agent, onStartProcess, onProcessComplete,
}: VideoSubtitleExperienceProps) {
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<'upload' | 'edit' | 'loading' | 'result'>('upload')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<VideoSubtitleResult | null>(null)

  const handleGenerate = (params: Record<string, any>) => {
    if (!file) return
    setPhase('loading')
    setProgress(0); setCurrentStep(0)

    const interval = setInterval(() => {
      setProgress(prev => {
        const np = prev + 10
        if (np >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            const mockResult: VideoSubtitleResult = {
              subtitles: [
                { id: 1, startTime: '00:00:01', endTime: '00:00:04', text: '大家好，欢迎来到AI字幕生成工具的使用教程。', translatedText: 'Hello everyone, welcome to the tutorial of the AI subtitle generator.' },
                { id: 2, startTime: '00:00:05', endTime: '00:00:09', text: '今天我们将展示如何在几分钟内为视频自动添加字幕。', translatedText: 'Today we will show you how to automatically add subtitles to your video in minutes.' },
                { id: 3, startTime: '00:00:10', endTime: '00:00:14', text: '首先，上传你的视频文件，系统会自动识别语音内容。', translatedText: 'First, upload your video file, and the system will automatically recognize the speech content.' },
                { id: 4, startTime: '00:00:15', endTime: '00:00:19', text: '然后选择你想要的目标语言，系统会生成精准字幕。', translatedText: 'Then select your target language, and the system will generate accurate subtitles.' },
                { id: 5, startTime: '00:00:20', endTime: '00:00:24', text: '你可以在线编辑字幕内容、调整时间轴和样式。', translatedText: 'You can edit subtitle content, adjust the timeline, and customize styles online.' },
              ],
              videoUrl: URL.createObjectURL(file),
              fileName: file.name,
              sourceLang: params.sourceLang,
              targetLang: params.targetLang,
              subtitleSource: params.subtitleSource,
            }
            setResult(mockResult)
            setPhase('result')
            if (onProcessComplete) onProcessComplete(mockResult)
          }, 500)
          return 100
        }
        if (np >= 25 && currentStep < 1) setCurrentStep(1)
        else if (np >= 50 && currentStep < 2) setCurrentStep(2)
        else if (np >= 75 && currentStep < 3) setCurrentStep(3)
        return np
      })
    }, 300)
  }

  if (phase === 'result' && result) return <ResultPage result={result} onBack={() => setPhase('edit')} />
  if (phase === 'loading') return <LoadingState progress={progress} currentStep={currentStep} />
  if (phase === 'edit' && file) return <EditorPage agent={agent} file={file} onBack={() => { setFile(null); setPhase('upload') }} onFileChange={setFile} onGenerate={handleGenerate} />
  return <UploadZone agent={agent} onFileSelected={(f) => { setFile(f); setPhase('edit') }} />
}
