'use client'

import { useRef, useEffect } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Play,
  FileText,
  Globe,
  Settings2,
  Zap,
  Sparkles,
  Lightbulb,
  Loader2,
  CheckCircle2,
  Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'

// ============================================================
// Types
// ============================================================

interface CopywritingExperienceProps {
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
// Language options
// ============================================================

const languageOptions = [
  { value: 'auto', label: '自动检测' },
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'es', label: 'Español' },
]

// ============================================================
// Example topic prompts
// ============================================================

const exampleTopics = [
  '新品智能耳机发布',
  '夏季防晒霜推广',
  '周末亲子露营攻略',
  '春季穿搭灵感',
  'AI 技术科普',
]

// ============================================================
// Main Component
// ============================================================

export function CopywritingExperienceArea({
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
}: CopywritingExperienceProps) {
  const currentLanguage = paramValues.language || 'auto'
  const currentParagraphCount = paramValues.paragraphCount ?? 5
  const currentCustomRequirements = paramValues.customRequirements || ''
  const customRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = customRef.current
    if (!el) return
    el.style.height = 'auto'
    const lineHeight = 24
    const minHeight = lineHeight * 2
    const maxHeight = lineHeight * 6
    const newHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight)
    el.style.height = `${newHeight}px`
  }, [currentCustomRequirements])

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* ========================================== */}
      {/* LEFT: 输入视频主题                                                    */}
      {/* ========================================== */}
      <div className="flex-1 min-w-0 relative">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden h-full">
          <CardContent className="p-0 flex flex-col h-full">
            {/* 标题栏 */}
            <div className="flex items-center px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-4 rounded-full bg-fuchsia-400 dark:bg-fuchsia-500 shrink-0" />
                <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">输入视频主题</h3>
              </div>
            </div>

            {/* 示例话题标签 */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/20 bg-[#FAFAFC] dark:bg-[#111115] flex-wrap">
              <Lightbulb className="h-3 w-3 text-amber-400/60 shrink-0" />
              {exampleTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => onTextChange(text ? `${text}、${topic}` : topic)}
                  className="text-[11px] px-2 py-0.5 rounded-md border border-border/30 bg-white dark:bg-[#0A0A0E] hover:border-border/50 hover:text-foreground transition-colors text-muted-foreground/60 cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="flex-1 px-4 py-3">
              <Textarea
                id="copywriting-experience-textarea"
                placeholder="例如：新品智能耳机发布、夏季防晒霜推广、周末亲子露营攻略..."
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                className="min-h-[280px] h-full resize-none rounded-lg border-0 shadow-none bg-white dark:bg-[#0A0A0E] focus-visible:ring-0 text-[13px] leading-7 placeholder:text-muted-foreground/35"
              />
              <span className={cn(
                'absolute bottom-5 right-6 text-[10px] font-medium tabular-nums tracking-tight',
                text.length > 4500 ? 'text-destructive/80' : 'text-muted-foreground/40'
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
      {/* RIGHT: 参数设置 + 生成按钮                                           */}
      {/* ========================================== */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
        {/* 参数设置 Card */}
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
              <span className="w-1.5 h-4 rounded-full bg-fuchsia-400/60 dark:bg-fuchsia-500/60" />
              <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">参数设置</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* 生成语言 */}
              <div className="space-y-2">
                <span className="text-[13px] text-foreground/70">生成语言</span>
                <Select
                  value={currentLanguage}
                  onValueChange={(v) => onParamChange('language', v)}
                >
                  <SelectTrigger className="w-full h-9 rounded-lg border-border/30 bg-white dark:bg-[#0A0A0E] text-[13px] hover:border-border/50 transition-colors">
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span>{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 段落数量 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground/70">段落数量</span>
                  <span className="inline-flex items-center justify-center min-w-[36px] h-5 px-1.5 text-[10px] font-medium text-muted-foreground bg-muted/60 rounded-md tabular-nums">
                    {currentParagraphCount}段
                  </span>
                </div>
                <Slider
                  value={[currentParagraphCount]}
                  onValueChange={(vals) => onParamChange('paragraphCount', vals[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums">1</span>
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums">10</span>
                </div>
              </div>

              {/* 自定义要求 */}
              <div className="space-y-2">
                <span className="text-[13px] text-foreground/70">自定义要求</span>
                <Textarea
                  ref={customRef}
                  value={currentCustomRequirements}
                  onChange={(e) => onParamChange('customRequirements', e.target.value)}
                  placeholder="例如：语气更轻松，适合小红书风格，面向年轻用户，开头更有悬念"
                  rows={2}
                  className="resize-none rounded-lg border border-border/30 bg-white dark:bg-[#0A0A0E] focus-visible:ring-0 text-[13px] leading-7 placeholder:text-muted-foreground/35 overflow-y-auto"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 开始生成按钮 + 智点 */}
        <Button
          className="w-full h-11 text-sm font-semibold gap-2 rounded-xl shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/30 transition-all duration-200"
          onClick={onStartProcess}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <><Loader2 className="h-4 w-4 animate-spin" />生成中...</>
          ) : (
            <><Sparkles className="h-4 w-4" />开始生成
              <span className="flex items-center gap-1 ml-1 text-xs font-normal opacity-80">
                <span className="w-px h-3 bg-primary-foreground/30" />
                <Zap className="h-3 w-3" />{agent.costPoints} 智点
              </span>
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
