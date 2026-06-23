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
    <div className="flex items-center gap-2 flex-wrap mb-3">
      {quickFillActions.map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 rounded-full border-border/80 hover:border-primary/40 hover:bg-accent"
            onClick={() => onAction(action.id)}
          >
            <Icon className="h-3 w-3" />
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
  { value: 'female-gentle', label: '女声-温柔', tag: '女声', desc: '温柔知性，适合有声读物', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { value: 'female-lively', label: '女声-活泼', tag: '女声', desc: '活泼俏皮，适合短视频', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { value: 'male-calm', label: '男声-沉稳', tag: '男声', desc: '沉稳大气，适合新闻播报', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'male-deep', label: '男声-磁性', tag: '男声', desc: '磁性低沉，适合广告配音', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { value: 'child', label: '童声', tag: '童声', desc: '天真可爱，适合儿童内容', color: 'bg-amber-50 border-amber-200 text-amber-700' },
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
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-1.5">
        <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
        配音音色
      </Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {voicePresets.map((voice) => {
          const isSelected = value === voice.value
          const isPlaying = playingVoice === voice.value
          return (
            <button
              key={voice.value}
              onClick={() => onChange(voice.value)}
              className={cn(
                'relative rounded-xl border p-3 text-left transition-all',
                'hover:shadow-sm',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Badge
                  variant="secondary"
                  className={cn('text-[10px] px-1.5 py-0', voice.color)}
                >
                  {voice.tag}
                </Badge>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePreview(voice.value)
                  }}
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                    isPlaying
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  {isPlaying ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3 ml-0.5" />
                  )}
                </button>
              </div>
              <p className="text-sm font-medium text-foreground">
                {voice.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {voice.desc}
              </p>
              {isSelected && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
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
          <Label className="text-sm font-medium">{param.label}</Label>
          <Select value={String(value)} onValueChange={onChange}>
            <SelectTrigger className="w-full h-10">
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{param.label}</Label>
            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
              {value}
              {param.label === '音量' && '%'}
              {param.label === '语速' && 'x'}
              {param.label === '音调' && ''}
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
      const fills: Record<string, string> = {
        'ai-write': '请帮我写一段关于人工智能改变生活的宣传文案，要求语言生动、有感染力，适合用于视频配音。',
        'random-story': '从前有一个小村庄，村里的人们过着平静的生活。直到有一天，一位旅行者带来了一个神秘的盒子...',
        'translate': text,
        pause: text + ' [停顿] ',
      }
      const newText = fills[actionId] || text
      onTextChange(newText)
    },
    [text, onTextChange]
  )

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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">
              输入内容
            </Label>
            <span className="text-xs text-muted-foreground">
              {text.length}/5000 字
            </span>
          </div>

          {/* Quick fill bar */}
          {showQuickFill && (
            <QuickFillBar
              onAction={(id) => {
                if (id === 'upload-txt') {
                  document.getElementById('txt-upload')?.click()
                } else {
                  handleQuickFill(id)
                }
              }}
            />
          )}
          <input
            id="txt-upload"
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleTxtUpload}
          />

          <Textarea
            placeholder={
              agent.id === 'text-to-speech'
                ? '输入要转成语音的文案...'
                : agent.id === 'topic-to-copywriting'
                  ? '输入主题或产品名称...'
                  : '请输入内容...'
            }
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            className="min-h-[140px] resize-none rounded-xl border-border focus-visible:ring-primary"
          />
        </div>
      )}

      {/* === Parameters === */}
      {agent.parameters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground font-medium">
              参数设置
            </span>
            <div className="h-px flex-1 bg-border" />
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
