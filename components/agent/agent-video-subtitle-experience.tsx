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
  Mic2,
  ScanText,
  Globe,
  Type,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
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
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          className={cn('p-4 text-center transition-all flex flex-col items-center gap-5', 'bg-secondary/20', isDragging && 'bg-primary/5')}>
          <div onClick={() => inputRef.current?.click()}
            className={cn('w-full border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center gap-5',
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent/30')}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><Upload className="h-6 w-6 text-primary" /></div>
            <p className="text-sm text-muted-foreground">拖拽本地音视频文件到这里</p>
            <Button className="h-11 gap-2 px-8" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
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
        <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col">
          <div className="relative bg-black">
            <video ref={videoRef} src={URL.createObjectURL(file)} className="w-full aspect-video"
              onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
              onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
              onEnded={() => setIsPlaying(false)} />
          </div>
          {/* Video controls */}
          <div className="p-3 space-y-2 border-t border-border/40 bg-secondary/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-10">{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
                className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
              <span className="text-xs text-muted-foreground w-10 text-right">{duration ? formatTime(duration) : '00:00'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setVolume(v => { const nv = v > 0 ? 0 : 1; if (videoRef.current) videoRef.current.volume = nv; return nv })}>
                  {volume > 0 ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                </Button>
                {/* Playback speed */}
                <div className="flex items-center gap-0.5 ml-2">
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
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 space-y-4">
            {/* 源语言 */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">语言设置</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />源语言</Label>
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {bilingual && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Type className="h-3 w-3" />目标语言</Label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{TARGET_LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                )}
              </div>
            </div>
            {/* 双语字幕 */}
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
              <span className="text-sm text-foreground">双语字幕</span>
              <button role="switch" aria-checked={bilingual} onClick={() => setBilingual(!bilingual)}
                className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', bilingual ? 'bg-primary' : 'bg-muted-foreground/30')}>
                <span className={cn('pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform', bilingual ? 'translate-x-4' : 'translate-x-0')} />
              </button>
            </div>
          </CardContent>
        </Card>
        {/* 立即生成 */}
        <Button className="w-full h-12 text-base gap-2" onClick={() => onGenerate({ subtitleSource: 'asr', sourceLang, targetLang: bilingual ? targetLang : '', bilingual })}>
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
        <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col">
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
          <div className="p-3 space-y-2 border-t border-border/40 bg-secondary/20">
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
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Type className="h-3 w-3" />字幕样式</Button>
          <div className="flex rounded-lg bg-secondary/50 p-0.5 gap-0.5 ml-auto">
            <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 bg-background shadow-sm">原文</Button>
            <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2">译文</Button>
            <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2">双语</Button>
          </div>
        </div>

        {/* Subtitle list */}
        <Card className="border-border/60 shadow-sm flex-1">
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
