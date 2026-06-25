'use client'

import { useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Send,
  Wand2,
  Minus,
  Plus,
  Volume2,
  Droplets,
  Zap,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'

// ============================================================
// Types
// ============================================================

interface CopywritingToVideoExperienceProps {
  agent: Agent
  text: string
  paramValues: Record<string, any>
  onTextChange: (text: string) => void
  onParamChange: (id: string, value: any) => void
  error?: string
  isProcessing?: boolean
  onStartProcess: () => void
}

// ============================================================
// Options
// ============================================================

const videoStyleOptions = [
  { value: 'modern', label: '现代简约' },
  { value: 'tech', label: '科技感' },
  { value: 'warm', label: '温馨治愈' },
  { value: 'business', label: '商务专业' },
]

const ratioOptions = [
  { value: '9:16', label: '9:16' },
  { value: '16:9', label: '16:9' },
]

const resolutionOptions = [
  { value: '540p', label: '540P' },
  { value: '720p', label: '720P' },
  { value: '1080p', label: '1080P' },
]

const durationOptions = ['15', '30', '60']

const examplePlaceholder =
  '示例：花园的叶子上，住着一群小精灵。镜头右摇，主角从家中走出——身着花瓣斗篷，手持草叶魔杖，魔杖顶端嵌着一颗发光的黄色宝石。微观世界风格。小精灵用低沉的声音说：“美好的清晨，从早安开始。”'

// ============================================================
// Compact Select Trigger
// ============================================================

function ToolbarSelect({
  value,
  options,
  onChange,
  className,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          'h-8 min-w-[5.5rem] w-auto px-2 text-xs rounded-lg border-border/60 bg-secondary/30 hover:bg-secondary/50 transition-colors',
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ============================================================
// Duration Stepper
// ============================================================

function DurationStepper({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const index = durationOptions.indexOf(value)
  const canDecrease = index > 0
  const canIncrease = index < durationOptions.length - 1

  const decrease = () => {
    if (canDecrease) onChange(durationOptions[index - 1])
  }
  const increase = () => {
    if (canIncrease) onChange(durationOptions[index + 1])
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-border/60 bg-secondary/30 overflow-hidden">
      <button
        type="button"
        onClick={decrease}
        disabled={!canDecrease}
        className="h-8 w-7 flex items-center justify-center text-muted-foreground hover:bg-secondary/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="h-8 px-2 flex items-center justify-center text-xs font-medium tabular-nums min-w-[3rem]">
        {value}S
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={!canIncrease}
        className="h-8 w-7 flex items-center justify-center text-muted-foreground hover:bg-secondary/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function CopywritingToVideoExperienceArea({
  agent,
  text,
  paramValues,
  onTextChange,
  onParamChange,
  error,
  isProcessing,
  onStartProcess,
}: CopywritingToVideoExperienceProps) {
  const videoStyle = paramValues.videoStyle || 'modern'
  const ratio = paramValues.ratio || '9:16'
  const resolution = paramValues.resolution || '540p'
  const duration = String(paramValues.duration || '30')
  const bgm = !!paramValues.bgm
  const watermark = !!paramValues.watermark

  const progressSteps = [
    { label: '分析文案结构', status: 'done' as const },
    { label: '生成分镜脚本', status: 'running' as const },
    { label: '渲染视频画面', status: 'pending' as const },
    { label: '合成完整视频', status: 'pending' as const },
  ]

  const handleSend = useCallback(() => {
    if (isProcessing) return
    onStartProcess()
  }, [isProcessing, onStartProcess])

  const videoStyleLabel =
    videoStyleOptions.find((o) => o.value === videoStyle)?.label || '现代简约'

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <Wand2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          你想创作什么视频？
        </h2>
      </div>

      {/* Input Card */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-0 flex flex-col">
          {/* Textarea or Loading Overlay */}
          <div className="relative flex-1 min-h-[260px]">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-card/80 backdrop-blur-sm z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <div className="w-full max-w-md space-y-3">
                  <p className="text-center text-sm font-medium text-foreground">
                    AI 正在理解文案并生成分镜…
                  </p>
                  <div className="space-y-2">
                    {progressSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center border',
                            step.status === 'done'
                              ? 'bg-primary border-primary text-primary-foreground'
                              : step.status === 'running'
                              ? 'border-primary text-primary'
                              : 'border-muted-foreground/30 text-muted-foreground'
                          )}
                        >
                          {step.status === 'done' ? (
                            <span className="text-[10px]">✓</span>
                          ) : (
                            <span className="text-[10px]">{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={cn(
                            'flex-1',
                            step.status === 'pending'
                              ? 'text-muted-foreground'
                              : 'text-foreground'
                          )}
                        >
                          {step.label}
                        </span>
                        {step.status === 'running' && (
                          <Loader2 className="h-3 w-3 text-primary animate-spin" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Textarea
                id="copywriting-to-video-textarea"
                placeholder={examplePlaceholder}
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                className="min-h-[260px] h-full resize-none rounded-none border-0 bg-secondary/10 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed placeholder:text-muted-foreground/60 p-5"
              />
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border/40 bg-card">
            {/* Left controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 视频风格 */}
              <ToolbarSelect
                value={videoStyle}
                options={videoStyleOptions}
                onChange={(v) => onParamChange('videoStyle', v)}
                className="min-w-[6rem]"
              />

              <div className="w-px h-4 bg-border/60" />

              {/* 画面比例 */}
              <ToolbarSelect
                value={ratio}
                options={ratioOptions}
                onChange={(v) => onParamChange('ratio', v)}
                className="min-w-[4.5rem]"
              />

              {/* 清晰度 */}
              <ToolbarSelect
                value={resolution}
                options={resolutionOptions}
                onChange={(v) => onParamChange('resolution', v)}
                className="min-w-[4.5rem]"
              />

              {/* 时长 */}
              <DurationStepper
                value={duration}
                onChange={(v) => onParamChange('duration', v)}
              />

              <div className="w-px h-4 bg-border/60" />

              {/* 声音 */}
              <div className="inline-flex items-center gap-1.5 h-8 px-2 rounded-lg border border-border/60 bg-secondary/30">
                <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">声音</span>
                <Switch
                  checked={bgm}
                  onCheckedChange={(checked) => onParamChange('bgm', checked)}
                  className="scale-75 data-[state=checked]:bg-primary"
                />
              </div>

              {/* 水印 */}
              <div className="inline-flex items-center gap-1.5 h-8 px-2 rounded-lg border border-border/60 bg-secondary/30">
                <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">水印</span>
                <Switch
                  checked={watermark}
                  onCheckedChange={(checked) =>
                    onParamChange('watermark', checked)
                  }
                  className="scale-75 data-[state=checked]:bg-primary"
                />
              </div>
            </div>

            {/* Right: cost + send */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-foreground tabular-nums">
                  {agent.costPoints}
                </span>
              </div>
              <Button
                className="h-9 px-4 rounded-lg gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                onClick={handleSend}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    生成中
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    发送
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Helper text */}
      <p className="text-center text-xs text-muted-foreground">
        输入视频文案，AI 将自动分镜、生成画面、配音并合成完整视频 · 当前风格：
        <span className="text-foreground font-medium">{videoStyleLabel}</span>
      </p>

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
