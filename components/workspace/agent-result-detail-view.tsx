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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Lightbulb,
  CheckSquare,
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
    <div className="flex items-center justify-between flex-wrap gap-4 pb-5">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-sm ring-1 ring-border/30">
          <span className="text-slate-600 dark:text-slate-300">{info.icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[15px] font-semibold text-foreground tracking-tight">{fileName || result.taskName}</h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 h-5">
              <CheckCircle2 className="h-3 w-3 mr-1" />已完成
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60">
              <Zap className="h-3 w-3 text-amber-500/70" />{result.costPoints} 智点
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60">
              <Clock className="h-3 w-3 text-sky-500/70" />{result.processTime}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60">
              <Calendar className="h-3 w-3 text-muted-foreground/50" />{result.createdAt}
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
  const [isRegenerating, setIsRegenerating] = useState(false)
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

  const handleRegenerateSummary = () => {
    setIsRegenerating(true)
    // 模拟重新生成智能总结（1.5秒后完成）
    setTimeout(() => {
      setIsRegenerating(false)
      toast.success('智能总结已重新生成')
    }, 1500)
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
      <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-220px)] lg:min-h-[520px]">
        {/* 左侧：转写内容 */}
        <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col min-h-0">
          <Card className="flex flex-col h-auto lg:h-full border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              {/* 工具栏 */}
              <div className="flex items-center justify-between gap-1 px-4 py-2.5 shrink-0 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-blue-400 dark:bg-blue-500" />
                  <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">AI转写内容</h3>
                </div>
                <div className="flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80"
                        onClick={() => {
                          if (isEditing) {
                            handleSaveEdit()
                          } else {
                            setEditedText(displaySegments.length > 0 ? displaySegments.map((s) => s.text).join('\n') : fullText)
                            setIsEditing(true)
                          }
                        }}
                      >
                        {isEditing ? <Save className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isEditing ? '保存' : '编辑'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80" onClick={handleCopy}>
                        {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{copied ? '已复制' : '复制'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>导出TXT</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* 转写内容区 */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 max-h-[50vh] lg:max-h-none">
                {isEditing ? (
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-full resize-none text-[13px] leading-7 border-0 shadow-none focus-visible:ring-0 bg-transparent"
                  />
                ) : displaySegments.length > 0 ? (
                  <div className="space-y-2.5">
                    {displaySegments.map((seg, i) => {
                      const speakerColors: Record<string, string> = {
                        '主持人': 'border-l-blue-400/80 bg-blue-50/90 dark:bg-blue-950/40 border-l-blue-400/60 dark:border-l-blue-400/40',
                        '产品经理': 'border-l-purple-400/80 bg-purple-50/90 dark:bg-purple-950/40 border-l-purple-400/60 dark:border-l-purple-400/40',
                        '技术负责人': 'border-l-emerald-400/80 bg-emerald-50/90 dark:bg-emerald-950/40 border-l-emerald-400/60 dark:border-l-emerald-400/40',
                        '讲师': 'border-l-amber-400/80 bg-amber-50/90 dark:bg-amber-950/40 border-l-amber-400/60 dark:border-l-amber-400/40',
                        '说话人1': 'border-l-sky-400/80 bg-sky-50/90 dark:bg-sky-950/40 border-l-sky-400/60 dark:border-l-sky-400/40',
                        '说话人2': 'border-l-rose-400/80 bg-rose-50/90 dark:bg-rose-950/40 border-l-rose-400/60 dark:border-l-rose-400/40',
                        '说话人3': 'border-l-teal-400/80 bg-teal-50/90 dark:bg-teal-950/40 border-l-teal-400/60 dark:border-l-teal-400/40',
                      }
                      const fallbackColors = ['border-l-sky-400/80 bg-sky-50/90 dark:bg-sky-950/40 dark:border-l-sky-400/40', 'border-l-violet-400/80 bg-violet-50/90 dark:bg-violet-950/40 dark:border-l-violet-400/40', 'border-l-amber-400/80 bg-amber-50/90 dark:bg-amber-950/40 dark:border-l-amber-400/40', 'border-l-rose-400/80 bg-rose-50/90 dark:bg-rose-950/40 dark:border-l-rose-400/40', 'border-l-teal-400/80 bg-teal-50/90 dark:bg-teal-950/40 dark:border-l-teal-400/40', 'border-l-indigo-400/80 bg-indigo-50/90 dark:bg-indigo-950/40 dark:border-l-indigo-400/40']
                      const colorClass = speakerColors[seg.speaker] || fallbackColors[i % fallbackColors.length]
                      const badgeColors: Record<string, string> = {
                        '主持人': 'bg-blue-100/70 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
                        '产品经理': 'bg-purple-100/70 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
                        '技术负责人': 'bg-emerald-100/70 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
                        '讲师': 'bg-amber-100/70 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
                        '说话人1': 'bg-sky-100/70 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
                        '说话人2': 'bg-rose-100/70 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
                        '说话人3': 'bg-teal-100/70 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
                      }
                      const fallbackBadges = ['bg-sky-100/70 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300', 'bg-violet-100/70 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300', 'bg-amber-100/70 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300', 'bg-rose-100/70 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300']
                      const badgeColor = badgeColors[seg.speaker] || fallbackBadges[i % fallbackBadges.length]
                      return (
                        <div key={seg.id} className={`group px-3.5 py-3 rounded-lg border-l-[2px] transition-colors ${colorClass}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-[10px] font-medium border-0 ${badgeColor}`}>{seg.speaker}</Badge>
                            <span className="text-[10px] text-muted-foreground/50 font-mono tracking-tight">{seg.startTime} — {seg.endTime}</span>
                          </div>
                          <p className="text-[13px] text-foreground/85 leading-7">{seg.text}</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-muted/30">
                    <pre className="text-[13px] text-foreground/85 whitespace-pre-wrap font-sans leading-7">{fullText}</pre>
                  </div>
                )}
              </div>

              {/* 底部音频播放器 */}
              <div className="px-4 py-2 shrink-0 border-t border-border/20 bg-[#FAFAFC] dark:bg-[#111115]">
                <AudioPlayer url={result.audioUrl} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：智能总结 */}
        <div className="w-full lg:w-80 lg:shrink-0 flex flex-col min-h-0">
          <Card className="flex flex-col h-auto lg:h-full border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 shrink-0 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-amber-400 dark:bg-amber-500" />
                  <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">智能总结</h3>
                </div>
                <div className="flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80"
                        onClick={handleRegenerateSummary}
                        disabled={isRegenerating}
                      >
                        {isRegenerating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCw className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>重新生成</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80" onClick={handleCopySummary}>
                        {summaryCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{summaryCopied ? '已复制' : '复制'}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 max-h-[40vh] lg:max-h-none space-y-4">
                {isRegenerating ? (
                  /* 重新生成 loading 骨架 */
                  <div className="space-y-5">
                    {/* 摘要骨架 */}
                    <div className="space-y-2">
                      <div className="h-2.5 bg-muted/60 animate-pulse rounded w-full" />
                      <div className="h-2.5 bg-muted/60 animate-pulse rounded w-5/6" />
                      <div className="h-2.5 bg-muted/60 animate-pulse rounded w-4/6" />
                      <div className="h-2.5 bg-muted/60 animate-pulse rounded w-full" />
                      <div className="h-2.5 bg-muted/60 animate-pulse rounded w-3/5" />
                    </div>
                    {/* 核心要点骨架 */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="w-1 h-3.5 rounded-full bg-amber-400/30" />
                        <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">核心要点</span>
                      </div>
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-100/30 dark:bg-amber-900/10 shrink-0 mt-0.5" />
                            <div className="h-2.5 bg-muted/50 animate-pulse rounded flex-1" style={{ maxWidth: `${85 - i * 10}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* 待办事项骨架 */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="w-1 h-3.5 rounded-full bg-emerald-400/30" />
                        <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">待办事项</span>
                      </div>
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded border border-border/30 bg-background/40 shrink-0 mt-0.5" />
                            <div className="h-2.5 bg-muted/50 animate-pulse rounded flex-1" style={{ maxWidth: `${80 - i * 8}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* 关键词骨架 */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <span className="w-1 h-3.5 rounded-full bg-sky-400/30" />
                        <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">关键词</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[40, 56, 32, 48, 36, 44, 28].map((w, i) => (
                          <div key={i} className="h-5 bg-muted/50 animate-pulse rounded-md" style={{ width: `${w}px` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : result.summary ? (
                  <div className="space-y-5">
                    {/* 智能总结正文 — 一体化的AI生成内容 */}
                    <div>
                      <p className="text-[13px] text-foreground/85 whitespace-pre-wrap font-sans leading-7">{result.summary}</p>
                    </div>

                    {/* 核心要点 */}
                    {result.keyPoints && result.keyPoints.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="w-1 h-3.5 rounded-full bg-amber-400/60" />
                          <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">核心要点</span>
                        </div>
                        <div className="space-y-2">
                          {result.keyPoints.map((point, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-100/60 dark:bg-amber-900/20 text-amber-600/70 dark:text-amber-300/60 text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                              <span className="text-[12px] text-foreground/70 leading-relaxed">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 待办事项 */}
                    {result.actionItems && result.actionItems.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="w-1 h-3.5 rounded-full bg-emerald-400/60" />
                          <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">待办事项</span>
                        </div>
                        <div className="space-y-2">
                          {result.actionItems.map((item, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <div className="w-4 h-4 rounded border border-border/50 bg-background/60 flex items-center justify-center shrink-0 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-sm" />
                              </div>
                              <span className="text-[12px] text-foreground/70 leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 关键词标签 */}
                    {result.keywords && result.keywords.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="w-1 h-3.5 rounded-full bg-sky-400/60" />
                          <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">关键词</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.keywords.map((kw, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground cursor-default transition-colors hover:bg-muted hover:text-foreground/80">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/50 text-center py-12">暂无智能总结</p>
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
    value: 'female-gentle', label: 'Bella', avatar: 'B',
    avatarBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
    tags: '温暖，知性，细腻',
    tagColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400',
  },
  {
    value: 'female-lively', label: 'Luna', avatar: 'L',
    avatarBg: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
    tags: '欢快，明亮，自信',
    tagColor: 'bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400',
  },
  {
    value: 'male-calm', label: 'Alex', avatar: 'A',
    avatarBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
    tags: '沉稳，大气，字正腔圆',
    tagColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  },
  {
    value: 'male-deep', label: 'Marcus', avatar: 'M',
    avatarBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
    tags: '低沉，醇厚，富有感染力',
    tagColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
  },
  {
    value: 'child', label: 'Milo', avatar: 'M',
    avatarBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    tags: '天真，灵动，自然',
    tagColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  },
]

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

function VoiceSettingsPopover({
  speed, volume,
  onSpeedChange, onVolumeChange,
}: {
  speed: number; volume: number
  onSpeedChange: (v: number) => void; onVolumeChange: (v: number) => void
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

function VoiceResultRow({
  voice, isSelected, isPlaying, onSelect, onTogglePlay,
  speed, volume, onSpeedChange, onVolumeChange,
}: {
  voice: typeof voicePresets[number]
  isSelected: boolean; isPlaying: boolean
  onSelect: () => void; onTogglePlay: () => void
  speed: number; volume: number
  onSpeedChange: (v: number) => void; onVolumeChange: (v: number) => void
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <div onClick={onSelect} className={cn(
      'group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
      isSelected
          ? 'bg-white dark:bg-muted/20 ring-1 ring-border/20'
          : 'hover:bg-white/60 dark:hover:bg-muted/20'
    )}>
      <div className="shrink-0">
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold', voice.avatarBg)}>{voice.avatar}</div>
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={cn('text-[13px] font-medium transition-colors tracking-tight', isSelected ? 'text-foreground' : 'text-foreground/80')}>{voice.label}</span>
        <span className={cn('inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-medium', voice.tagColor)}>{voice.tags}</span>
      </div>
      {isPlaying && (
        <div className="absolute bottom-0 inset-x-3 h-0.5 bg-foreground/10 rounded-full overflow-hidden">
          <div className="h-full bg-foreground/30 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      )}
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button onClick={(e) => { e.stopPropagation(); onTogglePlay() }} className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200',
          isPlaying ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/60'
        )}>
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <button onClick={(e) => { e.stopPropagation(); setSettingsOpen(!settingsOpen) }} className={cn(
              'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200',
              settingsOpen ? 'bg-muted text-foreground' : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/60'
            )}><Settings2 className="h-3.5 w-3.5" /></button>
          </PopoverTrigger>
          <VoiceSettingsPopover speed={speed} volume={volume} onSpeedChange={onSpeedChange} onVolumeChange={onVolumeChange} />
        </Popover>
      </div>
    </div>
  )
}

function TextToSpeechResult({ result, agent }: { result: AgentResultDetail; agent: Agent }) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [playingBgm, setPlayingBgm] = useState<string | null>(null)
  const [bgmSelectOpen, setBgmSelectOpen] = useState(false)
  const [text, setText] = useState(result.sourceText || '')
  const [paramValues, setParamValues] = useState<Record<string, any>>(() => ({
    voice: result.params?.voice || 'female-gentle',
    speed: result.params?.speed ?? 1.0,
    volume: result.params?.volume ?? 100,
    bgm: result.params?.bgm || '',
  }))
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>()

  const currentVoice = paramValues.voice || 'female-gentle'
  const currentSpeed = paramValues.speed ?? 1.0
  const currentVolume = paramValues.volume ?? 100
  const currentBgm = paramValues.bgm || ''

  const togglePreview = (voiceValue: string) => {
    if (playingVoice === voiceValue) { setPlayingVoice(null) }
    else { setPlayingVoice(voiceValue); setTimeout(() => setPlayingVoice(null), 2000) }
  }

  const toggleBgmPreview = (bgmValue: string) => {
    if (playingBgm === bgmValue) { setPlayingBgm(null) }
    else { setPlayingBgm(bgmValue); setTimeout(() => setPlayingBgm(null), 2000) }
  }

  const handleParamChange = (id: string, value: any) => {
    setParamValues((prev) => ({ ...prev, [id]: value }))
  }

  const handleRegenerate = () => {
    if (!text.trim()) { setError('请输入内容'); return }
    if (text.length > 5000) { setError('内容不能超过5000字'); return }
    setError(undefined)
    setIsProcessing(true)
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
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* ========================================== */}
      {/* LEFT: 文案 + 音频播放器                                        */}
      {/* ========================================== */}
      <div className="flex-1 min-w-0">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden h-full">
          <CardContent className="p-0 flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-4 rounded-full bg-emerald-400 dark:bg-emerald-500 shrink-0" />
                <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">生成音频</h3>
              </div>
              <div className="flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80" onClick={handleCopy}>
                      {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{copied ? '已复制' : '复制文案'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>下载音频</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="flex-1 px-4 py-3 min-h-0">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-0 h-full resize-none rounded-lg border-0 shadow-none bg-white dark:bg-[#0A0A0E] focus-visible:ring-0 text-[13px] leading-7 placeholder:text-muted-foreground/35"
                disabled={isProcessing}
              />
            </div>

            {/* 音频播放器 */}
            <div className="px-4 py-2 border-t border-border/20 bg-[#FAFAFC] dark:bg-[#111115]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <FileAudio className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground/80 truncate">{result.audioFileName || '生成的音频'}</p>
                  {result.audioInfo?.voiceName && (
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">{result.audioInfo.voiceName}</p>
                  )}
                </div>
              </div>
              {result.audioUrl && <audio src={result.audioUrl} controls className="w-full mt-2" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================== */}
      {/* RIGHT: 选择声音 + 背景音乐 + 重新生成                          */}
      {/* ========================================== */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden gap-0">
          <CardContent className="p-0">
            {/* 选择声音 */}
            <div>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
                <span className="w-1.5 h-4 rounded-full bg-rose-400/60 dark:bg-rose-500/60" />
                <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">选择声音</h3>
              </div>
              <div className="px-3 py-2 space-y-1.5">
                {voicePresets.map((voice) => (
                  <VoiceResultRow
                    key={voice.value}
                    voice={voice}
                    isSelected={currentVoice === voice.value}
                    isPlaying={playingVoice === voice.value}
                    onSelect={() => handleParamChange('voice', voice.value)}
                    onTogglePlay={() => togglePreview(voice.value)}
                    speed={currentSpeed} volume={currentVolume}
                    onSpeedChange={(v) => handleParamChange('speed', v)}
                    onVolumeChange={(v) => handleParamChange('volume', v)}
                  />
                ))}
              </div>
            </div>

            {/* 背景音乐 */}
            <div className="px-4 py-2.5 border-t border-border/20">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-muted-foreground/60 shrink-0">背景音乐</span>
                <Select open={bgmSelectOpen} onOpenChange={setBgmSelectOpen} value={currentBgm} onValueChange={(v) => { handleParamChange('bgm', v); setBgmSelectOpen(false) }}>
                  <SelectTrigger className="flex-1 h-8 rounded-md border border-border/30 bg-white dark:bg-[#0A0A0E] text-[12px] hover:border-border/50 transition-colors px-3 shadow-none focus-visible:ring-0">
                    {currentBgm ? (
                      <span className="text-foreground">{bgmOptions.find(o => o.value === currentBgm)?.label || currentBgm}</span>
                    ) : (
                      <span className="text-muted-foreground/50">选择背景音乐</span>
                    )}
                  </SelectTrigger>
                  <SelectContent align="start" className="w-[340px] p-2">
                    <div className="grid grid-cols-2 gap-1">
                      {bgmOptions.map((opt) => {
                        const isBgmPlaying = playingBgm === opt.value
                        return (
                          <div
                            key={opt.value}
                            onClick={() => { handleParamChange('bgm', opt.value); setBgmSelectOpen(false) }}
                            className={cn(
                              'group flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors text-foreground',
                              currentBgm === opt.value ? 'bg-muted/60' : 'hover:bg-muted/40'
                            )}
                          >
                            <div
                              className="shrink-0 relative w-5 h-5"
                              onClick={(e) => { e.stopPropagation(); if (opt.value !== 'none') toggleBgmPreview(opt.value) }}
                            >
                              {opt.value === 'none' ? (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px]">—</span>
                              ) : (
                                <>
                                  <Music className={cn('absolute inset-0 h-5 w-5 transition-opacity duration-200', isBgmPlaying ? 'opacity-0' : 'opacity-100 group-hover:opacity-0')} />
                                  <div className={cn('absolute inset-0 h-5 w-5 rounded flex items-center justify-center transition-opacity duration-200', isBgmPlaying ? 'opacity-100 bg-foreground/10' : 'opacity-0 group-hover:opacity-100 group-hover:bg-foreground/5')}>
                                    {isBgmPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-px" />}
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[12px] font-medium block truncate">{opt.label}</span>
                              {opt.sub && <span className="text-[10px] text-muted-foreground/50 block">{opt.sub} · {opt.duration}</span>}
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

        {/* 重新生成按钮 */}
        <Button
          className="w-full h-11 text-sm font-semibold gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
          onClick={handleRegenerate}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <><Loader2 className="h-4 w-4 animate-spin" />重新生成中...</>
          ) : (
            <><RefreshCw className="h-4 w-4" />重新生成
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
// 5.0 视频翻译 — 历史任务详情页（与生成结果页样式一致）
// ============================================================

function VideoTranslateHistoryResult({ result }: { result: AgentResultDetail }) {
  const raw = result.subtitleTracks || []
  // 按序两两配对：奇数位=原文(英文)，偶数位=翻译(中文)
  const pairs: { startTime: string; endTime: string; original: string; translated: string }[] = []
  for (let i = 0; i < raw.length; i += 2) {
    const orig = raw[i]
    const trans = raw[i + 1]
    if (orig && trans) {
      pairs.push({
        startTime: orig.startTime,
        endTime: orig.endTime,
        original: orig.text,
        translated: trans.text,
      })
    }
  }

  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 左: 翻译结果 */}
      <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden gap-0">
        <div className="flex items-center px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
          <span className="w-1.5 h-4 rounded-full bg-blue-400 dark:bg-blue-500 shrink-0" />
          <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight ml-2">翻译结果</h3>
        </div>
        <CardContent className="p-4">
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {pairs.map((p, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/60 px-1.5 py-0.5 rounded">
                    {p.startTime} → {p.endTime}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] text-muted-foreground/70 leading-relaxed">{p.original}</p>
                  <p className="text-[13px] text-foreground/90 font-medium leading-relaxed">{p.translated}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 右: 视频预览 */}
      <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden gap-0">
        <div className="flex items-center px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
          <span className="w-1.5 h-4 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0" />
          <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight ml-2">视频预览</h3>
        </div>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden border border-border/20 bg-black">
              {result.videoUrl && (
                <video ref={videoRef} src={result.videoUrl} className="w-full aspect-video" controls />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground/60">{result.videoFileName || 'translated-video.mp4'}</span>
              {result.videoUrl && (
                <a href={result.videoUrl} download={result.videoFileName || 'translated-video.mp4'}>
                  <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1.5 rounded-md">
                    <Download className="h-3 w-3" />下载视频
                  </Button>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// 5. 视频配字幕 — 左右布局：视频预览 + 字幕列表
// ============================================================

// ============================================================
// 5. 视频配字幕 — 历史任务详情页（与生成结果页样式一致）
// ============================================================

function VideoSubtitleResult({ result }: { result: AgentResultDetail }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [langMode, setLangMode] = useState<'bilingual' | 'original' | 'translated'>('bilingual')
  const subtitles = result.subtitleTracks?.map(t => ({ ...t, translatedText: t.translatedText || '' })) || []

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT: Video with subtitles overlay */}
      <div className="flex flex-col gap-3">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden flex flex-col">
          <div className="relative bg-black">
            {result.videoUrl && (
              <video ref={videoRef} src={result.videoUrl} className="w-full aspect-video"
                onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
                onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
                onEnded={() => setIsPlaying(false)} />
            )}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
              {(() => {
                const active = subtitles.find(s => {
                  const [sh, sm, ss] = s.startTime.split(':').map(Number)
                  const [eh, em, es] = s.endTime.split(':').map(Number)
                  return currentTime >= sh * 3600 + sm * 60 + ss && currentTime <= eh * 3600 + em * 60 + es
                })
                if (!active) return null
                return (
                  <div className="text-center px-4">
                    {(langMode === 'bilingual' || langMode === 'original') && (
                      <p className="text-white text-sm font-medium drop-shadow-lg bg-black/50 px-3 py-1 rounded">{active.text}</p>
                    )}
                    {(langMode === 'bilingual' || langMode === 'translated') && active.translatedText && (
                      <p className="text-yellow-300 text-xs drop-shadow-lg bg-black/50 px-3 py-0.5 rounded mt-0.5">{active.translatedText}</p>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
          <div className="p-3 space-y-2 border-t border-border/40 bg-[#F8F9FB] dark:bg-[#131418]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground/50 w-10">{ft(currentTime)}</span>
              <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
                className="flex-1 h-1.5 bg-muted/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
              <span className="text-[11px] text-muted-foreground/50 w-10 text-right">{duration ? ft(duration) : '00:00'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-foreground" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </Card>
        <div className="flex items-center gap-2 px-1">
          <FileVideo className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{result.videoFileName || 'subtitle-video.mp4'}</span>
        </div>
      </div>

      {/* RIGHT: Subtitle list */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg bg-muted/40 p-0.5 gap-0.5 ml-auto">
            <button onClick={() => setLangMode('original')} className={cn('h-7 text-[11px] px-2 rounded transition-colors', langMode === 'original' ? 'bg-white dark:bg-[#1A1A1E] shadow-sm' : 'text-muted-foreground')}>原文</button>
            <button onClick={() => setLangMode('translated')} className={cn('h-7 text-[11px] px-2 rounded transition-colors', langMode === 'translated' ? 'bg-white dark:bg-[#1A1A1E] shadow-sm' : 'text-muted-foreground')}>译文</button>
            <button onClick={() => setLangMode('bilingual')} className={cn('h-7 text-[11px] px-2 rounded transition-colors', langMode === 'bilingual' ? 'bg-white dark:bg-[#1A1A1E] shadow-sm' : 'text-muted-foreground')}>双语</button>
          </div>
        </div>

        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 flex-1">
          <CardContent className="p-4 max-h-[420px] overflow-y-auto">
            <div className="space-y-2">
              {subtitles.map((sub, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/60 px-1.5 py-0.5 rounded">
                      {sub.startTime} → {sub.endTime}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] text-foreground/80 leading-relaxed">{sub.text}</p>
                    {sub.translatedText && (
                      <p className="text-[13px] text-primary/80 leading-relaxed">{sub.translatedText}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" size="sm" className="w-full h-9 text-xs gap-2">
          <Download className="h-3.5 w-3.5" />导出字幕文件（SRT）
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// 6. 文案生成视频 — 视频 + 源文案
// ============================================================

function CopywritingToVideoResult({ result }: { result: AgentResultDetail }) {
  const [expanded, setExpanded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => { videoRef.current?.play() }
  const handleMouseLeave = () => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 } }
  return (
    <>
      <div className="space-y-4">
        <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden gap-0">
          <div className="flex items-center px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
            <span className="w-1.5 h-4 rounded-full bg-amber-400 dark:bg-amber-500 shrink-0" />
            <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight ml-2">生成结果 · {result.taskName}</h3>
          </div>
          <div className="p-4">
            {/* 视频预览区 — 缩略图模式，点击放大 */}
            <div
              className="rounded-lg overflow-hidden border border-border/20 bg-black relative cursor-pointer group mx-auto aspect-video w-full max-w-[400px]"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => setExpanded(true)}
            >
              {result.videoUrl && (
                <>
                  <video ref={videoRef} src={result.videoUrl} muted loop playsInline className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </>
              )}
              <Button className="absolute bottom-3 right-3 h-8 text-[11px] gap-1.5 rounded-lg shadow-md z-10" onClick={(e) => e.stopPropagation()}>
                <Download className="h-3.5 w-3.5" />下载视频
              </Button>
            </div>

            {result.videoInfo && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[
                  { label: '分辨率', value: result.videoInfo.resolution },
                  { label: '时长', value: result.videoInfo.duration },
                  { label: '格式', value: result.videoInfo.format },
                  { label: '帧率', value: result.videoInfo.frameRate },
                ].map((s) => (
                  <div key={s.label} className="p-2 rounded-lg bg-muted/30 border border-border/20 text-center">
                    <p className="text-xs font-semibold text-foreground/80">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground/50">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {result.sourceText && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border/20">
            <p className="flex-1 text-[13px] text-foreground/70 leading-7 whitespace-pre-wrap">{result.sourceText}</p>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground/50 hover:text-foreground hover:bg-muted/60" onClick={() => {}}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* 全屏弹窗 */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black border-0">
          <DialogTitle className="sr-only">视频预览</DialogTitle>
          {result.videoUrl && (
            <video src={result.videoUrl} controls autoPlay className="w-full max-h-[85vh] object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============================================================
// 6.1 图生视频 — 历史任务详情页（独立于生成结果页）
// ============================================================

function ImageToVideoResult({ result }: { result: AgentResultDetail }) {
  const [expanded, setExpanded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => { videoRef.current?.play() }
  const handleMouseLeave = () => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 } }

  return (
    <>
      <div className="space-y-4">
        {/* 视频预览 — 参考AI文案生视频的任务详情页 */}
        <div
          className="rounded-lg overflow-hidden border border-border/20 bg-black relative cursor-pointer group aspect-video w-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => setExpanded(true)}
        >
          {result.videoUrl && (
            <>
              <video ref={videoRef} src={result.videoUrl} muted loop playsInline className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                </div>
              </div>
            </>
          )}
          <Button className="absolute bottom-3 right-3 h-8 text-[11px] gap-1.5 rounded-lg shadow-md z-10" onClick={(e) => e.stopPropagation()}>
            <Download className="h-3.5 w-3.5" />下载视频
          </Button>
        </div>

        {/* 分辨率/时长/格式/帧率 标签 */}
        {result.videoInfo && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] px-2 py-1 rounded-md bg-muted/40 text-muted-foreground">{result.videoInfo.resolution}</span>
            <span className="text-[11px] px-2 py-1 rounded-md bg-muted/40 text-muted-foreground">{result.videoInfo.duration}</span>
            <span className="text-[11px] px-2 py-1 rounded-md bg-muted/40 text-muted-foreground">{result.videoInfo.format}</span>
            <span className="text-[11px] px-2 py-1 rounded-md bg-muted/40 text-muted-foreground">{result.videoInfo.frameRate}</span>
          </div>
        )}

        {/* 源文案 */}
        {result.sourceText && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border/20">
            <p className="flex-1 text-[13px] text-foreground/70 leading-7 whitespace-pre-wrap">{result.sourceText}</p>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground/50 hover:text-foreground hover:bg-muted/60">
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* 全屏弹窗 */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black border-0">
          <DialogTitle className="sr-only">视频预览</DialogTitle>
          {result.videoUrl && (
            <video src={result.videoUrl} controls autoPlay className="w-full max-h-[85vh] object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
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

  return (
    <div className="space-y-4">
      {/* 视频预览 — 可切换处理前/后 */}
      <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden">
        <div className="relative bg-black">
          <div className="absolute top-3 right-3 z-10 flex rounded-lg bg-black/50 p-0.5 gap-0.5">
            <button onClick={() => setViewMode('before')}
              className={cn('px-3 py-1 rounded-md text-[11px] font-medium transition-all',
                viewMode === 'before' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80')}>处理前</button>
            <button onClick={() => setViewMode('after')}
              className={cn('px-3 py-1 rounded-md text-[11px] font-medium transition-all',
                viewMode === 'after' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80')}>处理后</button>
          </div>
          {result.videoUrl && (
            <video ref={videoRef} src={result.videoUrl} className="w-full aspect-video"
              onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
              onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
              onEnded={() => setIsPlaying(false)} />
          )}
          {viewMode === 'after' && (
            <div className="absolute top-3 left-3 bg-green-600 text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
              <Volume2 className="h-3 w-3" /> 已配音
            </div>
          )}
        </div>
        <div className="p-3 space-y-2 border-t border-border/40 bg-[#F8F9FB] dark:bg-[#131418]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground/50 w-10">{ft(currentTime)}</span>
            <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
              className="flex-1 h-1.5 bg-muted/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            <span className="text-[11px] text-muted-foreground/50 w-10 text-right">{duration ? ft(duration) : '00:00'}</span>
          </div>
          <div className="flex items-center justify-between">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-foreground" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <div className="flex items-center gap-2">
              {result.audioUrl && (
                <a href={result.audioUrl} download={result.audioFileName}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 rounded-md">
                    <Download className="h-3 w-3" />下载配音音频
                  </Button>
                </a>
              )}
              {result.videoUrl && (
                <a href={result.videoUrl} download={result.videoFileName || 'dubbed-video.mp4'}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 rounded-md">
                    <Download className="h-3 w-3" />下载配音视频
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 px-1">
        <FileVideo className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">{result.videoFileName || 'dubbed-video.mp4'}</span>
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

  return (
    <div className="space-y-4">
      <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] gap-0 overflow-hidden">
        <div className="relative bg-black">
          <div className="absolute top-3 right-3 z-10 flex rounded-lg bg-black/50 p-0.5 gap-0.5">
            <button onClick={() => setViewMode('before')} className={cn('px-3 py-1 rounded-md text-[11px] font-medium transition-all', viewMode === 'before' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80')}>处理前</button>
            <button onClick={() => setViewMode('after')} className={cn('px-3 py-1 rounded-md text-[11px] font-medium transition-all', viewMode === 'after' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80')}>处理后</button>
          </div>
          {result.videoUrl && <video ref={videoRef} src={result.videoUrl} className="w-full aspect-video" onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)} onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)} onEnded={() => setIsPlaying(false)} />}
          {viewMode === 'after' && <div className="absolute top-3 left-3 bg-green-600 text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1"><Eraser className="h-3 w-3" />已去除</div>}
        </div>
        <div className="p-3 space-y-2 border-t border-border/40 bg-[#F8F9FB] dark:bg-[#131418]">
          <div className="flex items-center gap-2"><span className="text-[11px] text-muted-foreground/50 w-10">{ft(currentTime)}</span><input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className="flex-1 h-1.5 bg-muted/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" /><span className="text-[11px] text-muted-foreground/50 w-10 text-right">{duration ? ft(duration) : '00:00'}</span></div>
          <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-foreground" onClick={togglePlay}>{isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</Button></div>{result.videoUrl && <a href={result.videoUrl} download={result.videoFileName || 'clean-video.mp4'}><Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 rounded-md"><Download className="h-3 w-3" />下载去水印视频</Button></a>}</div>
        </div>
      </Card>
      <div className="flex items-center gap-2 px-1"><FileVideo className="h-4 w-4 text-primary shrink-0" /><span className="text-sm font-medium text-foreground truncate">{result.videoFileName || 'clean-video.mp4'}</span></div>
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
    <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden gap-0">
      {/* 标题栏 + 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-4 rounded-full bg-fuchsia-400 dark:bg-fuchsia-500 shrink-0" />
          <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight truncate">视频脚本</h3>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 ml-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80"
                onClick={() => {
                  if (isEditing) { handleSaveEdit() }
                  else { setEditedText(result.textContent || ''); setIsEditing(true) }
                }}
              >
                {isEditing ? <Save className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isEditing ? '保存' : '编辑'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? '已复制' : '复制全文'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80" onClick={handleExportTxt}>
                <Download className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>导出 TXT</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="sm" className="h-7 text-[11px] gap-1.5 rounded-md" onClick={handleGenerateVideo}>
                <Sparkles className="h-3 w-3" />生成视频
              </Button>
            </TooltipTrigger>
            <TooltipContent>基于脚本生成视频</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div>
        {/* 脚本内容 */}
        <div className="px-4 py-3">
          {isEditing ? (
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[200px] resize-none rounded-lg border-0 shadow-none bg-white dark:bg-[#0A0A0E] focus-visible:ring-0 text-[13px] leading-7"
            />
          ) : (
            <pre className="text-[13px] text-foreground/85 whitespace-pre-wrap font-sans leading-7 p-4 rounded-lg bg-white dark:bg-[#0A0A0E] max-h-[50vh] overflow-y-auto">
              {result.textContent}
            </pre>
          )}
        </div>

        {/* 视频关键词 */}
        {result.videoKeywords && result.videoKeywords.length > 0 && (
          <div className="px-4 py-2 border-t border-border/20 bg-[#FAFAFC] dark:bg-[#111115]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Hash className="h-3 w-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">视频关键词</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.videoKeywords.map((kw, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground cursor-default transition-colors hover:bg-muted hover:text-foreground/80">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
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
            <div className="w-full">
              {/* Loading 状态 */}
              <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden gap-0">
                <div className="p-10 flex flex-col items-center text-center space-y-5">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/60" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground/80">视频生成中…{Math.round(composingProgress)}%</p>
                    <p className="text-xs text-muted-foreground/50">我的灵感噼啪作响，客官的视频马上就好~</p>
                  </div>
                  <div className="w-full max-w-sm">
                    <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                      <div className="h-full bg-foreground/20 transition-all duration-300 rounded-full" style={{ width: `${composingProgress}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="w-full space-y-4">
              {/* 合成完成 - 视频预览 */}
              <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden gap-0 relative">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-black">
                    <video
                      src={composedVideoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                </CardContent>
                <Button className="absolute bottom-3 right-3 h-8 text-[11px] gap-1.5 rounded-lg shadow-md" onClick={() => {}}>
                  <Download className="h-3.5 w-3.5" />下载视频
                </Button>
              </Card>
              
              {/* 下载按钮已嵌入视频卡片右下角 */}

              {/* 可复制的文案 */}
              {result.sourceText && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border/20">
                  <p className="flex-1 text-[13px] text-foreground/70 leading-7 whitespace-pre-wrap">{result.sourceText}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground/50 hover:text-foreground hover:bg-muted/60" onClick={handleCopySourceText}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 源文案 */}
          {result.sourceText && (
            <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden gap-0">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20 bg-[#F8F9FB] dark:bg-[#131418]">
                <span className="w-1.5 h-4 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0" />
                <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">视频文案</h3>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-foreground/70 leading-7">{result.sourceText}</p>
              </div>
            </Card>
          )}

          {/* 分镜 + 预览 */}
          {shots.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 左侧：分镜列表 - 占 40% 宽度，固定高度可滚动 */}
              <div className="w-full lg:w-2/5 space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="w-1.5 h-4 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0" />
                  <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">分镜脚本</h3>
                  <span className="text-[10px] text-muted-foreground/50">{shots.length} 镜</span>
                </div>

                {/* 分镜卡片容器 - 固定高度可滚动 */}
                <div 
                  className="space-y-2 overflow-y-auto pr-1"
                  style={{ maxHeight: 'calc(100vh - 180px)' }}
                >
                  {shots.map((shot) => {
                    const isActive = activeShotId === shot.id
                    return (
                      <div
                        key={shot.id}
                        onClick={() => setActiveShotId(shot.id)}
                        className={cn(
                          'group rounded-lg border overflow-hidden transition-all cursor-pointer',
                          isActive
                            ? 'border-border/30 bg-white dark:bg-[#0A0A0E] ring-1 ring-border/20'
                            : 'border-transparent bg-[#FAFAFC] dark:bg-[#111115] hover:bg-white dark:hover:bg-[#0A0A0E] hover:border-border/30'
                        )}
                      >
                        <div className="flex gap-3 p-2.5">
                          <div className="relative shrink-0 w-[120px] aspect-video rounded-md overflow-hidden bg-muted/40">
                            {shot.imageUrl ? (
                              <img src={shot.imageUrl} alt={`镜${shot.index}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                <ImagePlus className="h-5 w-5" />
                              </div>
                            )}
                            <span className="absolute bottom-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white/80">镜{shot.index}</span>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground/50">{shot.duration}</span>
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDeleteShot(shot.id) }}>
                                <Trash2 className="h-3 w-3 text-muted-foreground/50" />
                              </Button>
                            </div>
                            <Textarea
                              ref={(el) => { textareaRefs.current[shot.id] = el }}
                              value={shot.caption || shot.description}
                              onChange={(e) => handleCaptionChange(shot.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 min-h-[48px] resize-none rounded-md border-0 shadow-none bg-transparent text-[12px] leading-relaxed p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30"
                              placeholder="输入字幕…"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 右侧：视频预览 */}
              <div className="w-full lg:w-3/5 space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="w-1.5 h-4 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0" />
                  <h3 className="text-[13px] font-medium text-foreground/80 tracking-tight">视频预览</h3>
                </div>

                <Card className="border border-border/30 shadow-none bg-[#FBFBFD] dark:bg-[#0F0F12] overflow-hidden gap-0" style={{ height: 'calc(100vh - 180px)' }}>
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative flex-1 bg-black">
                      <video key={composedVideoUrl} src={composedVideoUrl} controls className="w-full h-full object-contain" poster={activeShot?.imageUrl} />
                      {activeShot?.caption && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-[90%] px-3 py-1.5 rounded-md bg-black/70 text-white text-xs text-center line-clamp-2">
                          {activeShot.caption}
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-border/20 bg-[#FAFAFC] dark:bg-[#111115] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground/50">
                        <span>镜{activeShot?.index || 1} / {shots.length}</span>
                        <span>{activeShot?.duration}</span>
                      </div>
                      <Button className="w-full h-9 text-[12px] gap-1.5 rounded-lg" onClick={handleCompose} disabled={isComposing}>
                        {isComposing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />合成中…</> : <><Sparkles className="h-3.5 w-3.5" />合成完整视频</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {shots.length === 0 && (
            <div className="text-center py-10 text-xs text-muted-foreground border border-border/30 rounded-lg">
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
        return <ImageToVideoResult result={result} />
      case 'video-translate':
        return <VideoTranslateHistoryResult result={result} />
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
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full p-5 md:p-7 pb-12">
        {/* 返回 */}
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground/60 hover:text-foreground w-fit -ml-1.5">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />返回{agent.name}
        </Button>

        {/* 头部 */}
        <ResultHeader result={result} agent={agent} fileName={fileName} />

        {/* 结果内容 */}
        {renderResult()}
      </div>
    </div>
  )
}
