'use client'

import { useRef, useEffect } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
  Play,
  FileText,
  Globe,
  Settings2,
  Zap,
  Sparkles,
  Lightbulb,
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
  onStartProcess,
}: CopywritingExperienceProps) {
  const currentLanguage = paramValues.language || 'auto'
  const currentParagraphCount = paramValues.paragraphCount ?? 5
  const currentCustomRequirements = paramValues.customRequirements || ''
  const customRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow for custom requirements textarea (2~6 rows)
  useEffect(() => {
    const el = customRef.current
    if (!el) return
    el.style.height = 'auto'
    const lineHeight = 24 // px per row
    const minHeight = lineHeight * 2
    const maxHeight = lineHeight * 6
    const newHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight)
    el.style.height = `${newHeight}px`
  }, [currentCustomRequirements])

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* ========================================== */}
      {/* LEFT: 输入视频主题卡片                                    */}
      {/* ========================================== */}
      <div className="flex-1 min-w-0">
        <Card className="border-border/60 shadow-sm overflow-hidden h-full">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Card Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">输入视频主题</p>
                  <p className="text-xs text-muted-foreground">
                    输入主题或产品名，AI 自动生成视频脚本和关键词
                  </p>
                </div>
              </div>
            </div>

            {/* Example topic chips */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border/30 bg-secondary/5 flex-wrap">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="text-xs text-muted-foreground mr-1">试试：</span>
              {exampleTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => onTextChange(text ? `${text}、${topic}` : topic)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border/50 bg-background hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer text-muted-foreground"
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="flex-1 p-5">
              <Textarea
                id="copywriting-experience-textarea"
                placeholder="例如：新品智能耳机发布、夏季防晒霜推广、周末亲子露营攻略..."
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                className="min-h-[280px] h-full resize-none rounded-xl border-border/40 bg-secondary/10 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 text-sm leading-relaxed placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Card Footer: character count */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-secondary/10">
              <span className="text-xs text-muted-foreground">
                输入视频主题或产品描述，AI 将生成完整脚本及热门关键词
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
      {/* RIGHT: 参数设置 + 生成按钮                        */}
      {/* ========================================== */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">
        {/* 参数设置 Card（生成语言 + 段落数量 + 自定义要求） */}
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Card Header */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="w-8 h-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center">
                <Settings2 className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">参数设置</p>
                <p className="text-xs text-muted-foreground">
                  调整生成参数以获得最佳效果
                </p>
              </div>
            </div>

            {/* 生成语言 */}
            <div className="p-4 border-b border-border/30">
              <Label className="text-xs font-semibold text-foreground mb-2 block">生成语言</Label>
              <Select
                value={currentLanguage}
                onValueChange={(v) => onParamChange('language', v)}
              >
                <SelectTrigger className="w-full h-10 rounded-lg border-border/60 bg-secondary/20 hover:bg-secondary/30 transition-colors">
                  <Globe className="h-4 w-4 text-muted-foreground mr-2" />
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
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold text-foreground">段落数量</Label>
                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-0.5 rounded-md tabular-nums">
                  {currentParagraphCount} 段
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
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5">
                <span>1 段</span>
                <span>10 段</span>
              </div>
            </div>

            {/* 自定义要求 */}
            <div className="p-4">
              <Label className="text-xs font-semibold text-foreground mb-2 block">自定义要求</Label>
              <Textarea
                ref={customRef}
                value={currentCustomRequirements}
                onChange={(e) => onParamChange('customRequirements', e.target.value)}
                placeholder="例如：语气更轻松，适合小红书风格，面向年轻用户，开头更有悬念"
                rows={2}
                className="resize-none rounded-lg border-border/60 bg-secondary/20 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 text-sm placeholder:text-muted-foreground/50 overflow-y-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* 开始生成按钮 + 智点 */}
        <Button
          className="w-full h-12 text-base font-semibold gap-2 rounded-xl shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/30 transition-all duration-200 hover:-translate-y-0.5"
          size="lg"
          onClick={onStartProcess}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              生成中...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              开始生成
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
