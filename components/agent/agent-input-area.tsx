'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  X,
  FileAudio,
  FileVideo,
  FileImage,
  FileText,
  AlertCircle,
  Play,
  Pause,
  Wand2,
  BookOpen,
  Sparkles,
  Type,
  Globe,
  Volume2,
  Music,
  Crop,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Mic,
  Languages,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'

// ============================================================
// Types
// ============================================================

export interface SelectedRegion {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface AgentInputAreaProps {
  agent: Agent
  file: File | null
  text: string
  paramValues: Record<string, any>
  onFileChange: (file: File | null) => void
  onTextChange: (text: string) => void
  onParamChange: (id: string, value: any) => void
  error?: string
  isProcessing?: boolean
  progress?: number
  progressSteps?: { label: string; status: 'pending' | 'running' | 'done' }[]
  onStartProcess?: () => void
}

// ============================================================
// Utility
// ============================================================

function getFileCategory(ext: string): string {
  if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) return 'video'
  if (['.mp3', '.wav', '.m4a', '.flac', '.aac'].includes(ext)) return 'audio'
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'].includes(ext))
    return 'image'
  return 'text'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  video: <FileVideo className="h-8 w-8 text-primary" />,
  audio: <FileAudio className="h-8 w-8 text-rose-500" />,
  image: <FileImage className="h-8 w-8 text-emerald-500" />,
  text: <FileText className="h-8 w-8 text-amber-500" />,
}

// ============================================================
// Quick Fill Buttons (for text-to-speech & similar)
// ============================================================

const quickFillActions = [
  { id: 'ai-write', label: 'AI帮我写', icon: Wand2 },
  { id: 'random-story', label: '随机故事', icon: BookOpen },
  { id: 'upload-txt', label: '上传txt', icon: FileText },
  { id: 'translate', label: '翻译', icon: Globe },
  { id: 'pause', label: '插入停顿', icon: Type },
]

function QuickFillBar({
  onAction,
}: {
  onAction: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap p-1 rounded-xl bg-secondary/50 border border-border/40">
      {quickFillActions.map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all"
            onClick={() => onAction(action.id)}
          >
            <Icon className="h-3 w-3 text-muted-foreground" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}

// ============================================================
// File Upload Zone
// ============================================================

function FileUploadZone({
  acceptedFiles,
  maxFileSize,
  file,
  onFileChange,
}: {
  acceptedFiles?: string[]
  maxFileSize?: number
  file: File | null
  onFileChange: (file: File | null) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) onFileChange(droppedFile)
    },
    [onFileChange]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null
      onFileChange(selectedFile)
      e.target.value = ''
    },
    [onFileChange]
  )

  const acceptedExtensions = acceptedFiles?.join(',') || '*'
  const fileExt = file ? `.${file.name.split('.').pop()?.toLowerCase()}` : ''
  const fileCategory = file ? getFileCategory(fileExt) : 'text'

  if (file) {
    const isImage = fileCategory === 'image'
    const isVideo = fileCategory === 'video'

    return (
      <div className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
        {/* Preview for image/video */}
        {(isImage || isVideo) && (
          <div className="relative w-full bg-black/5">
            {isImage && (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full max-h-[240px] object-contain mx-auto"
              />
            )}
            {isVideo && (
              <video
                src={URL.createObjectURL(file)}
                className="w-full max-h-[240px] mx-auto"
                controls
              />
            )}
          </div>
        )}
        {/* File info bar */}
        <div className="flex items-center gap-3 p-3">
          {fileTypeIcons[fileCategory] || fileTypeIcons.text}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => inputRef.current?.click()}
            >
              重选
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onFileChange(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={acceptedExtensions}
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer',
        'bg-secondary/30',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/30 hover:bg-accent/50'
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
        <Upload className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-foreground mb-1">
        拖拽文件到此处，或 <span className="text-primary font-medium">点击上传</span>
      </p>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        {acceptedFiles && (
          <span>支持 {acceptedFiles.join('、')}</span>
        )}
        {maxFileSize && (
          <span>· 最大 {maxFileSize}MB</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedExtensions}
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  )
}

// ============================================================
// Voice Selector (声音选择卡片)
// ============================================================

const voicePresets = [
  { value: 'female-gentle', label: '温柔女声', tag: '女声', desc: '温暖知性，情感细腻，适合有声读物、产品解说', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { value: 'female-lively', label: '活泼女声', tag: '女声', desc: '俏皮灵动，元气满满，适合短视频、带货广告', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { value: 'male-calm', label: '沉稳男声', tag: '男声', desc: '大气稳重，字正腔圆，适合新闻播报、品牌视频', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'male-deep', label: '磁性男声', tag: '男声', desc: '低沉醇厚，感染力强，适合广告配音、播客开场', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { value: 'child', label: '可爱童声', tag: '童声', desc: '天真烂漫，自然灵动，适合儿童内容、在线教育', color: 'bg-amber-50 border-amber-200 text-amber-700' },
]

function VoiceSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)

  const togglePreview = (voiceValue: string) => {
    if (playingVoice === voiceValue) {
      setPlayingVoice(null)
    } else {
      setPlayingVoice(voiceValue)
      setTimeout(() => setPlayingVoice(null), 2000)
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Volume2 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">配音音色</p>
          <p className="text-xs text-muted-foreground">选择最适合你内容风格的声音</p>
        </div>
      </div>

      {/* Voice cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {voicePresets.map((voice) => {
          const isSelected = value === voice.value
          const isPlaying = playingVoice === voice.value
          return (
            <button
              key={voice.value}
              onClick={() => onChange(voice.value)}
              className={cn(
                'group relative rounded-xl border p-4 text-left transition-all duration-200',
                'hover:-translate-y-0.5',
                isSelected
                  ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/30 shadow-sm'
                  : 'border-border/60 bg-card hover:border-primary/25 hover:shadow-sm'
              )}
            >
              {/* Top: Tag + Play preview */}
              <div className="flex items-center justify-between mb-2.5">
                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium leading-none',
                    voice.color
                  )}
                >
                  {voice.tag}
                </span>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePreview(voice.value)
                  }}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200',
                    isPlaying
                      ? 'bg-primary text-primary-foreground scale-110 shadow-sm'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  )}
                >
                  {isPlaying ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5 ml-0.5" />
                  )}
                </div>
              </div>

              {/* Name */}
              <p
                className={cn(
                  'text-sm font-semibold mb-1 transition-colors',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}
              >
                {voice.label}
              </p>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {voice.desc}
              </p>

              {/* Waveform decoration */}
              <div className="flex items-end gap-px mt-3 h-5 opacity-20 group-hover:opacity-40 transition-opacity">
                {[3, 6, 4, 8, 5, 7, 4, 9, 5, 3, 6, 4, 7, 5, 8, 4, 6, 3, 5, 7].map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-0.5 rounded-full transition-colors',
                      isSelected ? 'bg-primary' : 'bg-foreground/40'
                    )}
                    style={{ height: `${h * 2}px` }}
                  />
                ))}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// Region Picker (区域框选 - 简化版)
// ============================================================

function RegionPicker({
  regions,
  onChange,
}: {
  regions: SelectedRegion[]
  onChange: (regions: SelectedRegion[]) => void
}) {
  const addRegion = () => {
    const newRegion: SelectedRegion = {
      id: `region-${Date.now()}`,
      x: 10,
      y: 10,
      width: 30,
      height: 20,
    }
    onChange([...regions, newRegion])
  }

  const removeRegion = (id: string) => {
    onChange(regions.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Crop className="h-3.5 w-3.5 text-muted-foreground" />
          水印区域
        </Label>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={addRegion}
          disabled={regions.length >= 5}
        >
          <Plus className="h-3 w-3" />
          添加区域
        </Button>
      </div>

      {regions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/20 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            点击"添加区域"框选水印位置，最多5个
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {regions.map((region, index) => (
            <div
              key={region.id}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card"
            >
              <Badge variant="secondary" className="text-[10px] shrink-0">
                区域{index + 1}
              </Badge>
              <div className="flex-1 grid grid-cols-4 gap-2">
                {(['x', 'y', 'width', 'height'] as const).map((field) => (
                  <div key={field} className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {field}
                    </span>
                    <Input
                      type="number"
                      value={region[field]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        onChange(
                          regions.map((r) =>
                            r.id === region.id ? { ...r, [field]: val } : r
                          )
                        )
                      }}
                      className="h-7 text-xs px-1.5"
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeRegion(region.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Param Field Renderer
// ============================================================

function ParamField({
  param,
  value,
  onChange,
}: {
  param: Agent['parameters'][number]
  value: any
  onChange: (value: any) => void
}) {
  // Voice selector special rendering
  if (
    param.id === 'voice' &&
    (param.label === '配音音色' || param.label.includes('音色'))
  ) {
    return <VoiceSelector value={String(value)} onChange={onChange} />
  }

  switch (param.type) {
    case 'select':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{param.label}</Label>
          <Select value={String(value)} onValueChange={onChange}>
            <SelectTrigger className="w-full h-10 rounded-xl border-border/60 bg-secondary/30 hover:bg-background transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'switch':
      return (
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
          <Label className="text-sm font-medium">{param.label}</Label>
          <Switch checked={!!value} onCheckedChange={onChange} />
        </div>
      )

    case 'slider':
      return (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">{param.label}</Label>
            <span className="inline-flex items-center justify-center min-w-[44px] h-6 px-2 text-xs font-semibold text-primary bg-primary/10 rounded-md tabular-nums">
              {value}
              {param.label === '音量' && '%'}
              {param.label === '语速' && 'x'}
            </span>
          </div>
          <Slider
            value={[Number(value)]}
            onValueChange={(vals) => onChange(vals[0])}
            min={param.min}
            max={param.max}
            step={param.step}
            className="w-full"
          />
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] text-muted-foreground tabular-nums">{param.min}{param.label === '音量' ? '%' : param.label === '语速' ? 'x' : ''}</span>
            <span className="text-[10px] text-muted-foreground tabular-nums">{param.max}{param.label === '音量' ? '%' : param.label === '语速' ? 'x' : ''}</span>
          </div>
        </div>
      )

    case 'text':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{param.label}</Label>
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-10"
          />
        </div>
      )

    default:
      return null
  }
}

// ============================================================
// Speech-to-Text Custom Input Area
// ============================================================

function SpeechToTextInputArea({
  agent,
  file,
  onFileChange,
  paramValues,
  onParamChange,
  error,
  isProcessing,
  progress,
  progressSteps,
  onStartProcess,
}: {
  agent: Agent
  file: File | null
  onFileChange: (file: File | null) => void
  paramValues: Record<string, any>
  onParamChange: (id: string, value: any) => void
  error?: string
  isProcessing?: boolean
  progress?: number
  progressSteps?: { label: string; status: 'pending' | 'running' | 'done' }[]
  onStartProcess?: () => void
}) {
  const [activeTab, setActiveTab] = useState<'file' | 'record'>('file')
  const [isDragging, setIsDragging] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) onFileChange(droppedFile)
    },
    [onFileChange]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null
      onFileChange(selectedFile)
      e.target.value = ''
    },
    [onFileChange]
  )

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
      onStartProcess?.()
    } else {
      setIsRecording(true)
      setRecordingSeconds(0)
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1)
      }, 1000)
    }
  }, [isRecording, onStartProcess])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const acceptedExtensions = agent.acceptedFiles?.join(',') || '*'
  const distinguishSpeaker = !!paramValues.distinguishSpeaker

  const renderUploadContent = () => (
    <div className="space-y-4">
      {/* Upload zone / loading zone */}
      {isProcessing ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">AI 正在转写中...</p>
            {progressSteps && progressSteps.length > 0 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {progressSteps.map((step, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full transition-colors',
                      step.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : step.status === 'running'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        </div>
      ) : file ? (
        <div className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
          <div className="flex items-center gap-3 p-3">
            <FileAudio className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onFileChange(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
            'bg-secondary/30',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/30 hover:bg-accent/50'
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-foreground mb-4">
            拖拽音视频文件到此处，或 <span className="text-primary font-medium">点击上传</span>
          </p>

          {/* Distinguish speaker toggle */}
          <div
            className="inline-flex items-center gap-2 mb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-muted-foreground">区分说话人</span>
            <Switch
              checked={distinguishSpeaker}
              onCheckedChange={(checked) => onParamChange('distinguishSpeaker', checked)}
            />
          </div>

          {/* File requirements */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileAudio className="h-3 w-3" />
              mp3/mp4/mov/webm/wav等30种格式
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span>视频 ≤ 4GB；音频 ≤ 500M</span>
            <span className="hidden sm:inline text-border">|</span>
            <span>时长 ≤ 5小时</span>
          </div>

          {/* Estimated cost */}
          <div className="absolute right-3 bottom-2 text-xs text-muted-foreground">
            预计消耗：
            <span className="font-semibold text-foreground">{agent.costPoints} 智点</span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={acceptedExtensions}
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}
    </div>
  )

  const renderRecorder = () => (
    <div className="space-y-4">
      {isProcessing ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">AI 正在转写中...</p>
            {progressSteps && progressSteps.length > 0 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {progressSteps.map((step, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full transition-colors',
                      step.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : step.status === 'running'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">预计耗时 {agent.avgProcessTime}</p>
        </div>
      ) : (
        <div className="relative border-2 border-dashed rounded-xl p-8 text-center bg-secondary/30 border-border">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all',
            isRecording ? 'bg-destructive/10 animate-pulse' : 'bg-primary/10'
          )}>
            {isRecording ? (
              <Mic className="h-6 w-6 text-destructive" />
            ) : (
              <Mic className="h-6 w-6 text-primary" />
            )}
          </div>
          <p className="text-sm text-foreground mb-4">
            {isRecording ? '正在录音...' : '点击开始实时录音转写'}
          </p>
          {isRecording && (
            <p className="text-2xl font-semibold text-primary tabular-nums mb-4">
              {formatTime(recordingSeconds)}
            </p>
          )}
          <Button
            type="button"
            variant={isRecording ? 'destructive' : 'default'}
            onClick={toggleRecording}
          >
            {isRecording ? '停止录音' : '开始录音'}
          </Button>

          {/* Distinguish speaker toggle */}
          <div
            className="flex items-center justify-center gap-2 mt-4 mb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-muted-foreground">区分说话人</span>
            <Switch
              checked={distinguishSpeaker}
              onCheckedChange={(checked) => onParamChange('distinguishSpeaker', checked)}
            />
          </div>

          {/* File requirements */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>视频 ≤ 4GB；音频 ≤ 500M</span>
            <span className="hidden sm:inline text-border">|</span>
            <span>时长 ≤ 5小时</span>
          </div>

          {/* Estimated cost */}
          <div className="absolute right-3 bottom-2 text-xs text-muted-foreground">
            预计消耗：
            <span className="font-semibold text-foreground">{agent.costPoints} 智点</span>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4 w-full">
      <Card className="border-border/60 shadow-sm overflow-hidden">
        {/* Tabs inside the upload card */}
        <div className="flex items-center justify-center p-2 border-b border-border/40 bg-secondary/30">
          <div className="flex items-center p-1 rounded-full bg-background border border-border/40">
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              disabled={isProcessing}
              className={cn(
                'py-1.5 px-6 rounded-full text-sm font-medium transition-all disabled:opacity-50',
                activeTab === 'file'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              上传文件
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('record')}
              disabled={isProcessing}
              className={cn(
                'py-1.5 px-6 rounded-full text-sm font-medium transition-all disabled:opacity-50',
                activeTab === 'record'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              实时录音
            </button>
          </div>
        </div>

        <CardContent className="p-4">
          {activeTab === 'file' ? renderUploadContent() : renderRecorder()}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function AgentInputArea({
  agent,
  file,
  text,
  paramValues,
  onFileChange,
  onTextChange,
  onParamChange,
  error,
  isProcessing,
  progress,
  progressSteps,
  onStartProcess,
}: AgentInputAreaProps) {
  const [regions, setRegions] = useState<SelectedRegion[]>([])

  // Determine if we should show quick fill bar
  const showQuickFill =
    agent.id === 'text-to-speech' || agent.id === 'topic-to-copywriting'

  // Determine if we should show region picker
  const showRegionPicker =
    agent.id === 'video-remove-watermark' &&
    paramValues.removeArea === 'manual'

  // Handle quick fill actions
  const handleQuickFill = useCallback(
    (actionId: string) => {
      if (actionId === 'random-story') {
        onTextChange('萤火虫的秘密\n深夜，九岁的阿布悄悄溜出外婆家，提着一盏熄灭的马灯走向神秘的黑森林。\n他想抓住传说中能实现愿望的"黄金萤火虫"，来治好外婆的眼睛。林子里静得只能听到他自己的心跳，微风吹过，树叶沙沙作响。突然，前方亮起了一团温暖的微光。那不是一只，而是成千上万只萤火虫聚在一起，宛如地上的银河。\n当它们围绕着阿布翩翩起舞时，阿布闭上眼睛，在心里虔诚地许愿。等他再次睁开眼，手里的马灯竟然自己亮了起来，散发出永不熄灭的柔和光芒。阿布开心地笑了，他捧着这盏希望之灯，朝着外婆家的方向飞奔而去。')
        return
      }
      if (actionId === 'pause') {
        const ta = document.getElementById('agent-input-textarea') as HTMLTextAreaElement | null
        if (ta) {
          const cursorPos = ta.selectionEnd ?? ta.value.length
          const before = text.slice(0, cursorPos)
          const after = text.slice(cursorPos)
          const newText = before + '((⏰=1s))' + after
          onTextChange(newText)
          requestAnimationFrame(() => {
            const newPos = cursorPos + '((⏰=1s))'.length
            ta.selectionStart = newPos
            ta.selectionEnd = newPos
            ta.focus()
          })
          return
        }
        onTextChange(text + '((⏰=1s))')
        return
      }
    },
    [text, onTextChange]
  )

  // AI写/翻译 状态
  const [aiWriteKeyword, setAiWriteKeyword] = useState('')
  const [aiWriteGenerating, setAiWriteGenerating] = useState(false)
  const [translateLang, setTranslateLang] = useState('zh-CN')
  const [translateOpen, setTranslateOpen] = useState(false)
  const [translateGenerating, setTranslateGenerating] = useState(false)

  const languageOptions = [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en' },
    { label: '繁體中文', value: 'zh-TW' },
    { label: 'Español', value: 'es' },
    { label: 'Português', value: 'pt' },
    { label: '日本語', value: 'ja' },
    { label: 'Français', value: 'fr' },
    { label: 'Deutsch', value: 'de' },
    { label: '한국어', value: 'ko' },
  ]

  const handleTranslateApply = () => {
    if (translateGenerating || !text.trim()) return
    setTranslateGenerating(true)
    setTranslateOpen(false)
    const mockTranslations: Record<string, string> = {
      'zh-CN': text,
      'en': '[English Translation]\n\n' + (text || 'No content to translate.'),
      'zh-TW': '【繁體中文翻譯】\n\n' + (text || '暫無內容可翻譯。'),
      'es': '[Traducción al Español]\n\n' + (text || 'No hay contenido para traducir.'),
      'pt': '[Tradução para Português]\n\n' + (text || 'Sem conteúdo para traduzir.'),
      'ja': '【日本語翻訳】\n\n' + (text || '翻訳するコンテンツがありません。'),
      'fr': '[Traduction Française]\n\n' + (text || 'Aucun contenu à traduire.'),
      'de': '[Deutsche Übersetzung]\n\n' + (text || 'Kein Inhalt zum Übersetzen.'),
      'ko': '[한국어 번역]\n\n' + (text || '번역할 내용이 없습니다.'),
    }
    setTimeout(() => {
      onTextChange(mockTranslations[translateLang] || text)
      setTranslateGenerating(false)
    }, 1200)
  }

  const handleAiWriteGenerate = () => {
    if (aiWriteGenerating || !aiWriteKeyword.trim()) return
    setAiWriteGenerating(true)
    setTimeout(() => {
      onTextChange(
        '【' + aiWriteKeyword + '】\n\n' +
        '针对"${keyword}"这一主题，我为您撰写了以下配音文案：\n\n'.replace('${keyword}', aiWriteKeyword) +
        '在这个快速迭代的时代，科技创新正以前所未有的速度改变着我们的生活。' +
        '从清晨智能闹钟的轻柔唤醒，到夜晚智能助手的贴心陪伴，科技已经融入了我们生命中的每一个角落。\n\n' +
        '想象一下，当你迈进家门的那一刻，灯光自动亮起，温度已经调整到最舒适的度数，' +
        '就连你最爱的音乐也已经在背景中轻轻流淌……这一切，不再是科幻电影中的场景，而是正在发生的现实。\n\n' +
        '让我们一起拥抱这个充满无限可能的智能时代，用科技的力量，去创造更美好的明天。'
      )
      setAiWriteGenerating(false)
    }, 1500)
  }

  // Handle txt upload for quick fill
  const handleTxtUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = e.target.files?.[0]
      if (uploadedFile) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          onTextChange((ev.target?.result as string) || '')
        }
        reader.readAsText(uploadedFile)
      }
      e.target.value = ''
    },
    [onTextChange]
  )

  // Custom input area for speech-to-text and video-to-text
  if (agent.id === 'speech-to-text' || agent.id === 'video-to-text') {
    return (
      <SpeechToTextInputArea
        agent={agent}
        file={file}
        onFileChange={onFileChange}
        paramValues={paramValues}
        onParamChange={onParamChange}
        error={error}
        isProcessing={isProcessing}
        progress={progress}
        progressSteps={progressSteps}
        onStartProcess={onStartProcess}
      />
    )
  }

  return (
    <div className="space-y-4 w-full">
      {/* === File Upload === */}
      {(agent.inputType === 'file' || agent.inputType === 'both') && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            上传文件
          </Label>
          <FileUploadZone
            acceptedFiles={agent.acceptedFiles}
            maxFileSize={agent.maxFileSize}
            file={file}
            onFileChange={onFileChange}
          />
        </div>
      )}

      {/* === Region Picker (for watermark removal) === */}
      {showRegionPicker && (
        <RegionPicker regions={regions} onChange={setRegions} />
      )}

      {/* === Text Input === */}
      {(agent.inputType === 'text' || agent.inputType === 'both') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              输入内容
            </Label>
            <span className={cn(
              'text-xs font-medium tabular-nums',
              text.length > 4500 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {text.length}/5000
            </span>
          </div>

          {/* Quick fill bar */}
          {showQuickFill && (
            <div className="flex items-center gap-1 flex-wrap p-1 rounded-xl bg-secondary/50 border border-border/40">
              {/* AI帮我写 — Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all">
                    <Wand2 className="h-3 w-3 text-muted-foreground" />
                    AI帮我写
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-72 p-0 overflow-hidden shadow-xl border-border/80">
                  <div className="p-4 space-y-3">
                    <Input value={aiWriteKeyword} onChange={(e) => setAiWriteKeyword(e.target.value)} placeholder="输入关键词，使用AI帮写生成完整故事内容" className="h-9 text-sm rounded-lg" onKeyDown={(e) => e.key === 'Enter' && handleAiWriteGenerate()} />
                    <Button className="w-full h-9 text-sm gap-2 rounded-lg" onClick={handleAiWriteGenerate} disabled={aiWriteGenerating}>
                      {aiWriteGenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />生成中...</> : (<><Sparkles className="h-3.5 w-3.5" />生成<span className="flex items-center gap-1 ml-1 text-xs font-normal opacity-70"><span className="w-px h-3 bg-primary-foreground/30" /><Zap className="h-3 w-3" />1</span></>)}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* 随机故事 */}
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all" onClick={() => handleQuickFill('random-story')}>
                <BookOpen className="h-3 w-3 text-muted-foreground" />
                随机故事
              </Button>

              {/* 上传txt */}
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all" onClick={() => document.getElementById('txt-upload')?.click()}>
                <FileText className="h-3 w-3 text-muted-foreground" />
                上传txt
              </Button>

              {/* 翻译 — Popover */}
              <Popover open={translateOpen} onOpenChange={setTranslateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all">
                    {translateGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3 text-muted-foreground" />}
                    翻译
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-56 p-0 overflow-hidden shadow-xl border-border/80">
                  <div className="p-3">
                    <div className="max-h-[220px] overflow-y-auto space-y-0.5 mb-3">
                      {languageOptions.map((lang) => (
                        <button key={lang.value} onClick={() => setTranslateLang(lang.value)} className={cn(
                          'w-full text-xs py-2 px-3 rounded-md text-left transition-colors',
                          translateLang === lang.value ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-secondary text-foreground'
                        )}>
                          {lang.label}
                        </button>
                      ))}
                    </div>
                    <Button className="w-full h-9 text-sm gap-2 rounded-lg" onClick={handleTranslateApply} disabled={translateGenerating}>
                      {translateGenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />翻译中...</> : (<><Languages className="h-3.5 w-3.5" />开始翻译<span className="flex items-center gap-1 ml-1 text-xs font-normal opacity-70"><span className="w-px h-3 bg-primary-foreground/30" /><Zap className="h-3 w-3" />2</span></>)}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* 插入停顿 */}
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all" onClick={() => handleQuickFill('pause')}>
                <Type className="h-3 w-3 text-muted-foreground" />
                插入停顿
              </Button>
            </div>
          )}
          <input
            id="txt-upload"
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleTxtUpload}
          />

          <Textarea
            id="agent-input-textarea"
            placeholder={
              agent.id === 'text-to-speech'
                ? '输入你想要的配音文案，AI 即刻生成带情感的自然人声…'
                : agent.id === 'topic-to-copywriting'
                  ? '输入主题或产品名称...'
                  : '请输入内容...'
            }
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            className="min-h-[160px] resize-none rounded-xl border-border/60 bg-secondary/30 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 transition-colors text-sm leading-relaxed"
          />
        </div>
      )}

      {/* === Parameters === */}
      {agent.parameters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest select-none">
              参数设置
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          <div className="space-y-4">
            {agent.parameters.map((param) => (
              <ParamField
                key={param.id}
                param={param}
                value={paramValues[param.id]}
                onChange={(value) => onParamChange(param.id, value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* === Error === */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
