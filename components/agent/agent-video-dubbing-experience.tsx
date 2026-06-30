'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings2,
  Music,
  CheckCircle2,
  Download,
  SkipBack,
  SkipForward,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'

// ============================================================
// Types
// ============================================================

interface VideoDubbingExperienceProps {
  agent: Agent
  onStartProcess?: () => void
}

interface SubtitleTrack {
  id: number
  startTime: string
  endTime: string
  text: string
  translatedText: string
}

// ============================================================
// Helpers
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0, s = bytes
  while (s >= 1024 && i < u.length - 1) { s /= 1024; i++ }
  return `${s.toFixed(i > 0 ? 1 : 0)} ${u[i]}`
}

// ============================================================
// Voice Presets (参考文字转语音)
// ============================================================

const voicePresets = [
  {
    value: 'female-gentle',
    label: 'Bella',
    avatar: 'B',
    avatarBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
    tags: '温暖，知性，细腻',
    tagColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400',
  },
  {
    value: 'female-lively',
    label: 'Luna',
    avatar: 'L',
    avatarBg: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
    tags: '欢快，明亮，自信',
    tagColor: 'bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400',
  },
  {
    value: 'male-calm',
    label: 'Alex',
    avatar: 'A',
    avatarBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
    tags: '沉稳，大气，字正腔圆',
    tagColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  },
  {
    value: 'male-deep',
    label: 'Marcus',
    avatar: 'M',
    avatarBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
    tags: '低沉，醇厚，富有感染力',
    tagColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
  },
  {
    value: 'child',
    label: 'Milo',
    avatar: 'M',
    avatarBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    tags: '天真，灵动，自然',
    tagColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  },
]

const bgmOptions = [
  { value: 'none', label: '无背景音乐', duration: '', sub: '' },
  { value: 'light', label: '阳光明媚', duration: '01:18', sub: '轻快自然' },
  { value: 'inspire', label: '逐梦前行', duration: '02:05', sub: '积极向上' },
  { value: 'upbeat', label: '元气满满', duration: '00:52', sub: '活泼灵动' },
  { value: 'cinematic', label: '史诗之旅', duration: '01:45', sub: '大气沉稳' },
  { value: 'lofi', label: '午后咖啡馆', duration: '02:30', sub: '悠闲放松' },
  { value: 'classical', label: '月光花园', duration: '03:12', sub: '优雅温婉' },
  { value: 'electronic', label: '未来脉搏', duration: '01:33', sub: '科技节奏' },
]

// ============================================================
// Voice Settings Popover (参考文字转语音)
// ============================================================

function VoiceSettingsPopover({
  speed, volume,
  onSpeedChange, onVolumeChange,
}: {
  speed: number; volume: number
  onSpeedChange: (v: number) => void; onVolumeChange: (v: number) => void
}) {
  return (
    <PopoverContent side="left" align="start" className="w-56 p-0 overflow-hidden shadow-md border border-border/30 bg-white dark:bg-[#1A1A1E]">
      <div className="p-3 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0 w-7">语速</span>
            <Slider value={[speed]} onValueChange={v => onSpeedChange(v[0])} min={0.5} max={2.0} step={0.1} className="flex-1" />
            <span className="text-[11px] font-medium tabular-nums text-foreground/70 shrink-0 w-7 text-right">{speed}x</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0 w-7">音量</span>
            <Slider value={[volume]} onValueChange={v => onVolumeChange(v[0])} min={50} max={150} step={10} className="flex-1" />
            <span className="text-[11px] font-medium tabular-nums text-foreground/70 shrink-0 w-7 text-right">{volume}%</span>
          </div>
        </div>
      </div>
    </PopoverContent>
  )
}

// ============================================================
// Upload Zone (与 AI字幕生成 样式一致)
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
            <Button className="h-8 text-[12px] gap-2 px-8" onClick={e => { e.stopPropagation(); inputRef.current?.click() }}><Upload className="h-4 w-4" />上传文件</Button>
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
// Config Panel (右侧配置参数区，编辑页和结果页共用)
// ============================================================

function ConfigPanel({
  agent,
  selectedVoice, setSelectedVoice,
  selectedBgm, setSelectedBgm,
  speed, setSpeed,
  vol, setVol,
  isProcessing, onStart,
  onBack,
}: {
  agent: Agent
  selectedVoice: string; setSelectedVoice: (v: string) => void
  selectedBgm: string; setSelectedBgm: (v: string) => void
  speed: number; setSpeed: (v: number) => void
  vol: number; setVol: (v: number) => void
  isProcessing?: boolean
  onStart?: () => void
  onBack?: () => void
}) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [playingBgm, setPlayingBgm] = useState<string | null>(null)
  const [bgmSelectOpen, setBgmSelectOpen] = useState(false)

  const togglePlayVoice = (voice: string) => {
    setPlayingVoice(prev => prev === voice ? null : voice)
  }
  const toggleBgmPreview = (bgmValue: string) => {
    setPlayingBgm(prev => prev === bgmValue ? null : bgmValue)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0">
        <CardContent className="p-4 space-y-5">
          {/* 选择声音 */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">选择声音</span>
            <div className="space-y-2">
              {voicePresets.map(voice => {
                const isSelected = selectedVoice === voice.value
                const isPlaying = playingVoice === voice.value
                return (
                  <div key={voice.value} onClick={() => setSelectedVoice(voice.value)}
                    className={cn('group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
                      isSelected ? 'bg-white dark:bg-muted/20 ring-1 ring-border/20' : 'hover:bg-white/60 dark:hover:bg-muted/20')}>
                    <div className="shrink-0">
                      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200', voice.avatarBg)}>
                        {voice.avatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className={cn('text-[13px] font-medium transition-colors tracking-tight', isSelected ? 'text-foreground' : 'text-foreground/80')}>{voice.label}</span>
                      <span className={cn('inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-medium', voice.tagColor)}>{voice.tags}</span>
                    </div>
                    {isPlaying && (
                      <div className="flex items-end gap-px h-4 opacity-60 shrink-0">
                        {[3, 6, 4, 8, 5, 7, 4].map((h, i) => <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }} />)}
                      </div>
                    )}
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button onClick={e => e.stopPropagation()} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-all duration-200">
                            <Settings2 className="h-3.5 w-3.5" />
                          </button>
                        </PopoverTrigger>
                        <VoiceSettingsPopover speed={speed} volume={vol}
                          onSpeedChange={setSpeed} onVolumeChange={setVol} />
                      </Popover>
                      <button onClick={e => { e.stopPropagation(); togglePlayVoice(voice.value) }}
                        className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200', isPlaying ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/60')}>
                        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 背景音乐 — TTS 风格：标题同行 + 2 列网格气泡 */}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-medium text-muted-foreground/60 shrink-0">背景音乐</span>
              <Select open={bgmSelectOpen} onOpenChange={setBgmSelectOpen} value={selectedBgm} onValueChange={(v) => { setSelectedBgm(v); setBgmSelectOpen(false) }}>
                <SelectTrigger className="flex-1 h-8 rounded-md border border-border/30 bg-white dark:bg-[#0A0A0E] text-[12px] hover:border-border/50 transition-colors px-3 shadow-none focus-visible:ring-0">
                  {selectedBgm !== 'none' ? (
                    <span className="text-foreground">{bgmOptions.find(o => o.value === selectedBgm)?.label || selectedBgm}</span>
                  ) : (
                    <span className="text-muted-foreground/50">选择背景音乐</span>
                  )}
                </SelectTrigger>
                <SelectContent align="start" sideOffset={4} className="min-w-[340px] p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {bgmOptions.map((opt) => {
                      const isBgmPlaying = playingBgm === opt.value
                      return (
                        <div
                          key={opt.value}
                          onClick={() => { setSelectedBgm(opt.value); setBgmSelectOpen(false) }}
                          className={cn(
                            'group flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors text-foreground',
                            selectedBgm === opt.value ? 'bg-muted/60' : 'hover:bg-muted/40'
                          )}
                        >
                          <div
                            className="shrink-0 relative w-5 h-5"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (opt.value !== 'none') toggleBgmPreview(opt.value)
                            }}
                          >
                            {opt.value === 'none' ? (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px]">—</span>
                            ) : (
                              <>
                                <Music className={cn('absolute inset-0 h-5 w-5 transition-opacity duration-200', isBgmPlaying ? 'opacity-0' : 'opacity-100 group-hover:opacity-0')} />
                                <div className={cn('absolute inset-0 h-5 w-5 rounded flex items-center justify-center transition-opacity duration-200', isBgmPlaying ? 'opacity-100 bg-foreground/10' : 'opacity-0 group-hover:opacity-100 group-hover:bg-foreground/5')}>
                                  {isBgmPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-px" />}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[12px] font-medium block truncate">{opt.label}</span>
                            {opt.sub && (
                              <span className="text-[10px] text-muted-foreground/50 block">{opt.sub} · {opt.duration}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 开始处理 按钮 */}
      <Button className="w-full h-10 text-sm gap-2" onClick={onStart} disabled={isProcessing}>
        {isProcessing ? (
          <><div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />处理中...</>
        ) : (
          <><Sparkles className="h-4 w-4" />开始处理<span className="text-xs font-normal opacity-70 ml-1">{agent.costPoints} 智点</span></>
        )}
      </Button>
    </div>
  )
}

// ============================================================
// Video Preview Card (左侧视频播放器)
// ============================================================

function VideoPreview({ file, src, fileName, fileSize, onBack, onReplace, onFileChange, subtitles, showControls, originalSrc, beforeAfterMode, showDownloadButtons }: {
  file?: File
  src: string
  fileName: string
  fileSize?: number
  onBack?: () => void
  onReplace?: () => void
  onFileChange?: (f: File) => void
  subtitles?: SubtitleTrack[]
  showControls?: boolean
  originalSrc?: string
  beforeAfterMode?: boolean
  showDownloadButtons?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [viewMode, setViewMode] = useState<'after' | 'before'>(beforeAfterMode ? 'after' : 'after')

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
      else { videoRef.current.pause(); setIsPlaying(false) }
    }
  }

  // Switch video source when viewMode changes
  const currentSrc = viewMode === 'before' && originalSrc ? originalSrc : src
  // Persist playback time across source switches
  const handleSourceSwitch = (mode: 'after' | 'before') => {
    const ct = videoRef.current?.currentTime ?? currentTime
    setCurrentTime(ct)
    setViewMode(mode)
  }

  // Sync currentTime after source switch
  const handleLoadedData = () => {
    if (videoRef.current && currentTime > 0) {
      videoRef.current.currentTime = currentTime
      if (isPlaying) videoRef.current.play()
    }
  }
  const ft = (t: number) => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` }
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value); setCurrentTime(t)
    if (videoRef.current) videoRef.current.currentTime = t
  }

  // Find active subtitle for current video time
  const activeSub = subtitles?.find(s => {
    const [sh, sm, ss] = s.startTime.split(':').map(Number)
    const [eh, em, es] = s.endTime.split(':').map(Number)
    return currentTime >= sh * 3600 + sm * 60 + ss && currentTime <= eh * 3600 + em * 60 + es
  })

  return (
    <div className="flex flex-col gap-3">
      <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden flex flex-col">
        <div className="relative bg-black">
          {/* Before/After switch tabs */}
          {beforeAfterMode && originalSrc && (
            <div className="absolute top-3 right-3 z-10 flex rounded-lg bg-black/50 p-0.5 gap-0.5">
              <button
                onClick={() => handleSourceSwitch('before')}
                className={cn(
                  'px-3 py-1 rounded-md text-[11px] font-medium transition-all',
                  viewMode === 'before' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
                )}
              >
                处理前
              </button>
              <button
                onClick={() => handleSourceSwitch('after')}
                className={cn(
                  'px-3 py-1 rounded-md text-[11px] font-medium transition-all',
                  viewMode === 'after' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
                )}
              >
                处理后
              </button>
            </div>
          )}
          <video ref={videoRef} src={currentSrc} className="w-full aspect-video"
            onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
            onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
            onLoadedData={handleLoadedData}
            onEnded={() => setIsPlaying(false)} />
          {/* Subtitle overlay — only in "处理后" mode */}
          {viewMode === 'after' && activeSub && (
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
              <p className="text-white text-sm font-medium drop-shadow-lg bg-black/50 px-3 py-1 rounded">{activeSub.text}</p>
              <p className="text-yellow-300 text-xs drop-shadow-lg bg-black/50 px-3 py-0.5 rounded">{activeSub.translatedText}</p>
            </div>
          )}
          {/* Dubbing badge — only in "处理后" mode */}
          {viewMode === 'after' && subtitles && (
            <div className="absolute top-3 left-3 bg-green-600 text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
              <Volume2 className="h-3 w-3" /> 已配音
            </div>
          )}
        </div>
        <div className="p-3 space-y-2 border-t border-border/40 bg-[#F8F9FB] dark:bg-[#131418]">
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
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setVolume(v => { const nv = v > 0 ? 0 : 1; if (videoRef.current) videoRef.current.volume = nv; return nv })}>
                {volume > 0 ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              {(onReplace || onFileChange) && (
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => { onReplace?.(); inputRef.current?.click() }}>
                  <Upload className="h-3 w-3" />替换
                </Button>
              )}
              {onBack && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onBack}><X className="h-3.5 w-3.5" /></Button>
              )}
            </div>
          </div>
          {onFileChange && (
            <input ref={inputRef} type="file" accept="video/*,audio/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange(f); e.target.value = '' }} />
          )}
        </div>
      </Card>
      <div className="flex items-center gap-2 px-1">
        <FileVideo className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">{fileName}</span>
        {fileSize !== undefined && <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(fileSize)}</span>}
        {showDownloadButtons && (
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <a href={src} download={`dubbed_${fileName}`}>
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
              <Download className="h-3 w-3" />
              下载视频
            </Button>
          </a>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
            <Download className="h-3 w-3" />
            下载音频
          </Button>
        </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Editor Page
// ============================================================

function EditorPage({
  agent, file, onBack, onFileChange, onProcess,
}: {
  agent: Agent; file: File; onBack: () => void; onFileChange: (f: File) => void
  onProcess: (params: Record<string, any>) => void
}) {
  const [selectedVoice, setSelectedVoice] = useState('female-gentle')
  const [selectedBgm, setSelectedBgm] = useState('none')
  const [speed, setSpeed] = useState(1)
  const [vol, setVol] = useState(100)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <VideoPreview file={file} src={URL.createObjectURL(file)} fileName={file.name} fileSize={file.size}
        onBack={onBack} onFileChange={onFileChange} />
      <ConfigPanel agent={agent}
        selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice}
        selectedBgm={selectedBgm} setSelectedBgm={setSelectedBgm}
        speed={speed} setSpeed={setSpeed} vol={vol} setVol={setVol}
        onStart={() => onProcess({ voice: selectedVoice, bgm: selectedBgm, speed, vol })} />
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
    "正在匹配最优配音音色，生成AI配音",
    "正在进行最后的细节优化与渲染",
  ]
  return (
    <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">{progress}%</div>
          </div>
          <div><p className="text-lg font-semibold text-foreground">预计共需1分钟，内容即将呈现</p>
            <p className="text-sm text-muted-foreground mt-1">AI正在识别配音并生成字幕</p></div>
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
// Mock subtitle data
// ============================================================

const MOCK_SUBTITLES: SubtitleTrack[] = [
  { id: 1, startTime: '00:00:01', endTime: '00:00:04', text: '欢迎来到AI视频配音工具的使用教程。', translatedText: 'Welcome to the AI video dubbing tutorial.' },
  { id: 2, startTime: '00:00:05', endTime: '00:00:09', text: '今天我们将演示如何为视频自动添加AI配音。', translatedText: 'Today we demonstrate how to add AI dubbing to videos.' },
  { id: 3, startTime: '00:00:10', endTime: '00:00:14', text: '首先选择你喜欢的配音音色，系统会自动合成配音。', translatedText: 'First choose your favorite voice, and the system will synthesize the dubbing.' },
  { id: 4, startTime: '00:00:15', endTime: '00:00:19', text: '你还可以添加背景音乐，让视频更加生动有趣。', translatedText: 'You can also add background music to make the video more lively.' },
  { id: 5, startTime: '00:00:20', endTime: '00:00:24', text: '处理完成后，即可预览带配音和字幕的视频效果。', translatedText: 'Once done, preview the video with dubbing and subtitles.' },
]

// ============================================================
// Result Page (with subtitle overlay)
// ============================================================

function ResultPage({
  agent, src, originalSrc, fileName,
  initialVoice, initialBgm, initialSpeed, initialVol,
  onProcess, onBack,
}: {
  agent: Agent; src: string; originalSrc: string; fileName: string
  initialVoice: string; initialBgm: string; initialSpeed: number; initialVol: number
  onProcess: (params: Record<string, any>) => void; onBack: () => void
}) {
  const [selectedVoice, setSelectedVoice] = useState(initialVoice)
  const [selectedBgm, setSelectedBgm] = useState(initialBgm)
  const [speed, setSpeed] = useState(initialSpeed)
  const [vol, setVol] = useState(initialVol)
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        <VideoPreview src={src} originalSrc={originalSrc} fileName={fileName} subtitles={MOCK_SUBTITLES} beforeAfterMode showDownloadButtons />
      </div>
      <ConfigPanel agent={agent}
        selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice}
        selectedBgm={selectedBgm} setSelectedBgm={setSelectedBgm}
        speed={speed} setSpeed={setSpeed} vol={vol} setVol={setVol}
        isProcessing={isProcessing}
        onStart={() => {
          setIsProcessing(true)
          setTimeout(() => setIsProcessing(false), 2000)
          onProcess({ voice: selectedVoice, bgm: selectedBgm, speed, vol })
        }}
        onBack={onBack}
      />
    </div>
  )
}

// ============================================================
// Main
// ============================================================

export function VideoDubbingExperienceArea({ agent, onStartProcess }: VideoDubbingExperienceProps) {
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<'upload' | 'edit' | 'loading' | 'result'>('upload')
  const [lastParams, setLastParams] = useState<Record<string, any>>({})
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const handleProcess = (params: Record<string, any>) => {
    setLastParams(params)
    setPhase('loading')
    setProgress(0)
    setCurrentStep(0)
    if (onStartProcess) onStartProcess()

    // Simulate processing with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const np = prev + 10
        if (np >= 100) {
          clearInterval(interval)
          setTimeout(() => setPhase('result'), 500)
          return 100
        }
        if (np >= 25 && currentStep < 1) setCurrentStep(1)
        else if (np >= 50 && currentStep < 2) setCurrentStep(2)
        else if (np >= 75 && currentStep < 3) setCurrentStep(3)
        return np
      })
    }, 300)
  }

  if (phase === 'loading') return <LoadingState progress={progress} currentStep={currentStep} />

  if (phase === 'result' && file) {
    return (
      <ResultPage
        agent={agent} src={URL.createObjectURL(file)} originalSrc={URL.createObjectURL(file)} fileName={file.name}
        initialVoice={lastParams.voice || 'female-gentle'}
        initialBgm={lastParams.bgm || 'none'}
        initialSpeed={lastParams.speed || 1}
        initialVol={lastParams.vol || 100}
        onProcess={handleProcess}
        onBack={() => { setFile(null); setPhase('upload') }}
      />
    )
  }

  if (phase === 'edit' && file) {
    return <EditorPage agent={agent} file={file} onBack={() => { setFile(null); setPhase('upload') }} onFileChange={setFile} onProcess={handleProcess} />
  }

  return <UploadZone agent={agent} onFileSelected={f => { setFile(f); setPhase('edit') }} />
}
