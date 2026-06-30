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
  CheckCircle2,
  Wand2,
  BookOpen,
  FileText,
  Upload,
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
  costPoints?: number
  processTime?: string
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
// Background Music Options
// ============================================================

const bgmOptions = [
  { value: 'none', label: '无背景音乐', duration: '' },
  { value: 'light', label: '阳光明媚', duration: '01:18', sub: '轻快自然' },
  { value: 'inspire', label: '逐梦前行', duration: '02:05', sub: '积极向上' },
  { value: 'upbeat', label: '元气满满', duration: '00:52', sub: '活泼灵动' },
  { value: 'cinematic', label: '史诗之旅', duration: '01:45', sub: '大气沉稳' },
  { value: 'lofi', label: '午后咖啡馆', duration: '02:30', sub: '悠闲放松' },
  { value: 'classical', label: '月光花园', duration: '03:12', sub: '优雅温婉' },
  { value: 'electronic', label: '未来脉搏', duration: '01:33', sub: '科技节奏' },
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
      className="w-56 p-0 overflow-hidden shadow-xl border-border/80"
    >
      <div className="p-3 space-y-3">
        {/* 语速：标签 + 进度条 + 当前值 一行 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0 w-7">语速</span>
            <Slider
              value={[speed]}
              onValueChange={(vals) => onSpeedChange(vals[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              className="flex-1"
            />
            <span className="text-[11px] font-medium tabular-nums text-foreground/70 shrink-0 w-7 text-right">{speed}x</span>
          </div>
        </div>
        {/* 音量：标签 + 进度条 + 当前值 一行 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0 w-7">音量</span>
            <Slider
              value={[volume]}
              onValueChange={(vals) => onVolumeChange(vals[0])}
              min={50}
              max={150}
              step={10}
              className="flex-1"
            />
            <span className="text-[11px] font-medium tabular-nums text-foreground/70 shrink-0 w-7 text-right">{volume}%</span>
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
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
        isSelected
          ? 'bg-white dark:bg-muted/20 ring-1 ring-border/20'
          : 'hover:bg-white/60 dark:hover:bg-muted/20'
      )}
    >
      {/* 左侧：彩色首字母头像 */}
      <div className="shrink-0">
        <div className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200',
          voice.avatarBg
        )}>
          {voice.avatar}
        </div>
      </div>

      {/* 中间：人名 + 声音标签徽章 */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={cn(
          'text-[13px] font-medium transition-colors tracking-tight',
          isSelected ? 'text-foreground' : 'text-foreground/80'
        )}>
          {voice.label}
        </span>
        <span className={cn('inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-medium', voice.tagColor)}>
          {voice.tags}
        </span>
      </div>

      {/* 右侧：试听 + 设置按钮（hover 显示） */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* 试听按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTogglePlay()
          }}
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200',
            isPlaying
              ? 'bg-foreground/10 text-foreground'
              : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/60'
          )}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 ml-0.5" />
          )}
        </button>
        {/* 设置按钮 */}
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSettingsOpen(!settingsOpen)
              }}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200',
                settingsOpen
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/60'
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
      </div>

      {/* 播放中波形指示 — 底部微条 */}
      {isPlaying && (
        <div className="absolute bottom-0 inset-x-3 h-0.5 bg-foreground/10 rounded-full overflow-hidden">
          <div className="h-full bg-foreground/30 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      )}
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
  progress,
  progressSteps,
  costPoints,
  processTime,
  onStartProcess,
}: TextToSpeechExperienceProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [playingBgm, setPlayingBgm] = useState<string | null>(null)
  const [bgmSelectOpen, setBgmSelectOpen] = useState(false)
  // AI写悬浮卡片
  const [aiWriteKeyword, setAiWriteKeyword] = useState('')
  const [aiWriteGenerating, setAiWriteGenerating] = useState(false)

  const currentVoice = paramValues.voice || 'female-gentle'
  const currentSpeed = paramValues.speed ?? 1.0
  const currentVolume = paramValues.volume ?? 100
  const currentBgm = paramValues.bgm || ''

  const togglePreview = (voiceValue: string) => {
    if (playingVoice === voiceValue) {
      setPlayingVoice(null)
    } else {
      setPlayingVoice(voiceValue)
      setTimeout(() => setPlayingVoice(null), 2000)
    }
  }

  const toggleBgmPreview = (bgmValue: string) => {
    if (playingBgm === bgmValue) {
      setPlayingBgm(null)
    } else {
      setPlayingBgm(bgmValue)
      setTimeout(() => setPlayingBgm(null), 2000)
    }
  }

  const handleBgmUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = e.target.files?.[0]
      if (uploadedFile) {
        onParamChange('bgm', 'custom-' + uploadedFile.name)
        onParamChange('customBgmName', uploadedFile.name)
      }
      e.target.value = ''
    },
    [onParamChange]
  )

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
      {/* LEFT: 输入内容                                                    */}
      {/* ========================================== */}
      <div className="flex-1 min-w-0 relative">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden h-full">
          <CardContent className="p-0 flex flex-col h-full">
            {/* 标题栏 — 精简到只有标题 + 工具按钮 */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-4 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0" />
                <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">输入内容</h3>
                <div className="hidden sm:flex items-center gap-0.5 ml-1 pl-2 border-l border-border/30">
                  {/* AI帮我写 — Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors">
                        <Wand2 className="h-3 w-3" />
                        AI帮我写
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-72 p-0 overflow-hidden shadow-xl border-border/80">
                      <div className="px-4 py-3 border-b border-border/20 bg-secondary/30">
                        <span className="text-xs font-semibold text-foreground">AI 智能写作</span>
                      </div>
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
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors" onClick={() => handleQuickFill('random-story')}>
                  <BookOpen className="h-3 w-3" />
                  随机故事
                </Button>

                {/* 上传txt */}
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors" onClick={() => document.getElementById('tts-txt-upload')?.click()}>
                  <FileText className="h-3 w-3" />
                  上传txt
                </Button>
              </div>
            </div>
            <input
              id="tts-txt-upload"
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleTxtUpload}
            />
          </div>

          {/* 移动端工具条 */}
          <div className="sm:hidden flex items-center gap-1 flex-wrap px-4 py-2 border-b border-border/20 bg-[#FAFAFC] dark:bg-[#111115]">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors">
                  <Wand2 className="h-3 w-3" />
                  AI帮我写
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="w-72 p-0 overflow-hidden shadow-xl border-border/80">
                <div className="px-4 py-3 border-b border-border/20 bg-secondary/30">
                  <span className="text-xs font-semibold text-foreground">AI 智能写作</span>
                </div>
                <div className="p-4 space-y-3">
                  <Input value={aiWriteKeyword} onChange={(e) => setAiWriteKeyword(e.target.value)} placeholder="输入关键词，使用AI帮写生成完整故事内容" className="h-9 text-sm rounded-lg" onKeyDown={(e) => e.key === 'Enter' && handleAiWriteGenerate()} />
                  <Button className="w-full h-9 text-sm gap-2 rounded-lg" onClick={handleAiWriteGenerate} disabled={aiWriteGenerating}>
                    {aiWriteGenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />生成中...</> : (<><Sparkles className="h-3.5 w-3.5" />生成<span className="flex items-center gap-1 ml-1 text-xs font-normal opacity-70"><span className="w-px h-3 bg-primary-foreground/30" /><Zap className="h-3 w-3" />1</span></>)}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors" onClick={() => handleQuickFill('random-story')}>
              <BookOpen className="h-3 w-3" />
              随机故事
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors" onClick={() => document.getElementById('tts-txt-upload')?.click()}>
              <FileText className="h-3 w-3" />
              上传txt
            </Button>
          </div>

          {/* Textarea — 无边框无底色，字数在右下角 */}
          <div className="flex-1 relative p-4">
            <Textarea
              id="tts-experience-textarea"
              placeholder="输入你想要的配音文案，AI 即刻生成带情感的自然人声…"
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              className="min-h-[280px] h-full resize-none rounded-lg border-0 shadow-none bg-white dark:bg-[#0A0A0E] focus-visible:ring-0 text-[13px] leading-7 placeholder:text-muted-foreground/35"
            />
            <span className={cn(
              'absolute bottom-6 right-6 text-[10px] font-medium tabular-nums tracking-tight',
              text.length > 4500
                ? 'text-destructive/80'
                : 'text-muted-foreground/40'
            )}>
              {text.length}/5000
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Loading 覆盖层 */}
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-[#FBFBFD]/80 dark:bg-[#0F0F12]/80 backdrop-blur-[2px]" />
          <div className="relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/60" />
            </div>
            {progressSteps && progressSteps.length > 0 ? (
              <div className="space-y-1.5">
                {progressSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {step.status === 'done' ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : step.status === 'running' ? (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-border shrink-0" />
                    )}
                    <span className={cn(
                      step.status === 'done' ? 'text-emerald-600' : step.status === 'running' ? 'text-foreground/80' : 'text-muted-foreground/50'
                    )}>
                      {step.label}
                      {step.status === 'running' && progress != null && ` ${Math.round(progress)}%`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/50">处理中…{progress != null ? ` ${Math.round(progress)}%` : ''}</p>
            )}
            {costPoints && processTime && (
              <p className="text-[10px] text-muted-foreground/40">预计消耗 {costPoints} 智点 · 约 {processTime}</p>
            )}
          </div>
        </div>
      )}
    </div>

      {/* ========================================== */}
      {/* RIGHT: 选择声音 + 背景音乐 + 开始处理                              */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
        {/* 配音设置 Card — 音色 + BGM 合为一张卡片 */}
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden">
          <CardContent className="p-0">
            {/* 选择声音 Section */}
            <div>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
                <span className="w-1.5 h-4 rounded-full bg-rose-400/60 dark:bg-rose-500/60" />
                <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">选择声音</h3>
              </div>
              <div className="px-3 py-2 space-y-1.5">
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
            </div>

            {/* 背景音乐 — 降为子选项，标题 + 下拉同行 */}
            <div className="px-4 py-2.5 border-t border-border/20">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-muted-foreground/60 shrink-0">背景音乐</span>
                <Select
                  open={bgmSelectOpen}
                  onOpenChange={setBgmSelectOpen}
                  value={currentBgm}
                  onValueChange={(v) => {
                    onParamChange('bgm', v)
                    setBgmSelectOpen(false)
                  }}
                >
                  <SelectTrigger className="flex-1 h-8 rounded-md border border-border/30 bg-white dark:bg-[#0A0A0E] text-[12px] hover:border-border/50 transition-colors px-3 shadow-none focus-visible:ring-0">
                    {currentBgm ? (
                      <span className="text-foreground">{bgmOptions.find(o => o.value === currentBgm)?.label || currentBgm}</span>
                    ) : (
                      <span className="text-muted-foreground/50">选择背景音乐</span>
                    )}
                  </SelectTrigger>
                  <SelectContent align="start" className="w-[340px] p-2">
                    <div className="grid grid-cols-2 gap-1">
                      {/* 上传本地音乐 */}
                      <label
                        className="flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer hover:bg-muted/60 transition-colors text-muted-foreground/60 hover:text-foreground border border-dashed border-border/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Upload className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-[12px]">上传本地音乐</span>
                        <input
                          type="file"
                          accept=".mp3,.wav,.m4a,.flac"
                          className="hidden"
                          onChange={handleBgmUpload}
                        />
                      </label>
                      {/* BGM 选项：2 列网格 */}
                      {bgmOptions.map((opt) => {
                        const isBgmPlaying = playingBgm === opt.value
                        return (
                          <div
                            key={opt.value}
                            onClick={() => { onParamChange('bgm', opt.value); setBgmSelectOpen(false) }}
                            className={cn(
                              'group flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors text-foreground',
                              currentBgm === opt.value
                                ? 'bg-muted/60'
                                : 'hover:bg-muted/40'
                            )}
                          >
                            {/* 音乐 icon + 播放 icon 同位置叠加 */}
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
                                  <Music className={cn(
                                    'absolute inset-0 h-5 w-5 transition-opacity duration-200',
                                    isBgmPlaying ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
                                  )} />
                                  <div className={cn(
                                    'absolute inset-0 h-5 w-5 rounded flex items-center justify-center transition-opacity duration-200',
                                    isBgmPlaying ? 'opacity-100 bg-foreground/10' : 'opacity-0 group-hover:opacity-100 group-hover:bg-foreground/5'
                                  )}>
                                    {isBgmPlaying ? (
                                      <Pause className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4 ml-px" />
                                    )}
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
