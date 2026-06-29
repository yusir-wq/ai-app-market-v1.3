'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import type { AgentResultDetail } from '@/lib/mock-result-data'
import type { Agent } from '@/lib/mock-data'
import type { StoryboardShot } from '@/components/agent/agent-result-area'
import {
  ArrowLeft,
  Download,
  FileText,
  FileAudio,
  FileVideo,
  FileImage,
  CheckCircle2,
  Copy,
  Clock,
  Zap,
  Play,
  Pause,
  Volume2,
  ImagePlus,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Calendar,
  Globe,
  Users,
  ListTodo,
  Hash,
  Pencil,
  Save,
  RotateCw,
  Loader2,
  Settings2,
  Wand2,
  BookOpen,
  Type,
  Music,
  X,
  Eraser,
  Trash2,
  Clapperboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AgentResultDetailViewProps {
  result: AgentResultDetail
  agent: Agent
  fileName?: string | null
  onBack: () => void
  onGenerateVideo?: (text: string, taskName: string) => void
}

// ============================================================
// 头部信息条
// ============================================================

function ResultHeader({ result, agent, fileName }: { result: AgentResultDetail; agent: Agent; fileName?: string | null }) {
  const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    text: { label: '文本结果', icon: <FileText className="h-4 w-4" /> },
    audio: { label: '音频结果', icon: <FileAudio className="h-4 w-4" /> },
    video: { label: '视频结果', icon: <FileVideo className="h-4 w-4" /> },
    image: { label: '图片结果', icon: <FileImage className="h-4 w-4" /> },
    storyboard: { label: '分镜脚本', icon: <Sparkles className="h-4 w-4" /> },
  }
  const info = typeLabels[result.type] || typeLabels.text

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-primary">{info.icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground">{fileName || result.taskName}</h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50">
              <CheckCircle2 className="h-3 w-3 mr-1" />已完成
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />{result.costPoints} 智点
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-sky-500" />{result.processTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />{result.createdAt}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 1. 语音转文字 — 说话人分段 + 原文 + 智能总结
// ============================================================

function AudioPlayer({ url }: { url?: string }) {
  return (
    <div className="flex items-center gap-3">
      {url && (
        <audio
          src={url}
          controls
          className="w-full h-8"
          onPlay={() => {}}
          onPause={() => {}}
        />
      )}
    </div>
  )
}

function SpeechToTextResult({ result }: { result: AgentResultDetail }) {
  const [copied, setCopied] = useState(false)
  const [summaryCopied, setSummaryCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(result.textContent || '')
  const [segments, setSegments] = useState(result.segments || [])

  const fullText = result.segments && result.segments.length > 0
    ? result.segments.map((s) => s.text).join('\n')
    : result.textContent || ''

  const handleCopy = () => {
    const textToCopy = isEditing ? editedText : fullText
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopySummary = () => {
    navigator.clipboard.writeText(result.summary || '')
    setSummaryCopied(true)
    setTimeout(() => setSummaryCopied(false), 2000)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    if (result.segments && result.segments.length > 0) {
      // 编辑模式下保存：简单将整个文本作为第一个 segment，其余清空
      const lines = editedText.split('\n').filter((l) => l.trim())
      setSegments(
        lines.map((text, i) => ({
          id: `seg-${i}`,
          speaker: segments[i]?.speaker || '说话人1',
          startTime: segments[i]?.startTime || '00:00',
          endTime: segments[i]?.endTime || '00:00',
          text,
        }))
      )
    }
  }

  const displaySegments = result.segments && result.segments.length > 0 ? segments : []

  return (
    <>
      {/* 两栏布局：桌面端左右分栏，移动端垂直堆叠 */}
      <div className="flex flex-col lg:flex-row gap-3 lg:h-[calc(100vh-220px)] lg:min-h-[500px]">
        {/* 左侧：转写内容 */}
        <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col min-h-0">
          <Card className="flex flex-col h-auto lg:h-full border border-border/40 shadow-sm bg-card overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              {/* 工具栏 */}
              <div className="flex items-center justify-between gap-1 px-3 py-2 shrink-0">
                <h3 className="text-sm font-semibold">AI转写内容</h3>
                <div className="flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (isEditing) {
                            handleSaveEdit()
                          } else {
                            setEditedText(displaySegments.length > 0 ? displaySegments.map((s) => s.text).join('\n') : fullText)
                            setIsEditing(true)
                          }
                        }}
                      >
                        {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isEditing ? '保存' : '编辑'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                        {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{copied ? '已复制' : '复制'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>导出TXT</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* 转写内容区 */}
              <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-2 max-h-[50vh] lg:max-h-none">
                {isEditing ? (
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-full resize-none text-sm leading-relaxed"
                  />
                ) : displaySegments.length > 0 ? (
                  <div className="space-y-2">
                    {displaySegments.map((seg) => (
                      <div key={seg.id} className="p-2.5 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[10px]">{seg.speaker}</Badge>
                          <span className="text-[11px] text-muted-foreground font-mono">{seg.startTime} - {seg.endTime}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{seg.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{fullText}</pre>
                    </div>
                  </div>
                )}
              </div>

              {/* 底部音频播放器 */}
              <div className="px-3 pb-2 pt-1 shrink-0">
                <AudioPlayer url={result.audioUrl} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：智能总结 */}
        <div className="w-full lg:w-80 lg:shrink-0 flex flex-col min-h-0">
          <Card className="flex flex-col h-auto lg:h-full border border-border/40 shadow-sm bg-card overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="flex items-center justify-between gap-2 px-3 py-2 shrink-0">
                <h3 className="text-sm font-semibold">智能总结</h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="重新生成">
                    <RotateCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="复制" onClick={handleCopySummary}>
                    {summaryCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 max-h-[40vh] lg:max-h-none">
                {result.summary ? (
                  <div className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{result.summary}</div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">暂无智能总结</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// ============================================================
// 2. 文字转语音 — 与使用应用页面一致的左右布局
// ============================================================

const voicePresets = [
  {
    value: 'female-gentle', label: '温柔女声', tag: '女声',
    desc: '温暖知性，情感细腻，适合有声读物、产品解说',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  {
    value: 'female-lively', label: '活泼女声', tag: '女声',
    desc: '俏皮灵动，元气满满，适合短视频、带货广告',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  {
    value: 'male-calm', label: '沉稳男声', tag: '男声',
    desc: '大气稳重，字正腔圆，适合新闻播报、品牌视频',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    value: 'male-deep', label: '磁性男声', tag: '男声',
    desc: '低沉醇厚，感染力强，适合广告配音、播客开场',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  {
    value: 'child', label: '可爱童声', tag: '童声',
    desc: '天真烂漫，自然灵动，适合儿童内容、在线教育',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
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
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">声音参数设置</span>
        </div>
      </div>
      <div className="p-4 space-y-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">语速</Label>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md tabular-nums">{speed}x</span>
          </div>
          <Slider value={[speed]} onValueChange={(vals) => onSpeedChange(vals[0])} min={0.5} max={2.0} step={0.1} className="w-full" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground"><span>0.5x 慢速</span><span>2.0x 快速</span></div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">音调</Label>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md tabular-nums">{pitch > 0 ? `+${pitch}` : pitch}</span>
          </div>
          <Slider value={[pitch]} onValueChange={(vals) => onPitchChange(vals[0])} min={-10} max={10} step={1} className="w-full" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground"><span>-10 低沉</span><span>+10 高亢</span></div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">音量</Label>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md tabular-nums">{volume}%</span>
          </div>
          <Slider value={[volume]} onValueChange={(vals) => onVolumeChange(vals[0])} min={50} max={150} step={10} className="w-full" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground"><span>50%</span><span>150%</span></div>
        </div>
      </div>
    </PopoverContent>
  )
}

function VoiceResultRow({
  voice, isSelected, isPlaying, onSelect, onTogglePlay,
  speed, pitch, volume, onSpeedChange, onPitchChange, onVolumeChange,
}: {
  voice: typeof voicePresets[number]
  isSelected: boolean; isPlaying: boolean
  onSelect: () => void; onTogglePlay: () => void
  speed: number; pitch: number; volume: number
  onSpeedChange: (v: number) => void; onPitchChange: (v: number) => void; onVolumeChange: (v: number) => void
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <div onClick={onSelect} className={cn(
      'group flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200',
      isSelected ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/25 shadow-sm' : 'border-border/50 bg-card hover:border-primary/20 hover:bg-accent/30'
    )}>
      {/* Voice info - left side, always visible */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn('text-sm font-semibold transition-colors', isSelected ? 'text-primary' : 'text-foreground')}>{voice.label}</span>
          <span className={cn('inline-flex items-center rounded-md px-1.5 py-px text-[10px] font-medium border', voice.color)}>{voice.tag}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed truncate">{voice.desc}</p>
      </div>
      {isPlaying && (
        <div className="flex items-end gap-px h-4 opacity-60 shrink-0">
          {[3, 6, 4, 8, 5, 7, 4].map((h, i) => (
            <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}
      {/* Buttons - right side, hidden by default, shown on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <button onClick={(e) => { e.stopPropagation(); setSettingsOpen(!settingsOpen) }} className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
              settingsOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}>
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <VoiceSettingsPopover speed={speed} pitch={pitch} volume={volume} onSpeedChange={onSpeedChange} onPitchChange={onPitchChange} onVolumeChange={onVolumeChange} />
        </Popover>
        <button onClick={(e) => { e.stopPropagation(); onTogglePlay() }} className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
          isPlaying ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
        )}>
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>
      </div>
    </div>
  )
}

function TextToSpeechResult({ result, agent }: { result: AgentResultDetail; agent: Agent }) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [text, setText] = useState(result.sourceText || '')
  const [paramValues, setParamValues] = useState<Record<string, any>>(() => ({
    voice: result.params?.voice || 'female-gentle',
    speed: result.params?.speed ?? 1.0,
    pitch: result.params?.pitch ?? 0,
    volume: result.params?.volume ?? 100,
    bgm: result.params?.bgm || 'none',
  }))
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>()

  const currentVoice = paramValues.voice || 'female-gentle'
  const currentSpeed = paramValues.speed ?? 1.0
  const currentPitch = paramValues.pitch ?? 0
  const currentVolume = paramValues.volume ?? 100
  const currentBgm = paramValues.bgm || 'none'

  const togglePreview = (voiceValue: string) => {
    if (playingVoice === voiceValue) { setPlayingVoice(null) }
    else { setPlayingVoice(voiceValue); setTimeout(() => setPlayingVoice(null), 2000) }
  }

  const handleParamChange = (id: string, value: any) => {
    setParamValues((prev) => ({ ...prev, [id]: value }))
  }

  const handleRegenerate = () => {
    if (!text.trim()) { setError('请输入内容'); return }
    if (text.length > 5000) { setError('内容不能超过5000字'); return }
    setError(undefined)
    setIsProcessing(true)
    // Mock re-processing
    setTimeout(() => {
      setIsProcessing(false)
      toast.success('已重新生成语音，请试听新音频')
    }, 2500)
  }

  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* ========================================== */}
      {/* LEFT: 输入内容 + 音频播放器                              */}
      {/* ========================================== */}
      <div className="flex-1 min-w-0">
        <Card className="border-border/60 shadow-sm overflow-hidden h-full">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI语音合成结果</p>
                  <p className="text-xs text-muted-foreground">可继续编辑文案并重新生成</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                      {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{copied ? '已复制' : '复制文案'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>下载音频</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Editable source text */}
            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">输入内容</span>
                <span className={cn('text-xs font-medium tabular-nums ml-auto', text.length > 4500 ? 'text-destructive' : 'text-muted-foreground')}>
                  {text.length}/5000
                </span>
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[180px] resize-none rounded-xl border-border/40 bg-secondary/10 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 text-sm leading-relaxed placeholder:text-muted-foreground/50"
                disabled={isProcessing}
              />
            </div>

            {/* Generated Audio Player */}
            <div className="px-5 pb-5">
              <div className="rounded-xl overflow-hidden border border-emerald-200/60 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-emerald-950/10">
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Static audio icon, no interaction */}
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 dark:bg-emerald-900/40">
                      <FileAudio className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{result.audioFileName || '生成的音频'}</p>
                      {result.audioInfo?.voiceName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{result.audioInfo.voiceName}</p>
                      )}
                    </div>
                  </div>
                  {result.audioUrl && <audio src={result.audioUrl} controls className="w-full mt-3" />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================== */}
      {/* RIGHT: 配音音色 + 背景音乐 + 重新生成按钮                   */}
      {/* ========================================== */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">
          {/* 配音音色 Card */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">配音音色</p>
                <p className="text-xs text-muted-foreground">替换配音音色重新生成</p>
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              {voicePresets.map((voice) => (
                <VoiceResultRow
                  key={voice.value}
                  voice={voice}
                  isSelected={currentVoice === voice.value}
                  isPlaying={playingVoice === voice.value}
                  onSelect={() => handleParamChange('voice', voice.value)}
                  onTogglePlay={() => togglePreview(voice.value)}
                  speed={currentSpeed} pitch={currentPitch} volume={currentVolume}
                  onSpeedChange={(v) => handleParamChange('speed', v)}
                  onPitchChange={(v) => handleParamChange('pitch', v)}
                  onVolumeChange={(v) => handleParamChange('volume', v)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 背景音乐 */}
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Music className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">背景音乐</p>
                <p className="text-xs text-muted-foreground">更换背景音乐重新生成</p>
              </div>
            </div>
            <div className="p-4">
              <Select value={currentBgm} onValueChange={(v) => handleParamChange('bgm', v)}>
                <SelectTrigger disabled={isProcessing} className="w-full h-11 rounded-xl border-border/60 bg-secondary/20 hover:bg-secondary/30 transition-colors">
                  <Music className="h-4 w-4 text-muted-foreground mr-2" />
                  <SelectValue placeholder="选择背景音乐" />
                </SelectTrigger>
                <SelectContent>
                  {bgmOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span>{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 重新生成按钮 */}
        <Button
          className="w-full h-12 text-base font-semibold gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5"
          size="lg"
          onClick={handleRegenerate}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              重新生成中...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              重新生成
              <span className="flex items-center gap-1 ml-1 text-xs font-normal opacity-80">
                <span className="w-px h-3 bg-primary-foreground/30" />
                <Zap className="h-3 w-3" />
                {agent.costPoints} 智点
              </span>
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <span className="text-xs">⚠</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// 3. AI音视频总结 — 要点 + 待办 + 关键词
// ============================================================

function AudioVideoSummaryResult({ result }: { result: AgentResultDetail }) {
  return (
    <div className="space-y-4">
      {/* 核心要点 */}
      {result.keyPoints && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold">核心要点</h3>
            </div>
            <div className="space-y-2">
              {result.keyPoints.map((kp, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-medium flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-foreground leading-relaxed">{kp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 待办事项 */}
      {result.actionItems && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <ListTodo className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold">待办事项</h3>
            </div>
            <div className="space-y-2">
              {result.actionItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded border border-border flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-sm bg-transparent" />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 关键词 */}
      {result.keywords && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
                <Hash className="h-3.5 w-3.5 text-violet-600" />
              </div>
              <h3 className="text-sm font-semibold">关键词</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.keywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-[11px]">{kw}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 完整摘要 */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">完整摘要</h3>
          </div>
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-secondary/20 rounded-lg p-4">{result.textContent}</pre>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// 4. 视频去水印 — 处理前后对比
// ============================================================

function VideoRemoveWatermarkResult({ result }: { result: AgentResultDetail }) {
  const [viewMode, setViewMode] = useState<'before' | 'after'>('after')

  return (
    <div className="space-y-4">
      {/* 切换按钮 */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        <Button variant={viewMode === 'after' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setViewMode('after')}>
          <CheckCircle2 className="h-3 w-3 mr-1" />处理后
        </Button>
        <Button variant={viewMode === 'before' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setViewMode('before')}>
          原始视频
        </Button>
      </div>

      {/* 视频对比 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={cn('space-y-2', viewMode === 'before' && 'md:col-span-2')}>
          <p className="text-xs text-muted-foreground font-medium">原始视频</p>
          <div className="rounded-xl overflow-hidden border border-border bg-black">
            {result.beforeVideoUrl && <video controls className="w-full max-h-[300px]"><source src={result.beforeVideoUrl} /></video>}
          </div>
        </div>
        <div className={cn('space-y-2', viewMode === 'after' && 'md:col-span-2')}>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />处理后
          </p>
          <div className="rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-900/50 bg-black">
            {result.videoUrl && <video controls className="w-full max-h-[300px]"><source src={result.videoUrl} /></video>}
          </div>
        </div>
      </div>

      {/* 视频信息 */}
      {result.videoInfo && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '分辨率', value: result.videoInfo.resolution },
            { label: '时长', value: result.videoInfo.duration },
            { label: '格式', value: result.videoInfo.format },
            { label: '帧率', value: result.videoInfo.frameRate },
          ].map((s) => (
            <div key={s.label} className="p-2 rounded-lg bg-secondary/20 border border-border/50 text-center">
              <p className="text-sm font-semibold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10"><Download className="h-4 w-4 mr-2" />下载视频</Button>
        <Button variant="outline" className="flex-1 h-10"><Copy className="h-4 w-4 mr-2" />复制链接</Button>
      </div>
    </div>
  )
}

// ============================================================
// 5. 视频配字幕 — 左右布局：视频预览 + 字幕列表
// ============================================================

function VideoSubtitleResult({ result }: { result: AgentResultDetail }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [langMode, setLangMode] = useState<'bilingual' | 'original' | 'translated'>('bilingual')
  const [subtitles, setSubtitles] = useState(result.subtitleTracks?.map(t => ({
    ...t,
    translatedText: t.translatedText || '',
  })) || [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
      else { videoRef.current.pause(); setIsPlaying(false) }
    }
  }
  const ft = (t: number) => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` }
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value); setCurrentTime(t)
    if (videoRef.current) videoRef.current.currentTime = t
  }
  const startEdit = (idx: number, text: string) => { setEditingIdx(idx); setEditingText(text) }
  const saveEdit = () => {
    if (editingIdx !== null) {
      setSubtitles(prev => prev.map((s, i) => i === editingIdx ? { ...s, translatedText: editingText } : s))
      setEditingIdx(null)
    }
  }
  const deleteSub = (idx: number) => { setSubtitles(prev => prev.filter((_, i) => i !== idx)) }

  // Find active subtitle
  const activeSub = subtitles.find(s => {
    const [sh, sm, ss] = s.startTime.split(':').map(Number)
    const [eh, em, es] = s.endTime.split(':').map(Number)
    return currentTime >= sh * 3600 + sm * 60 + ss && currentTime <= eh * 3600 + em * 60 + es
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT: Video with subtitle overlay */}
      <div className="flex flex-col gap-3">
        <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col">
          <div className="relative bg-black">
            {result.videoUrl && (
              <video ref={videoRef} src={result.videoUrl} className="w-full aspect-video"
                onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
                onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
                onEnded={() => setIsPlaying(false)} />
            )}
            {/* Subtitle overlay */}
            {activeSub && (
              <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
                {(langMode === 'bilingual' || langMode === 'original') && (
                  <p className="text-white text-sm font-medium drop-shadow-lg bg-black/50 px-3 py-1 rounded">{activeSub.text}</p>
                )}
                {(langMode === 'bilingual' || langMode === 'translated') && activeSub.translatedText && (
                  <p className="text-yellow-300 text-xs drop-shadow-lg bg-black/50 px-3 py-0.5 rounded">{activeSub.translatedText}</p>
                )}
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
              </div>
              {result.videoUrl && (
                <a href={result.videoUrl} download={result.videoFileName || 'subtitle-video.mp4'}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
                    <Download className="h-3 w-3" />下载视频
                  </Button>
                </a>
              )}
            </div>
          </div>
        </Card>
        <div className="flex items-center gap-2 px-1">
          <FileVideo className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{result.videoFileName || 'subtitle-video.mp4'}</span>
        </div>
      </div>

      {/* RIGHT: Subtitle list */}
      <div className="flex flex-col gap-3">
        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Type className="h-3 w-3" />字幕样式</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Globe className="h-3 w-3" />查找/替换</Button>
          <div className="flex rounded-lg bg-secondary/50 p-0.5 gap-0.5 ml-auto">
            <button onClick={() => setLangMode('original')} className={cn('h-7 text-[11px] px-2 rounded transition-colors', langMode === 'original' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>原文</button>
            <button onClick={() => setLangMode('translated')} className={cn('h-7 text-[11px] px-2 rounded transition-colors', langMode === 'translated' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>译文</button>
            <button onClick={() => setLangMode('bilingual')} className={cn('h-7 text-[11px] px-2 rounded transition-colors', langMode === 'bilingual' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>双语</button>
          </div>
        </div>

        {/* Subtitle list */}
        <Card className="border-border/60 shadow-sm flex-1">
          <CardContent className="p-4 max-h-[420px] overflow-y-auto">
            <div className="space-y-2">
              {subtitles.map((sub, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{sub.startTime} - {sub.endTime}</span>
                    <div className="flex items-center gap-0.5">
                      {editingIdx === idx ? (
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5 text-emerald-600" onClick={saveEdit}>保存</Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5" onClick={() => startEdit(idx, sub.translatedText)}>编辑</Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteSub(idx)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{sub.text}</p>
                  {editingIdx === idx ? (
                    <input className="w-full mt-1 text-sm border border-border rounded px-2 py-1 bg-background" value={editingText}
                      onChange={e => setEditingText(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter') saveEdit() }} />
                  ) : (
                    <p className="text-sm font-medium text-primary">{sub.translatedText}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-11 gap-2">
          <Download className="h-4 w-4" />导出字幕文件（SRT）
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// 6. 文案生成视频 — 视频 + 源文案
// ============================================================

function CopywritingToVideoResult({ result }: { result: AgentResultDetail }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden border border-border bg-black">
        {result.videoUrl && <video controls className="w-full max-h-[350px]"><source src={result.videoUrl} /></video>}
      </div>

      {result.videoInfo && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '分辨率', value: result.videoInfo.resolution },
            { label: '时长', value: result.videoInfo.duration },
            { label: '格式', value: result.videoInfo.format },
            { label: '帧率', value: result.videoInfo.frameRate },
          ].map((s) => (
            <div key={s.label} className="p-2 rounded-lg bg-secondary/20 border border-border/50 text-center">
              <p className="text-sm font-semibold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {result.sourceText && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">源文案</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/30 rounded-lg p-3">{result.sourceText}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10"><Download className="h-4 w-4 mr-2" />下载视频</Button>
        <Button variant="outline" className="flex-1 h-10"><RefreshCw className="h-4 w-4 mr-2" />重新生成</Button>
      </div>
    </div>
  )
}

// ============================================================
// 7. 视频配音 — 新设计：视频+字幕+音频
// ============================================================

function VideoDubbingResult({ result }: { result: AgentResultDetail }) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after')
  const videoRef = useRef<HTMLVideoElement>(null)

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

  // Find active subtitle
  const activeSub = result.subtitleTracks?.find(s => {
    const [sh, sm, ss] = s.startTime.split(':').map(Number)
    const [eh, em, es] = s.endTime.split(':').map(Number)
    return currentTime >= sh * 3600 + sm * 60 + ss && currentTime <= eh * 3600 + em * 60 + es
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT: Video with subtitles */}
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
            <video ref={videoRef} src={result.videoUrl} className="w-full aspect-video"
              onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
              onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
              onEnded={() => setIsPlaying(false)} />
            {/* Subtitle overlay — only in 处理后 mode */}
            {viewMode === 'after' && activeSub && (
              <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
                <p className="text-white text-sm font-medium drop-shadow-lg bg-black/50 px-3 py-1 rounded">{activeSub.text}</p>
                <p className="text-yellow-300 text-xs drop-shadow-lg bg-black/50 px-3 py-0.5 rounded">{activeSub.translatedText}</p>
              </div>
            )}
            {/* Dubbing badge */}
            {viewMode === 'after' && (
              <div className="absolute top-3 left-3 bg-green-600 text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
                <Volume2 className="h-3 w-3" /> 已配音
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
              <a href={result.videoUrl} download={result.videoFileName || 'dubbed-video.mp4'}>
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
                  <Download className="h-3 w-3" />下载配音视频
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* File name */}
        <div className="flex items-center gap-2 px-1">
          <FileVideo className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{result.videoFileName || 'dubbed-video.mp4'}</span>
        </div>

        {/* Audio player */}
        {result.audioUrl && (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">AI配音音频</span>
                  <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                    {result.audioInfo?.voiceName} · {result.audioInfo?.duration}
                  </span>
                </div>
                <a href={result.audioUrl} download={result.audioFileName}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
                    <Download className="h-3 w-3" />下载
                  </Button>
                </a>
              </div>
              <audio src={result.audioUrl} controls className="w-full h-8" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* RIGHT: Subtitle list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">字幕内容</h3>
          <div className="flex rounded-lg bg-secondary/50 p-0.5 gap-0.5">
            <button className="h-7 text-[11px] px-2 rounded bg-background shadow-sm">双语</button>
            <button className="h-7 text-[11px] px-2 rounded text-muted-foreground">原文</button>
            <button className="h-7 text-[11px] px-2 rounded text-muted-foreground">译文</button>
          </div>
        </div>
        <Card className="border-border/60 shadow-sm flex-1">
          <CardContent className="p-3 max-h-[420px] overflow-y-auto">
            <div className="space-y-2">
              {result.subtitleTracks?.map((s, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/50 bg-card">
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{s.startTime} - {s.endTime}</span>
                  <p className="text-sm text-muted-foreground mt-1">{s.text}</p>
                  <p className="text-sm font-medium text-primary">{s.translatedText}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Params info */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="text-muted-foreground">配音音色：<span className="text-foreground font-medium">{result.audioInfo?.voiceName}</span></span>
              <span className="text-muted-foreground">语速：<span className="text-foreground font-medium">1.0x</span></span>
              <span className="text-muted-foreground">消耗：<span className="text-foreground font-medium">{result.costPoints} 智点</span></span>
              <span className="text-muted-foreground">耗时：<span className="text-foreground font-medium">{result.processTime}</span></span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================
// 8. AI视频去水印 — 视频 + 处理详情
// ============================================================

function VideoWatermarkRemovalResult({ result }: { result: AgentResultDetail }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after')

  const ft = (t: number) => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` }
  const togglePlay = () => {
    if (videoRef.current) { if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) } else { videoRef.current.pause(); setIsPlaying(false) } }
  }
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => { const t = parseFloat(e.target.value); setCurrentTime(t); if (videoRef.current) videoRef.current.currentTime = t }

  const params = result.params || {}
  const fillModeLabel = params.fillMode === 'ai-inpaint' ? 'AI智能填充' : params.fillMode === 'blur' ? '模糊处理' : '纯色填充'
  const regionCount = params.regions?.length || 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <div className="relative bg-black">
            <div className="absolute top-3 right-3 z-10 flex rounded-lg bg-black/50 p-0.5 gap-0.5">
              <button onClick={() => setViewMode('before')} className={cn('px-3 py-1 rounded-md text-[11px] font-medium transition-all', viewMode === 'before' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80')}>处理前</button>
              <button onClick={() => setViewMode('after')} className={cn('px-3 py-1 rounded-md text-[11px] font-medium transition-all', viewMode === 'after' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80')}>处理后</button>
            </div>
            {result.videoUrl && <video ref={videoRef} src={result.videoUrl} className="w-full aspect-video" onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)} onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)} onEnded={() => setIsPlaying(false)} />}
            {viewMode === 'after' && <div className="absolute top-3 left-3 bg-green-600 text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1"><Eraser className="h-3 w-3" />已去除</div>}
          </div>
          <div className="p-3 space-y-2 border-t border-border/40 bg-secondary/20">
            <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-10">{ft(currentTime)}</span><input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" /><span className="text-xs text-muted-foreground w-10 text-right">{duration ? ft(duration) : '00:00'}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={togglePlay}>{isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</Button></div>{result.videoUrl && <a href={result.videoUrl} download={result.videoFileName || 'clean-video.mp4'}><Button variant="outline" size="sm" className="h-7 text-[11px] gap-1"><Download className="h-3 w-3" />下载去水印视频</Button></a>}</div>
          </div>
        </Card>
        <div className="flex items-center gap-2 px-1"><FileVideo className="h-4 w-4 text-primary shrink-0" /><span className="text-sm font-medium text-foreground truncate">{result.videoFileName || 'clean-video.mp4'}</span></div>
      </div>
      <div className="flex flex-col gap-3">
        <Card className="border-border/60 shadow-sm"><CardContent className="p-4 space-y-3"><h3 className="text-sm font-semibold text-foreground mb-3">处理详情</h3><div className="grid grid-cols-2 gap-3"><div className="p-3 rounded-lg bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">去除模式</p><p className="text-sm font-medium text-foreground mt-0.5">{params.removalMode === 'smart' ? '智能识别' : '手动框选'}</p></div><div className="p-3 rounded-lg bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">填充方式</p><p className="text-sm font-medium text-foreground mt-0.5">{fillModeLabel}</p></div><div className="p-3 rounded-lg bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">框选区域</p><p className="text-sm font-medium text-foreground mt-0.5">{regionCount} 个</p></div><div className="p-3 rounded-lg bg-secondary/30"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">消耗</p><p className="text-sm font-medium text-foreground mt-0.5">{result.costPoints} 智点</p></div></div><div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /><span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">处理完成</span></div><p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">AI已成功去除指定区域的水印/字幕，视频画面已智能填充修复。</p></div></CardContent></Card>
      </div>
    </div>
  )
}

// ============================================================
// 9. AI生成视频文案 — 视频脚本 + 关键词
// ============================================================

function TopicToCopywritingResult({ result, onGenerateVideo }: { result: AgentResultDetail; onGenerateVideo?: (text: string, taskName: string) => void }) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(result.textContent || '')

  const handleCopy = () => {
    const keywordLine = result.videoKeywords?.join(' ') || ''
    const text = `${isEditing ? editedText : result.textContent || ''}\n\n${keywordLine}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('已复制全部文案及关键词')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportTxt = () => {
    const keywordLine = result.videoKeywords?.join(' ') || ''
    const text = `${isEditing ? editedText : result.textContent || ''}\n\n${keywordLine}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.taskName || '视频文案'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('已导出为 TXT 文件')
  }

  const handleGenerateVideo = () => {
    const sourceText = isEditing ? editedText : (result.textContent || '')
    onGenerateVideo?.(sourceText, result.taskName || '')
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    toast.success('文案已保存')
  }

  return (
    <div>
      {/* 视频脚本 + 关键词 合一卡片 */}
      <Card className="border-border/60 shadow-sm overflow-hidden gap-0">
        {/* Header + 工具栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-secondary/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">生成结果 — {result.taskName}</p>
              <p className="text-xs text-muted-foreground">
                AI 已根据主题生成完整视频脚本及推荐关键词
              </p>
            </div>
          </div>
          {/* 工具栏按钮 */}
          <div className="flex items-center gap-1 shrink-0 ml-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (isEditing) {
                      handleSaveEdit()
                    } else {
                      setEditedText(result.textContent || '')
                      setIsEditing(true)
                    }
                  }}
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isEditing ? '保存' : '编辑'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? '已复制' : '复制全文'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExportTxt}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>导出 TXT</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-xs gap-1.5 rounded-lg"
                  onClick={handleGenerateVideo}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  生成视频
                </Button>
              </TooltipTrigger>
              <TooltipContent>基于脚本生成视频</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 脚本内容区 */}
        <CardContent className="p-0">
          {isEditing ? (
            <div className="px-5 pb-0">
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[280px] resize-none rounded-xl border-border/40 bg-secondary/10 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 text-sm leading-relaxed"
              />
            </div>
          ) : (
            <div className="px-5 pb-0">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-secondary/10 rounded-xl py-4 px-0 max-h-[60vh] overflow-y-auto">
                {result.textContent}
              </pre>
            </div>
          )}

          {/* 视频关键词 */}
          {result.videoKeywords && result.videoKeywords.length > 0 && (
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Hash className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">视频关键词</span>
                <span className="text-[10px] text-muted-foreground">推荐标签，可直接用于视频发布</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.videoKeywords.map((kw, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/25 hover:bg-primary/15 transition-colors cursor-default"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// 9. 文案生成视频(高级) — 分镜脚本 + 视频预览
// ============================================================

const DEMO_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4'

function CopywritingToVideoAdvancedResult({ 
  result, 
  showVideoResult = false 
}: { 
  result: AgentResultDetail
  showVideoResult?: boolean  // 是否直接显示合成视频结果页（从历史任务进入时为true）
}) {
  const initialShots = result.storyboard || []
  const [shots, setShots] = useState<StoryboardShot[]>(initialShots)
  const [activeShotId, setActiveShotId] = useState<string>(initialShots[0]?.id || '')
  const [editingShotId, setEditingShotId] = useState<string | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [composingProgress, setComposingProgress] = useState(0)
  const [showFinalVideo, setShowFinalVideo] = useState(showVideoResult) // 根据参数初始化
  const [composedVideoUrl, setComposedVideoUrl] = useState<string>(DEMO_VIDEO_URL)
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  const activeShot = shots.find((s) => s.id === activeShotId) || shots[0]
  const activeIndex = shots.findIndex((s) => s.id === activeShotId)

  const handleCaptionChange = (id: string, caption: string) => {
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, caption } : s)))
  }

  const handleDeleteShot = (id: string) => {
    setShots((prev) => {
      const filtered = prev.filter((s) => s.id !== id)
      if (activeShotId === id && filtered.length > 0) {
        setActiveShotId(filtered[0].id)
      }
      return filtered.map((s, idx) => ({ ...s, index: idx + 1 }))
    })
    toast.success('已删除分镜')
  }

  const handleCopySourceText = () => {
    if (result.sourceText) {
      navigator.clipboard.writeText(result.sourceText)
      toast.success('文案已复制')
    }
  }

  const handleCompose = () => {
    setIsComposing(true)
    setComposingProgress(0)
    
    // 模拟进度
    const interval = setInterval(() => {
      setComposingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return prev
        }
        return prev + Math.random() * 15 + 5
      })
    }, 300)
    
    // 模拟合成完成
    setTimeout(() => {
      setComposingProgress(100)
      setIsComposing(false)
      setShowFinalVideo(true)
      setComposedVideoUrl(DEMO_VIDEO_URL + '?t=' + Date.now())
      clearInterval(interval)
      toast.success('完整视频已合成')
    }, 3500)
  }

  return (
    <div className="space-y-4">
      {/* 如果正在合成或已合成完整视频，显示合成界面 */}
      {isComposing || showFinalVideo ? (
        <div className="flex flex-col items-center">
          {isComposing ? (
            <div className="w-full max-w-2xl">
              {/* Loading 状态 */}
              <Card className="border-border/60">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      视频生成中…{Math.round(composingProgress)}%
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      我的灵感噼啪作响，客官的视频马上就好~
                    </p>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="w-full max-w-sm">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${composingProgress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="w-full max-w-3xl space-y-4">
              {/* 合成完成 - 视频预览 */}
              <Card className="border-border/60 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-black">
                    <video
                      src={composedVideoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* 下载按钮 */}
              <div className="flex gap-3">
                <Button className="flex-1 h-10">
                  <Download className="h-4 w-4 mr-2" />
                  下载视频
                </Button>
              </div>
              
              {/* 可复制的文案 */}
              {result.sourceText && (
                <Card className="border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">视频文案</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={handleCopySourceText}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        复制
                      </Button>
                    </div>
                    <div className="bg-secondary/10 rounded-lg p-3 border border-border/40">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {result.sourceText}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 源文案 */}
          {result.sourceText && (
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">源文案</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.sourceText}</p>
              </CardContent>
            </Card>
          )}

          {/* 分镜 + 预览 */}
          {shots.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 左侧：分镜列表 - 占 40% 宽度，固定高度可滚动 */}
              <div className="w-full lg:w-2/5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clapperboard className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">分镜脚本</h3>
                    <Badge variant="secondary" className="text-[10px]">{shots.length} 镜</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">点击分镜可在右侧预览</span>
                </div>

                {/* 分镜卡片容器 - 固定高度可滚动 */}
                <div 
                  className="space-y-3 overflow-y-auto pr-1"
                  style={{ height: 'calc(100vh - 120px)' }}
                >
                  {shots.map((shot) => {
                    const isActive = activeShotId === shot.id
                    return (
                      <div
                        key={shot.id}
                        onClick={() => setActiveShotId(shot.id)}
                        className={cn(
                          'group rounded-[8px] border bg-card overflow-hidden transition-all cursor-pointer shadow-sm hover:shadow-md',
                          isActive
                            ? 'border-primary/40 ring-1 ring-primary/20'
                            : 'border-border/60 hover:border-primary/20'
                        )}
                      >
                        <div className="flex gap-3 p-3">
                          {/* 左侧：视频缩略图 - 固定宽度 */}
                          <div className="relative shrink-0 w-[140px] aspect-video rounded-[8px] overflow-hidden bg-secondary/40 border border-border/50">
                            {shot.imageUrl ? (
                              <img
                                src={shot.imageUrl}
                                alt={`镜${shot.index}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <ImagePlus className="h-6 w-6" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-6 w-6 text-white fill-white" />
                            </div>
                            <Badge className="absolute bottom-2 left-2 text-[10px] h-4 px-1 bg-black/70 text-white border-0">
                              镜{shot.index}
                            </Badge>
                          </div>

                          {/* 右侧：分镜内容区 */}
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            {/* 顶部：分镜序号 + 操作按钮 */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground">
                                  镜 {shot.index}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {shot.duration}
                                </span>
                              </div>
                              {/* 操作按钮 */}
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteShot(shot.id)
                                  }}
                                  title="删除分镜"
                                >
                                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>

                            {/* 底部：分镜字幕文本框 */}
                            <div className="flex-1 min-h-0">
                              <Textarea
                                ref={(el) => { textareaRefs.current[shot.id] = el }}
                                value={shot.caption || shot.description}
                                onChange={(e) => handleCaptionChange(shot.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={() => setEditingShotId(shot.id)}
                                onBlur={() => setEditingShotId((prev) => (prev === shot.id ? null : prev))}
                                placeholder="输入分镜字幕..."
                                className={cn(
                                  'h-full min-h-[60px] resize-none rounded-[6px] border bg-secondary/10 text-xs leading-relaxed py-1.5 px-2 transition-all',
                                  editingShotId === shot.id
                                    ? 'border-primary ring-1 ring-primary/20'
                                    : 'border-border/40 focus-visible:ring-1 focus-visible:ring-primary/30'
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 右侧：视频预览 - 占 60% 宽度，高度与左侧保持一致 */}
              <div className="w-full lg:w-3/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">视频预览</h3>
                </div>

                <Card className="border-border/60 overflow-hidden h-full">
                  <CardContent className="p-0 flex flex-col h-full" style={{ height: 'calc(100vh - 120px)' }}>
                    {/* 视频播放器 - 占主要空间 */}
                    <div className="relative flex-1 bg-black">
                      <video
                        key={composedVideoUrl}
                        src={composedVideoUrl}
                        controls
                        className="w-full h-full object-contain"
                        poster={activeShot?.imageUrl}
                      />
                      {activeShot?.caption && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-[90%] px-3 py-1.5 rounded-md bg-black/70 text-white text-xs text-center line-clamp-2">
                          {activeShot.caption}
                        </div>
                      )}
                    </div>

                    {/* 底部控制区 */}
                    <div className="p-4 border-t border-border/40 bg-card space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          当前分镜：
                          <span className="text-foreground font-medium ml-1">
                            镜{activeShot?.index || 1} / {shots.length}
                          </span>
                        </span>
                        <span>{activeShot?.duration}</span>
                      </div>

                      <Button
                        className="w-full h-10"
                        onClick={handleCompose}
                        disabled={isComposing}
                      >
                        {isComposing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            合成中…
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            合成完整视频
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {shots.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground border rounded-xl border-border/60">
              暂无分镜，请重新生成
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ============================================================
// 10. AI修图助手 — 前后对比
// ============================================================

function AIImageEditorResult({ result }: { result: AgentResultDetail }) {
  const [showAfter, setShowAfter] = useState(true)

  return (
    <div className="space-y-4">
      {/* 前后切换 */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        <Button variant={showAfter ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setShowAfter(true)}>
          <CheckCircle2 className="h-3 w-3 mr-1" />处理后
        </Button>
        <Button variant={!showAfter ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setShowAfter(false)}>
          原始图片
        </Button>
      </div>

      {/* 图片展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">原始图片</p>
          <div className="rounded-xl overflow-hidden border border-border bg-secondary/30">
            {result.beforeImageUrl && <img src={result.beforeImageUrl} alt="原始图片" className="w-full h-auto object-contain max-h-[350px] mx-auto" />}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />处理后</p>
          <div className="rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-900/50 bg-secondary/30">
            {result.imageUrl && <img src={result.imageUrl} alt="处理后" className="w-full h-auto object-contain max-h-[350px] mx-auto" />}
          </div>
        </div>
      </div>

      {/* 图片信息 */}
      {result.imageInfo && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '尺寸', value: `${result.imageInfo.width}×${result.imageInfo.height}` },
            { label: '格式', value: result.imageInfo.format },
            { label: '大小', value: result.imageInfo.size },
            { label: '状态', value: '已去除背景' },
          ].map((s) => (
            <div key={s.label} className="p-2 rounded-lg bg-secondary/20 border border-border/50 text-center">
              <p className="text-sm font-semibold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10"><Download className="h-4 w-4 mr-2" />下载图片</Button>
        <Button variant="outline" className="flex-1 h-10"><ImagePlus className="h-4 w-4 mr-2" />继续编辑</Button>
      </div>
    </div>
  )
}

// ============================================================
// 参数摘要
// ============================================================

function ParamsSummary({ params }: { params?: Record<string, any> }) {
  if (!params || Object.keys(params).length === 0) return null
  const labels: Record<string, string> = {
    language: '识别语言', voice: '音色', speed: '语速', volume: '音量', pitch: '音调',
    outputFormat: '输出格式', quality: '质量', subtitleStyle: '字幕样式', bilingual: '双语字幕',
    videoStyle: '视频风格', duration: '时长', ratio: '比例',
    copywritingType: '文案类型', tone: '风格', length: '长度',
    editType: '修图类型', keepTransparent: '透明背景',
    sourceLanguage: '源语言', targetLanguage: '目标语言',
    bgm: '背景音乐', captions: '自动字幕',
  }
  const entries = Object.entries(params).filter(([, v]) => typeof v === 'string' || typeof v === 'boolean')

  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3">处理参数</h3>
        <div className="flex flex-wrap gap-2">
          {entries.map(([k, v]) => (
            <Badge key={k} variant="outline" className="text-[11px]">
              {labels[k] || k}: {typeof v === 'boolean' ? (v ? '开启' : '关闭') : v}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Main Component
// ============================================================

export function AgentResultDetailView({ 
  result, 
  agent, 
  fileName, 
  onBack, 
  onGenerateVideo,
  skipStoryboard = false 
}: AgentResultDetailViewProps & { skipStoryboard?: boolean }) {
  // 按 agentId 分派不同的结果渲染
  const renderResult = () => {
    switch (result.agentId) {
      case 'speech-to-text':
        return <SpeechToTextResult result={result} />
      case 'text-to-speech':
        return <TextToSpeechResult result={result} agent={agent} />
      case 'video-to-text':
        return <SpeechToTextResult result={result} />
      case 'topic-to-copywriting':
        return <TopicToCopywritingResult result={result} onGenerateVideo={onGenerateVideo} />
      case 'copywriting-to-video':
        return <CopywritingToVideoAdvancedResult result={result} showVideoResult={skipStoryboard} />
      case 'image-to-video':
        return <CopywritingToVideoResult result={result} />
      case 'video-translate':
        return <VideoSubtitleResult result={result} />
      case 'video-dubbing':
        return <VideoDubbingResult result={result} />
      case 'video-subtitle':
        return <VideoSubtitleResult result={result} />
      case 'video-watermark-removal':
        return <VideoWatermarkRemovalResult result={result} />
      default:
        return <SpeechToTextResult result={result} />
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full p-4 md:p-6 pb-10">
        {/* 返回 */}
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground w-fit">
          <ArrowLeft className="h-4 w-4 mr-1" />返回{agent.name}
        </Button>

        {/* 头部 */}
        <ResultHeader result={result} agent={agent} fileName={fileName} />

        {/* 结果内容 */}
        {renderResult()}
      </div>
    </div>
  )
}
