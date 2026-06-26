'use client'

import { useCallback, useState } from 'react'
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Send,
  Wand2,
  Minus,
  Plus,
  Volume2,
  Zap,
  Sparkles,
  AlertCircle,
  Loader2,
  Plus as PlusIcon,
  X,
  Crown,
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

const modeOptions = [
  { value: 'text-to-video', label: '文生视频' },
  { value: 'image-to-video', label: '图生视频' },
]

const ratioOptions = [
  { value: 'auto', label: '自适应' },
  { value: '9:16', label: '9:16' },
  { value: '16:9', label: '16:9' },
  { value: '1:1', label: '1:1' },
]

const resolutionOptions = [
  { value: '540p', label: '540P' },
  { value: '720p', label: '720P' },
  { value: '1080p', label: '1080P' },
]

// 时长范围 3-15秒
const durationOptions = Array.from({ length: 13 }, (_, i) => (i + 3).toString())

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
// Duration Stepper with Hover Popup
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

  const [showPopup, setShowPopup] = useState(false)

  return (
    <div className="relative inline-flex items-center">
      <div
        className="inline-flex items-center rounded-lg border border-border/60 bg-secondary/30 overflow-hidden cursor-pointer"
        onClick={() => setShowPopup(!showPopup)}
      >
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

      {/* Click Popup */}
      {showPopup && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-900 text-white rounded-xl p-4 shadow-2xl z-50 min-w-[220px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">时长设置</span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Slider */}
          <div className="mb-3">
            <input
              type="range"
              min="3"
              max="15"
              value={Number(value)}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-2 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-green-400"
            />
          </div>

          <div className="flex justify-between text-sm text-neutral-400">
            <span>3S</span>
            <span>15S</span>
          </div>
        </div>
      )}
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
  const mode = paramValues.mode || 'text-to-video'
  const ratio = paramValues.ratio || 'auto'
  const resolution = paramValues.resolution || '540p'
  const duration = String(paramValues.duration || '5')
  const bgm = !!paramValues.bgm
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 创建图片预览 URL
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)
    }
  }

  return (
    <div className="w-full space-y-6">
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
              <div className={cn(
                'min-h-[260px] h-full p-5',
                mode === 'image-to-video' ? 'flex gap-4' : ''
              )}>
                {/* Image Upload Area (only for image-to-video) */}
                {mode === 'image-to-video' && (
                  <div className="w-40 flex-shrink-0">
                    {uploadedImage ? (
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-border/60">
                        <img
                          src={uploadedImage}
                          alt="上传的图片"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                        >
                          <span className="text-xs">✕</span>
                        </button>
                      </div>
                    ) : (
                      <label className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border/60 bg-secondary/10 flex flex-col items-center justify-center gap-2 hover:bg-secondary/30 hover:border-border transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <PlusIcon className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">上传图片</span>
                      </label>
                    )}
                  </div>
                )}

                {/* Textarea */}
                <div className="flex-1">
                  <Textarea
                    id="copywriting-to-video-textarea"
                    placeholder={examplePlaceholder}
                    value={text}
                    onChange={(e) => onTextChange(e.target.value)}
                    className="w-full h-full min-h-[220px] resize-none rounded-none border-0 bg-secondary/10 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border/40 bg-card">
            {/* Left controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 模式切换 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ToolbarSelect
                      value={mode}
                      options={modeOptions}
                      onChange={(v) => onParamChange('mode', v)}
                      className="min-w-[6rem]"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>选择生成模式</TooltipContent>
              </Tooltip>

              <div className="w-px h-4 bg-border/60" />

              {/* 画面比例 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ToolbarSelect
                      value={ratio}
                      options={ratioOptions}
                      onChange={(v) => onParamChange('ratio', v)}
                      className="min-w-[4.5rem]"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>设置视频宽高比</TooltipContent>
              </Tooltip>

              {/* 清晰度 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ToolbarSelect
                      value={resolution}
                      options={resolutionOptions}
                      onChange={(v) => onParamChange('resolution', v)}
                      className="min-w-[4.5rem]"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>选择视频分辨率</TooltipContent>
              </Tooltip>

              {/* 时长 */}
              <DurationStepper
                value={duration}
                onChange={(v) => onParamChange('duration', v)}
              />

              <div className="w-px h-4 bg-border/60" />

              {/* 声音 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1.5 h-8 px-2 rounded-lg border border-border/60 bg-secondary/30">
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">声音</span>
                    <Switch
                      checked={bgm}
                      onCheckedChange={(checked) => onParamChange('bgm', checked)}
                      className="scale-75 data-[state=checked]:bg-primary"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>是否添加背景音乐</TooltipContent>
              </Tooltip>
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
