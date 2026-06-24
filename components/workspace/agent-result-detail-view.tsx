'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { AgentResultDetail } from '@/lib/mock-result-data'
import type { Agent } from '@/lib/mock-data'
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
  Languages,
  Play,
  Pause,
  Volume2,
  ImagePlus,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Calendar,
  Search,
  Globe,
  Users,
  ListTodo,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AgentResultDetailViewProps {
  result: AgentResultDetail
  agent: Agent
  onBack: () => void
}

// ============================================================
// 头部信息条
// ============================================================

function ResultHeader({ result, agent }: { result: AgentResultDetail; agent: Agent }) {
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
            <h1 className="text-sm font-semibold text-foreground">{result.taskName}</h1>
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
// 1. 语音转文字 — 说话人分段 + 原文
// ============================================================

function SpeechToTextResult({ result }: { result: AgentResultDetail }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(result.textContent || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleCopy}>
          {copied ? <><CheckCircle2 className="h-3 w-3 text-primary" />已复制</> : <><Copy className="h-3 w-3" />复制全文</>}
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Download className="h-3 w-3" />导出 TXT
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Languages className="h-3 w-3" />翻译
        </Button>
      </div>

      {/* 分段展示 */}
      {result.segments && result.segments.length > 0 ? (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {result.segments.map((seg) => (
            <div key={seg.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="secondary" className="text-[10px]">{seg.speaker}</Badge>
                <span className="text-[11px] text-muted-foreground font-mono">{seg.startTime} - {seg.endTime}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{seg.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 max-h-[500px] overflow-y-auto">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{result.textContent}</pre>
        </div>
      )}

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '总字数', value: result.textContent?.length || 0 },
          { label: '说话人', value: '1人' },
          { label: '段落', value: result.segments?.length || 0 },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-secondary/20 border border-border/50 text-center">
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// 2. 文字转语音 — 音频播放 + 源文本
// ============================================================

function TextToSpeechResult({ result }: { result: AgentResultDetail }) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="space-y-4">
      {/* 音频播放器 */}
      <div className="rounded-xl overflow-hidden border border-slate-700/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center transition-all shrink-0',
                'bg-white/10 hover:bg-white/15 border border-white/10',
                isPlaying && 'bg-primary/20 border-primary/30'
              )}
            >
              {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-1" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white/90 truncate">{result.audioFileName}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                <span>{result.audioInfo?.voiceName}</span>
                <span>·</span>
                <span>{result.audioInfo?.duration}</span>
                <span>·</span>
                <span>{result.audioInfo?.format} {result.audioInfo?.bitrate}</span>
              </div>
            </div>
          </div>
          {/* 波形装饰 */}
          <div className="flex items-end gap-px h-8 opacity-25">
            {[4,8,12,6,16,10,20,14,18,8,22,12,16,24,10,14,6,18,12,20,8,16,10,22,14,18,6,12,20,8,16,10,4,14,18,8,22,12,16,6,20,10,14,8,18,12,6,10].map((h, i) => (
              <div key={i} className="flex-1 rounded-full bg-white/25" style={{ height: `${h}px` }} />
            ))}
          </div>
          {result.audioUrl && <audio src={result.audioUrl} controls className="w-full mt-3" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />}
        </div>
      </div>

      {/* 源文本对照 */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">源文本</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/30 rounded-lg p-3">{result.sourceText}</p>
        </CardContent>
      </Card>

      {/* 操作 */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10 text-sm"><Download className="h-4 w-4 mr-2" />下载音频</Button>
        <Button variant="outline" className="flex-1 h-10 text-sm"><Copy className="h-4 w-4 mr-2" />复制链接</Button>
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
// 5. 视频配字幕 — 视频 + 字幕轨道
// ============================================================

function VideoSubtitleResult({ result }: { result: AgentResultDetail }) {
  return (
    <div className="space-y-4">
      {/* 视频 */}
      <div className="rounded-xl overflow-hidden border border-border bg-black">
        {result.videoUrl && <video controls className="w-full max-h-[300px]"><source src={result.videoUrl} /></video>}
      </div>

      {/* 字幕列表 */}
      {result.subtitleTracks && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">字幕轨道</h3>
              <Badge variant="secondary" className="text-[10px]">{result.subtitleTracks.length} 条</Badge>
            </div>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {result.subtitleTracks.map((track) => (
                <div key={track.index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors group">
                  <span className="text-[11px] text-muted-foreground font-mono shrink-0 mt-0.5 w-10">{track.index}</span>
                  <span className="text-[11px] text-muted-foreground font-mono shrink-0 mt-0.5 w-20">{track.startTime} - {track.endTime}</span>
                  <span className="text-sm text-foreground leading-relaxed flex-1">{track.text}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10"><Download className="h-4 w-4 mr-2" />下载字幕</Button>
        <Button variant="outline" className="flex-1 h-10"><Download className="h-4 w-4 mr-2" />下载视频</Button>
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
// 7. 视频配音 — 多人配音分段
// ============================================================

function VideoDubbingResult({ result }: { result: AgentResultDetail }) {
  const [playingId, setPlayingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {result.audioUrl && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPlayingId(playingId === 'main' ? null : 'main')}
                className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0',
                  playingId === 'main' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}
              >
                {playingId === 'main' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{result.audioFileName}</p>
                <p className="text-xs text-muted-foreground">{result.audioInfo?.voiceName} · {result.audioInfo?.duration} · {result.audioInfo?.format}</p>
              </div>
            </div>
            {result.audioUrl && playingId === 'main' && <audio src={result.audioUrl} autoPlay controls className="w-full mt-3" onEnded={() => setPlayingId(null)} />}
          </CardContent>
        </Card>
      )}

      {result.multiVoiceResults && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />分角色配音
          </h3>
          {result.multiVoiceResults.map((mv) => {
            const isPlaying = playingId === mv.audioUrl
            return (
              <Card key={mv.speaker} className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => setPlayingId(isPlaying ? null : mv.audioUrl)}
                      className={cn('w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0',
                        isPlaying ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{mv.speaker}</p>
                        <Badge variant="secondary" className="text-[10px]">{mv.voiceType}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{mv.text.length}字</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">{mv.text}</p>
                  {mv.audioUrl && isPlaying && <audio src={mv.audioUrl} autoPlay controls className="w-full mt-3" onEnded={() => setPlayingId(null)} />}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Button variant="outline" className="w-full h-10"><Download className="h-4 w-4 mr-2" />下载全部音频</Button>
    </div>
  )
}

// ============================================================
// 8. 主体生成视频文案 — 结构化脚本
// ============================================================

function TopicToCopywritingResult({ result }: { result: AgentResultDetail }) {
  return (
    <div className="space-y-4">
      {/* 钩子 */}
      {result.copywritingHook && (
        <Card className="border-rose-200/60 dark:border-rose-900/30 bg-gradient-to-r from-rose-50/50 to-transparent dark:from-rose-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-rose-100 text-rose-700 text-[10px] dark:bg-rose-950/50 dark:text-rose-300">🎯 开头钩子</Badge>
            </div>
            <p className="text-base font-medium text-foreground leading-relaxed">"{result.copywritingHook}"</p>
          </CardContent>
        </Card>
      )}

      {/* 正文 */}
      {result.copywritingBody && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-blue-100 text-blue-700 text-[10px] dark:bg-blue-950/50 dark:text-blue-300">📖 正文内容</Badge>
            </div>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-secondary/20 rounded-lg p-4">{result.copywritingBody}</pre>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      {result.copywritingCTA && (
        <Card className="border-amber-200/60 dark:border-amber-900/30 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-amber-100 text-amber-700 text-[10px] dark:bg-amber-950/50 dark:text-amber-300">📢 行动号召 (CTA)</Badge>
            </div>
            <p className="text-base font-medium text-foreground leading-relaxed">"{result.copywritingCTA}"</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10"><Copy className="h-4 w-4 mr-2" />复制全文</Button>
        <Button variant="outline" className="flex-1 h-10"><Sparkles className="h-4 w-4 mr-2" />一键生成视频</Button>
      </div>
    </div>
  )
}

// ============================================================
// 9. 文案生成视频(高级) — 分镜脚本
// ============================================================

function CopywritingToVideoAdvancedResult({ result }: { result: AgentResultDetail }) {
  const [expandedShot, setExpandedShot] = useState<string | null>(null)

  return (
    <div className="space-y-4">
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

      {result.storyboard && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">分镜脚本</h3>
            <Badge variant="secondary" className="text-[10px]">{result.storyboard.length} 镜</Badge>
          </div>
          {result.storyboard.map((shot) => {
            const isExpanded = expandedShot === shot.id
            return (
              <div key={shot.id} className={cn('rounded-xl border overflow-hidden transition-all', isExpanded ? 'border-primary/30 bg-primary/5' : 'border-border bg-card hover:border-primary/20')}>
                <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpandedShot(isExpanded ? null : shot.id)}>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">镜{shot.index}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{shot.description}</p>
                    <p className="text-[11px] text-muted-foreground">时长: {shot.duration}</p>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3">
                    {shot.imageUrl && (
                      <div className="rounded-lg overflow-hidden border border-border">
                        <img src={shot.imageUrl} alt={`镜${shot.index}`} className="w-full h-40 object-cover" />
                      </div>
                    )}
                    {shot.voiceUrl && <audio src={shot.voiceUrl} controls className="w-full" />}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs"><ImagePlus className="h-3 w-3 mr-1" />替换画面</Button>
                      <Button variant="outline" size="sm" className="text-xs"><RefreshCw className="h-3 w-3 mr-1" />重新生成</Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Button className="w-full h-10"><Sparkles className="h-4 w-4 mr-2" />合成完整视频</Button>
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

export function AgentResultDetailView({ result, agent, onBack }: AgentResultDetailViewProps) {
  // 按 agentId 分派不同的结果渲染
  const renderResult = () => {
    switch (result.agentId) {
      case 'speech-to-text':
        return <SpeechToTextResult result={result} />
      case 'text-to-speech':
        return <TextToSpeechResult result={result} />
      case 'video-to-text':
        return <SpeechToTextResult result={result} />
      case 'topic-to-copywriting':
        return <TopicToCopywritingResult result={result} />
      case 'copywriting-to-video':
        return <CopywritingToVideoAdvancedResult result={result} />
      case 'image-to-video':
        return <CopywritingToVideoResult result={result} />
      case 'video-translate':
        return <VideoSubtitleResult result={result} />
      case 'video-dubbing':
        return <VideoDubbingResult result={result} />
      case 'video-subtitle':
        return <VideoSubtitleResult result={result} />
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
        <ResultHeader result={result} agent={agent} />

        {/* 结果内容 */}
        {renderResult()}

        {/* 参数摘要 */}
        <ParamsSummary params={result.params} />
      </div>
    </div>
  )
}
