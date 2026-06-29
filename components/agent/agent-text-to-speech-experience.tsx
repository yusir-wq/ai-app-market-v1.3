'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Play,
  Pause,
  Settings2,
  Wand2,
  BookOpen,
  FileText,
  Music,
  Volume2,
  Zap,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'

// ============================================================
// Types
// ============================================================

interface TextToSpeechExperienceProps {
  agent: Agent
  text: string
  paramValues: Record<string, any>
  onTextChange: (text: string) => void
  onParamChange: (id: string, value: any) => void
  error?: string
  isProcessing?: boolean
  progress?: number
  progressSteps?: { label: string; status: 'pending' | 'running' | 'done' }[]
  onStartProcess: () => void
}

// ============================================================
// Quick Fill Actions
// ============================================================

const quickFillActions = [
  { id: 'ai-write', label: 'AI帮我写', icon: Wand2 },
  { id: 'random-story', label: '随机故事', icon: BookOpen },
  { id: 'upload-txt', label: '上传txt', icon: FileText },
]

// ============================================================
// Voice Presets
// ============================================================

const voicePresets = [
  {
    value: 'female-gentle',
    label: '温柔女声',
    tag: '女声',
    desc: '温暖知性，情感细腻，适合有声读物、产品解说',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  {
    value: 'female-lively',
    label: '活泼女声',
    tag: '女声',
    desc: '俏皮灵动，元气满满，适合短视频、带货广告',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  {
    value: 'male-calm',
    label: '沉稳男声',
    tag: '男声',
    desc: '大气稳重，字正腔圆，适合新闻播报、品牌视频',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    value: 'male-deep',
    label: '磁性男声',
    tag: '男声',
    desc: '低沉醇厚，感染力强，适合广告配音、播客开场',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  {
    value: 'child',
    label: '可爱童声',
    tag: '童声',
    desc: '天真烂漫，自然灵动，适合儿童内容、在线教育',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
]

// ============================================================
// Background Music Options
// ============================================================

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
// Voice Settings Popover Content
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
    <PopoverContent
      side="left"
      align="start"
      className="w-72 p-0 overflow-hidden shadow-xl border-border/80"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">声音参数设置</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="p-4 space-y-5">
        {/* 语速 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">语速</Label>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md tabular-nums">
              {speed}x
            </span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={(vals) => onSpeedChange(vals[0])}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>0.5x 慢速</span>
            <span>2.0x 快速</span>
          </div>
        </div>

        {/* 音量 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">音量</Label>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md tabular-nums">
              {volume}%
            </span>
          </div>
          <Slider
            value={[volume]}
            onValueChange={(vals) => onVolumeChange(vals[0])}
            min={50}
            max={150}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>50%</span>
            <span>150%</span>
          </div>
        </div>
      </div>
    </PopoverContent>
  )
}

// ============================================================
// Voice Row Component (1 column, 5 rows)
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
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/25 shadow-sm'
          : 'border-border/50 bg-card hover:border-primary/20 hover:bg-accent/30'
      )}
    >
      {/* Voice info - left side, always visible */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={cn(
              'text-sm font-semibold transition-colors',
              isSelected ? 'text-primary' : 'text-foreground'
            )}
          >
            {voice.label}
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-md px-1.5 py-px text-[10px] font-medium border',
              voice.color
            )}
          >
            {voice.tag}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed truncate">
          {voice.desc}
        </p>
      </div>

      {/* Play wave indicator */}
      {isPlaying && (
        <div className="flex items-end gap-px h-4 opacity-60 shrink-0">
          {[3, 6, 4, 8, 5, 7, 4].map((h, i) => (
            <div
              key={i}
              className="w-0.5 bg-primary rounded-full animate-pulse"
              style={{
                height: `${h * 2}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Buttons - right side, hidden by default, shown on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
        {/* Settings button */}
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSettingsOpen(!settingsOpen)
              }}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                settingsOpen
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <VoiceSettingsPopover
            speed={speed}
            volume={volume}
            onSpeedChange={onSpeedChange}
            onVolumeChange={onVolumeChange}
          />
        </Popover>

        {/* Play button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTogglePlay()
          }}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
            isPlaying
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
          )}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function TextToSpeechExperienceArea({
  agent,
  text,
  paramValues,
  onTextChange,
  onParamChange,
  error,
  isProcessing,
  onStartProcess,
}: TextToSpeechExperienceProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  // AI写悬浮卡片
  const [aiWriteKeyword, setAiWriteKeyword] = useState('')
  const [aiWriteGenerating, setAiWriteGenerating] = useState(false)

  const currentVoice = paramValues.voice || 'female-gentle'
  const currentSpeed = paramValues.speed ?? 1.0
  const currentVolume = paramValues.volume ?? 100
  const currentBgm = paramValues.bgm || 'none'

  const togglePreview = (voiceValue: string) => {
    if (playingVoice === voiceValue) {
      setPlayingVoice(null)
    } else {
      setPlayingVoice(voiceValue)
      setTimeout(() => setPlayingVoice(null), 2000)
    }
  }

  const handleQuickFill = useCallback(
    (actionId: string) => {
      if (actionId === 'random-story') {
        onTextChange('萤火虫的秘密\n深夜，九岁的阿布悄悄溜出外婆家，提着一盏熄灭的马灯走向神秘的黑森林。\n他想抓住传说中能实现愿望的"黄金萤火虫"，来治好外婆的眼睛。林子里静得只能听到他自己的心跳，微风吹过，树叶沙沙作响。突然，前方亮起了一团温暖的微光。那不是一只，而是成千上万只萤火虫聚在一起，宛如地上的银河。\n当它们围绕着阿布翩翩起舞时，阿布闭上眼睛，在心里虔诚地许愿。等他再次睁开眼，手里的马灯竟然自己亮了起来，散发出永不熄灭的柔和光芒。阿布开心地笑了，他捧着这盏希望之灯，朝着外婆家的方向飞奔而去。')
        return
      }
    },
    [text, onTextChange]
  )

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

  // AI写生成处理
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* ========================================== */}
      {/* LEFT: 输入内容卡片                                    */}
      {/* ========================================== */}
      <div className="flex-1 min-w-0">
        <Card className="border-border/60 shadow-sm overflow-hidden h-full">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Card Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">输入内容</p>
                  <p className="text-xs text-muted-foreground">
                    输入文案，AI 即刻生成自然语音
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Fill Bar */}
            <div className="px-5 py-3 border-b border-border/30 bg-secondary/10">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* AI帮我写 — Popover 气泡卡片 */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-foreground">
                      <Wand2 className="h-3 w-3" />
                      AI帮我写
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-72 p-0 overflow-hidden shadow-xl border-border/80">
                    <div className="p-4 space-y-3">
                      <Input
                        value={aiWriteKeyword}
                        onChange={(e) => setAiWriteKeyword(e.target.value)}
                        placeholder="输入关键词，使用AI帮写生成完整故事内容"
                        className="h-9 text-sm rounded-lg"
                        onKeyDown={(e) => e.key === 'Enter' && handleAiWriteGenerate()}
                      />
                      <Button
                        className="w-full h-9 text-sm gap-2 rounded-lg"
                        onClick={handleAiWriteGenerate}
                        disabled={aiWriteGenerating}
                      >
                        {aiWriteGenerating ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" />生成中...</>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            生成
                            <span className="flex items-center gap-1 ml-1 text-xs font-normal opacity-70">
                              <span className="w-px h-3 bg-primary-foreground/30" />
                              <Zap className="h-3 w-3" />1
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* 随机故事 */}
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-foreground" onClick={() => handleQuickFill('random-story')}>
                  <BookOpen className="h-3 w-3" />
                  随机故事
                </Button>

                {/* 上传txt */}
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-foreground" onClick={() => document.getElementById('tts-txt-upload')?.click()}>
                  <FileText className="h-3 w-3" />
                  上传txt
                </Button>
              </div>
              <input
                id="tts-txt-upload"
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleTxtUpload}
              />
            </div>

            {/* Textarea */}
            <div className="flex-1 p-5">
              <Textarea
                id="tts-experience-textarea"
                placeholder="输入你想要的配音文案，AI 即刻生成带情感的自然人声…"
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                className="min-h-[280px] h-full resize-none rounded-xl border-border/40 bg-secondary/10 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 text-sm leading-relaxed placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Card Footer: character count */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-secondary/10">
              <span className="text-xs text-muted-foreground">
                支持中英文混合输入，最多 5000 字
              </span>
              <span
                className={cn(
                  'text-xs font-medium tabular-nums',
                  text.length > 4500
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                {text.length}/5000
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================== */}
      {/* RIGHT: 配音音色 + 背景音乐 + 开始处理按钮                */}
      {/* ========================================== */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">
        {/* 配音音色 Card */}
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">配音音色</p>
                <p className="text-xs text-muted-foreground">
                  选择最适合你内容风格的声音
                </p>
              </div>
            </div>

            {/* Voice List: 1 column, 5 rows */}
            <div className="p-4 space-y-2.5">
              {voicePresets.map((voice) => (
                <VoiceRow
                  key={voice.value}
                  voice={voice}
                  isSelected={currentVoice === voice.value}
                  isPlaying={playingVoice === voice.value}
                  onSelect={() => onParamChange('voice', voice.value)}
                  onTogglePlay={() => togglePreview(voice.value)}
                  speed={currentSpeed}
                  volume={currentVolume}
                  onSpeedChange={(v) => onParamChange('speed', v)}
                  onVolumeChange={(v) => onParamChange('volume', v)}
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
                <p className="text-xs text-muted-foreground">
                  为你的配音添加背景音乐
                </p>
              </div>
            </div>
            <div className="p-4">
              <Select
                value={currentBgm}
                onValueChange={(v) => onParamChange('bgm', v)}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-border/60 bg-secondary/20 hover:bg-secondary/30 transition-colors">
                  <Music className="h-4 w-4 text-muted-foreground mr-2" />
                  <SelectValue placeholder="选择背景音乐" />
                </SelectTrigger>
                <SelectContent>
                  {bgmOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.value === 'none' && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 开始处理按钮 + 智点 */}
        <Button
          className="w-full h-12 text-base font-semibold gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5"
          size="lg"
          onClick={onStartProcess}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              处理中...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              开始处理
              <span className="flex items-center gap-1 ml-1 text-xs font-normal opacity-80">
                <span className="w-px h-3 bg-primary-foreground/30" />
                <Zap className="h-3 w-3" />
                {agent.costPoints} 智点
              </span>
            </>
          )}
        </Button>

        {/* Error */}
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
