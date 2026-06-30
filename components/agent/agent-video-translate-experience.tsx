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
  Upload,
  FileVideo,
  X,
  AlertCircle,
  Sparkles,
  Languages,
  Subtitles,
  Globe,
  Type,
  Zap,
  CheckCircle2,
  Play,
  Pause,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// ============================================================
// Types
// ============================================================

interface VideoTranslateExperienceProps {
  agent: Agent
  onStartProcess?: () => void
  onProcessComplete?: (result: any) => void
}

// ============================================================
// Helpers
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

// ============================================================
// Language list
// ============================================================

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
  { value: 'ms', label: '马来语' },
  { value: 'hi', label: '印地语' },
  { value: 'nl', label: '荷兰语' },
]

const TARGET_LANGUAGES = LANGUAGES.filter(l => l.value !== 'auto')

// ============================================================
// Voice Presets (与 AI文字转语音 一致)
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

// ============================================================
// Voice Settings Popover
// ============================================================

function VoiceSettingsPopover({
  speed,
  volume,
  onSpeedChange,
  onVolumeChange,
}: {
  speed: number
  volume: number
  onSpeedChange: (v: number) => void
  onVolumeChange: (v: number) => void
}) {
  return (
    <PopoverContent side="left" align="start" className="w-56 p-0 overflow-hidden shadow-xl border-border/80">
      <div className="p-3 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0 w-7">语速</span>
            <Slider value={[speed]} onValueChange={(vals) => onSpeedChange(vals[0])} min={0.5} max={2.0} step={0.1} className="flex-1" />
            <span className="text-[11px] font-medium tabular-nums text-foreground/70 shrink-0 w-7 text-right">{speed}x</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0 w-7">音量</span>
            <Slider value={[volume]} onValueChange={(vals) => onVolumeChange(vals[0])} min={50} max={150} step={10} className="flex-1" />
            <span className="text-[11px] font-medium tabular-nums text-foreground/70 shrink-0 w-7 text-right">{volume}%</span>
          </div>
        </div>
      </div>
    </PopoverContent>
  )
}

// ============================================================
// Voice Row (气泡卡片内使用)
// ============================================================

function VoiceRow({
  voice,
  isSelected,
  isPlaying,
  onSelect,
  onTogglePlay,
  speed,
  volume,
  onSpeedChange,
  onVolumeChange,
}: {
  voice: (typeof voicePresets)[number]
  isSelected: boolean
  isPlaying: boolean
  onSelect: () => void
  onTogglePlay: () => void
  speed: number
  volume: number
  onSpeedChange: (v: number) => void
  onVolumeChange: (v: number) => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
        isSelected
          ? 'bg-white dark:bg-muted/20 ring-1 ring-border/20'
          : 'hover:bg-white/60 dark:hover:bg-muted/20'
      )}
    >
      <div className="shrink-0">
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200', voice.avatarBg)}>
          {voice.avatar}
        </div>
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={cn('text-[13px] font-medium transition-colors tracking-tight', isSelected ? 'text-foreground' : 'text-foreground/80')}>
          {voice.label}
        </span>
        <span className={cn('inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-medium', voice.tagColor)}>
          {voice.tags}
        </span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Popover>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-all duration-200"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </PopoverTrigger>
          <VoiceSettingsPopover speed={speed} volume={volume} onSpeedChange={onSpeedChange} onVolumeChange={onVolumeChange} />
        </Popover>
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePlay() }}
          className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200', isPlaying ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/60')}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Voice Select Popover — 默认显示下拉组件，点击弹出气泡卡片
// ============================================================

function VoiceSelectPopover({
  selectedVoice,
  playingVoice,
  onSelectVoice,
  onTogglePlay,
  speed,
  volume,
  onSpeedChange,
  onVolumeChange,
}: {
  selectedVoice: string
  playingVoice: string | null
  onSelectVoice: (v: string) => void
  onTogglePlay: (v: string) => void
  speed: number
  volume: number
  onSpeedChange: (v: number) => void
  onVolumeChange: (v: number) => void
}) {
  const [open, setOpen] = useState(false)
  const current = voicePresets.find(v => v.value === selectedVoice) || voicePresets[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-3 h-[44px] w-full rounded-md border border-border/30 shadow-none bg-white dark:bg-[#1A1A1E] px-3 text-[13px] hover:border-border/50 transition-colors"
        >
          <div className="shrink-0">
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold', current.avatarBg)}>
              {current.avatar}
            </div>
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-[13px] font-medium text-foreground/80">{current.label}</span>
            <span className={cn('inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-medium', current.tagColor)}>
              {current.tags}
            </span>
          </div>
          <svg className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-[330px] p-2 shadow-md border border-border/30 bg-white dark:bg-[#1A1A1E]">
        <div className="space-y-0.5">
          {voicePresets.map((voice) => (
            <VoiceRow
              key={voice.value}
              voice={voice}
              isSelected={selectedVoice === voice.value}
              isPlaying={playingVoice === voice.value}
              onSelect={() => { onSelectVoice(voice.value); setOpen(false) }}
              onTogglePlay={() => onTogglePlay(voice.value)}
              speed={speed}
              volume={volume}
              onSpeedChange={onSpeedChange}
              onVolumeChange={onVolumeChange}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ============================================================
// Default params
// ============================================================

const DEFAULT_PARAMS = {
  translateMode: 'full', // 'full' | 'subtitle-only'
  sourceLang: 'auto',
  targetLang: 'en',
  voice: 'female-gentle',
  volume: 100,
}

// ============================================================
// Empty / Upload State
// ============================================================

function UploadZone({ agent, onFileSelected }: { agent: Agent; onFileSelected: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setError(undefined)
      onFileSelected(droppedFile)
    }
  }, [onFileSelected])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setError(undefined)
      onFileSelected(selectedFile)
    }
    e.target.value = ''
  }, [onFileSelected])

  return (
    <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden">
      <CardContent className="p-0">
        {/* Drag & drop area — 上传区与按钮视觉一体 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'p-4 text-center transition-all flex flex-col items-center gap-5',
            'bg-[#FAFAFC] dark:bg-[#111115]',
            isDragging && 'bg-primary/5'
          )}
        >
          {/* Dashed border zone — 上传按钮与提示文案都在虚线区内 */}
          <div
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative w-full border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center gap-5',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30 hover:bg-accent/30'
            )}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              拖拽本地音视频文件到这里
            </p>

            {/* Upload button — inside dashed zone */}
            <Button
              className="h-8 text-[12px] gap-2 px-8"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
            >
              <Upload className="h-4 w-4" />
              上传文件
            </Button>

            {/* Format / size / duration hints */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>mp3/mp4/mov/webm/wav等30种格式</span>
              <span className="text-border/60">|</span>
              <span>视频 ≤ 4GB；音频 ≤ 500M</span>
              <span className="text-border/60">|</span>
              <span>时长 ≤ 3小时</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </Card>
  )
}

// ============================================================
// Edit Mode / Video Editor
// ============================================================

function VideoEditor({
  agent,
  file,
  onBack,
  onFileChange,
  onStartProcess,
}: {
  agent: Agent
  file: File
  onBack: () => void
  onFileChange: (file: File) => void
  onStartProcess?: () => void
}) {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [voiceSpeed, setVoiceSpeed] = useState(1)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateParam = useCallback(<K extends keyof typeof DEFAULT_PARAMS>(
    key: K,
    value: typeof DEFAULT_PARAMS[K]
  ) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleReselect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileChange(selectedFile)
    }
    e.target.value = ''
  }, [onFileChange])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* === LEFT: Video Preview === */}
      <div className="flex flex-col gap-4">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden flex flex-col">
          {/* Video player */}
          <div className="relative bg-black">
            <video
              src={URL.createObjectURL(file)}
              className="w-full aspect-video"
              controls
            />
          </div>
          {/* File info bar */}
          <div className="flex items-center gap-3 p-3 border-t border-border/40 bg-[#F8F9FB] dark:bg-[#131418]">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileVideo className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => inputRef.current?.click()}
              >
                替换
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onBack}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/*,audio/*"
            className="hidden"
            onChange={handleReselect}
          />
        </Card>
      </div>

      {/* === RIGHT: Parameter Panel === */}
      <div className="flex flex-col gap-4">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0">
          <CardContent className="p-4 space-y-4">
            {/* 翻译模式切换 */}
            <div className="flex rounded-lg bg-muted/20 border border-border/20 p-0.5 gap-0.5">
              <button
                onClick={() => updateParam('translateMode', 'full')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-[13px] font-medium transition-all',
                  params.translateMode === 'full'
                    ? 'bg-white dark:bg-[#1A1A1E] text-foreground shadow-sm'
                    : 'text-muted-foreground/60 hover:text-foreground'
                )}
              >
                <Languages className="h-3.5 w-3.5" />
                翻译字幕+配音
              </button>
              <button
                onClick={() => updateParam('translateMode', 'subtitle-only')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-[13px] font-medium transition-all',
                  params.translateMode === 'subtitle-only'
                    ? 'bg-white dark:bg-[#1A1A1E] text-foreground shadow-sm'
                    : 'text-muted-foreground/60 hover:text-foreground'
                )}
              >
                <Subtitles className="h-3.5 w-3.5" />
                仅翻译字幕
              </button>
            </div>

            {/* 源语言 */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-foreground/70 shrink-0 w-16">源语言</span>
              <Select value={params.sourceLang} onValueChange={(v) => updateParam('sourceLang', v)}>
                <SelectTrigger className="h-8 text-[13px] flex-1 border-border/30 bg-white dark:bg-[#1A1A1E] shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 目标语言 */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-foreground/70 shrink-0 w-16">目标语言</span>
              <Select value={params.targetLang} onValueChange={(v) => updateParam('targetLang', v)}>
                <SelectTrigger className="h-8 text-[13px] flex-1 border-border/30 bg-white dark:bg-[#1A1A1E] shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ---- Section: 选择声音 ---- */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">选择声音</span>
              <VoiceSelectPopover
                selectedVoice={params.voice}
                playingVoice={playingVoice}
                onSelectVoice={(v) => updateParam('voice', v)}
                onTogglePlay={(v) => setPlayingVoice(prev => prev === v ? null : v)}
                speed={voiceSpeed}
                volume={params.volume}
                onSpeedChange={setVoiceSpeed}
                onVolumeChange={(v) => updateParam('volume', v)}
              />
            </div>

            {/* ---- Section: 音量 ---- */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">音量</span>
              <div className="flex items-center gap-3">
                <Slider
                  value={[params.volume]}
                  onValueChange={(vals) => updateParam('volume', vals[0])}
                  min={50}
                  max={150}
                  step={10}
                  className="flex-1"
                />
                <span className="text-xs font-semibold tabular-nums text-foreground/70 shrink-0 w-10 text-right">{params.volume}%</span>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ---- 开始翻译 Button ---- */}
        <Button
          className="w-full h-10 text-sm gap-3"
          onClick={onStartProcess}
        >
          <Sparkles className="h-4 w-4" />
          开始翻译
          <span className="text-xs flex items-center gap-1 text-white/80">
            <Zap className="h-3 w-3" />
            {agent.costPoints} 智点
          </span>
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function VideoTranslateExperienceArea({
  agent,
  onStartProcess,
  onProcessComplete,
}: VideoTranslateExperienceProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processProgress, setProcessProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  if (!file) {
    return <UploadZone agent={agent} onFileSelected={setFile} />
  }

  if (isProcessing) {
    // 显示处理进度
    const steps = [
      "上传成功!可在历史任务中查看结果",
      "正在深度解析视频，智能提取字幕", 
      "正在进行高精度翻译校准",
      "正在进行最后的细节优化与渲染"
    ]
    
    return (
      <div className="space-y-6">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                  {processProgress}%
                </div>
              </div>
              
              <div>
                <p className="text-lg font-semibold text-foreground">预计共需1分钟，内容即将呈现</p>
                <p className="text-sm text-muted-foreground mt-1">AI正在处理您的视频翻译请求</p>
              </div>
              
              <div className="w-full max-w-md">
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${processProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3 w-full max-w-md">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index <= currentStep 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index <= currentStep 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-sm ${
                      index <= currentStep 
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground'
                    }`}>
                      {step}
                    </span>
                    {index < currentStep && (
                      <div className="ml-auto text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <VideoEditor
      agent={agent}
      file={file}
      onBack={() => setFile(null)}
      onFileChange={setFile}
      onStartProcess={() => {
        setIsProcessing(true);
        setProcessProgress(0);
        setCurrentStep(0);
        
        // 模拟处理过程
        const interval = setInterval(() => {
          setProcessProgress(prev => {
            const newProgress = prev + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              // 处理完成，跳转到结果页
              setTimeout(() => {
                setIsProcessing(false);
                if (onProcessComplete) {
                  onProcessComplete({
                    subtitles: [
                      { id: 1, startTime: '00:00:01', endTime: '00:00:04', text: '这是第一句字幕', translatedText: 'This is the first subtitle' },
                      { id: 2, startTime: '00:00:05', endTime: '00:00:08', text: '这是第二句字幕', translatedText: 'This is the second subtitle' },
                      { id: 3, startTime: '00:00:09', endTime: '00:00:12', text: '这是第三句字幕', translatedText: 'This is the third subtitle' },
                    ],
                    videoUrl: URL.createObjectURL(file),
                    originalFile: file
                  });
                }
              }, 500);
              return 100;
            }
            
            // 更新步骤
            if (newProgress >= 25 && currentStep < 1) {
              setCurrentStep(1);
            } else if (newProgress >= 50 && currentStep < 2) {
              setCurrentStep(2);
            } else if (newProgress >= 75 && currentStep < 3) {
              setCurrentStep(3);
            }
            
            return newProgress;
          });
        }, 300);
      }}
    />
  )
}
