'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
  { value: 'female-gentle', label: '温柔女声', tag: '女声', desc: '温暖知性，情感细腻，适合有声读物、产品解说', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { value: 'female-lively', label: '活泼女声', tag: '女声', desc: '俏皮灵动，元气满满，适合短视频、带货广告', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'male-calm', label: '沉稳男声', tag: '男声', desc: '大气稳重，字正腔圆，适合新闻播报、品牌视频', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'male-deep', label: '磁性男声', tag: '男声', desc: '低沉醇厚，感染力强，适合广告配音、播客开场', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { value: 'child', label: '可爱童声', tag: '童声', desc: '天真烂漫，自然灵动，适合儿童内容、在线教育', color: 'bg-amber-100 text-amber-700 border-amber-200' },
]

const bgmOptions = [
  { value: 'none', label: '无背景音乐' },
  { value: 'light', label: '轻音乐 - 温馨舒缓' },
  { value: 'inspire', label: '励志 - 昂扬向上' },
  { value: 'upbeat', label: '欢快 - 活泼灵动' },
  { value: 'cinematic', label: '电影感 - 大气磅礴' },
  { value: 'lofi', label: 'Lo-fi - 休闲放松' },
  { value: 'classical', label: '古典 - 优雅庄重' },
  { value: 'electronic', label: '电子 - 科技律动' },
]

// ============================================================
// Voice Settings Popover (参考文字转语音)
// ============================================================

function VoiceSettingsPopover({
  speed, pitch, volume,
  onSpeedChange, onPitchChange, onVolumeChange,
}: {
  speed: number; pitch: number; volume: number
  onSpeedChange: (v: number) => void; onPitchChange: (v: number) => void; onVolumeChange: (v: number) => void
}) {
  return (
    <PopoverContent side="left" align="start" className="w-72 p-0 overflow-hidden shadow-xl border-border/80">
      <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-semibold text-foreground">声音参数设置</span></div>
      </div>
      <div className="p-4 space-y-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between"><Label className="text-xs font-medium text-foreground">语速</Label><span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{speed}x</span></div>
          <Slider value={[speed]} onValueChange={v => onSpeedChange(v[0])} min={0.5} max={2.0} step={0.1} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-foreground"><span>0.5x 慢速</span><span>2.0x 快速</span></div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between"><Label className="text-xs font-medium text-foreground">音调</Label><span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{pitch > 0 ? `+${pitch}` : pitch}</span></div>
          <Slider value={[pitch]} onValueChange={v => onPitchChange(v[0])} min={-10} max={10} step={1} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-foreground"><span>-10 低沉</span><span>+10 高亢</span></div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between"><Label className="text-xs font-medium text-foreground">音量</Label><span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{volume}%</span></div>
          <Slider value={[volume]} onValueChange={v => onVolumeChange(v[0])} min={50} max={150} step={10} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-foreground"><span>50%</span><span>150%</span></div>
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
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          className={cn('p-4 text-center transition-all flex flex-col items-center gap-5', 'bg-secondary/20', isDragging && 'bg-primary/5')}>
          <div onClick={() => inputRef.current?.click()}
            className={cn('w-full border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center gap-5',
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent/30')}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><Upload className="h-6 w-6 text-primary" /></div>
            <p className="text-sm text-muted-foreground">拖拽本地音视频文件到这里</p>
            <Button className="h-11 gap-2 px-8" onClick={e => { e.stopPropagation(); inputRef.current?.click() }}><Upload className="h-4 w-4" />上传文件</Button>
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
  pitch, setPitch,
  vol, setVol,
  isProcessing, onStart,
  onBack,
}: {
  agent: Agent
  selectedVoice: string; setSelectedVoice: (v: string) => void
  selectedBgm: string; setSelectedBgm: (v: string) => void
  speed: number; setSpeed: (v: number) => void
  pitch: number; setPitch: (v: number) => void
  vol: number; setVol: (v: number) => void
  isProcessing?: boolean
  onStart?: () => void
  onBack?: () => void
}) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)

  const togglePlayVoice = (voice: string) => {
    setPlayingVoice(prev => prev === voice ? null : voice)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4 space-y-5">
          {/* 配音音色 */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">配音音色</Label>
            <div className="space-y-2">
              {voicePresets.map(voice => {
                const isSelected = selectedVoice === voice.value
                const isPlaying = playingVoice === voice.value
                return (
                  <div key={voice.value} onClick={() => setSelectedVoice(voice.value)}
                    className={cn('group flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200',
                      isSelected ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/25 shadow-sm' : 'border-border/50 bg-card hover:border-primary/20 hover:bg-accent/30')}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-foreground')}>{voice.label}</span>
                        <span className={cn('inline-flex items-center rounded-md px-1.5 py-px text-[10px] font-medium border', voice.color)}>{voice.tag}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed truncate">{voice.desc}</p>
                    </div>
                    {isPlaying && (
                      <div className="flex items-end gap-px h-4 opacity-60 shrink-0">
                        {[3, 6, 4, 8, 5, 7, 4].map((h, i) => <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }} />)}
                      </div>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button onClick={e => e.stopPropagation()} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted">
                            <Settings2 className="h-3.5 w-3.5" />
                          </button>
                        </PopoverTrigger>
                        <VoiceSettingsPopover speed={speed} pitch={pitch} volume={vol}
                          onSpeedChange={setSpeed} onPitchChange={setPitch} onVolumeChange={setVol} />
                      </Popover>
                      <button onClick={e => { e.stopPropagation(); togglePlayVoice(voice.value) }}
                        className={cn('w-8 h-8 rounded-lg flex items-center justify-center', isPlaying ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
                        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 背景音乐 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">背景音乐</Label>
            <Select value={selectedBgm} onValueChange={setSelectedBgm}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{bgmOptions.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 开始处理 按钮 */}
      <Button className="w-full h-12 text-base gap-2" onClick={onStart} disabled={isProcessing}>
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

function VideoPreview({ file, src, fileName, fileSize, onBack, onReplace, onFileChange, subtitles, showControls, originalSrc, beforeAfterMode }: {
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
      <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col">
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
  const [pitch, setPitch] = useState(0)
  const [vol, setVol] = useState(100)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <VideoPreview file={file} src={URL.createObjectURL(file)} fileName={file.name} fileSize={file.size}
        onBack={onBack} onFileChange={onFileChange} />
      <ConfigPanel agent={agent}
        selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice}
        selectedBgm={selectedBgm} setSelectedBgm={setSelectedBgm}
        speed={speed} setSpeed={setSpeed} pitch={pitch} setPitch={setPitch} vol={vol} setVol={setVol}
        onStart={() => onProcess({ voice: selectedVoice, bgm: selectedBgm, speed, pitch, vol })} />
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
  initialVoice, initialBgm, initialSpeed, initialPitch, initialVol,
  onProcess, onBack,
}: {
  agent: Agent; src: string; originalSrc: string; fileName: string
  initialVoice: string; initialBgm: string; initialSpeed: number; initialPitch: number; initialVol: number
  onProcess: (params: Record<string, any>) => void; onBack: () => void
}) {
  const [selectedVoice, setSelectedVoice] = useState(initialVoice)
  const [selectedBgm, setSelectedBgm] = useState(initialBgm)
  const [speed, setSpeed] = useState(initialSpeed)
  const [pitch, setPitch] = useState(initialPitch)
  const [vol, setVol] = useState(initialVol)
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        <VideoPreview src={src} originalSrc={originalSrc} fileName={fileName} subtitles={MOCK_SUBTITLES} beforeAfterMode />

        <Button variant="outline" size="sm" className="w-full" onClick={onBack}>返回重选文件</Button>
      </div>
      <ConfigPanel agent={agent}
        selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice}
        selectedBgm={selectedBgm} setSelectedBgm={setSelectedBgm}
        speed={speed} setSpeed={setSpeed} pitch={pitch} setPitch={setPitch} vol={vol} setVol={setVol}
        isProcessing={isProcessing}
        onStart={() => {
          setIsProcessing(true)
          setTimeout(() => setIsProcessing(false), 2000)
          onProcess({ voice: selectedVoice, bgm: selectedBgm, speed, pitch, vol })
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
        initialPitch={lastParams.pitch || 0}
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
