'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Send,
  ImagePlay,
  Minus,
  Plus,
  Volume2,
  Zap,
  Loader2,
  Plus as PlusIcon,
  X,
  Crown,
  RotateCw,
  Download,
  Copy,
  Trash2,
  ArrowUp,
  Image as ImageIcon,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'
import { toast } from 'sonner'

// ============================================================
// Types
// ============================================================

interface ImageToVideoExperienceProps {
  agent: Agent
  text: string
  paramValues: Record<string, any>
  onTextChange: (text: string) => void
  onParamChange: (id: string, value: any) => void
  error?: string
  isProcessing?: boolean
  onStartProcess: () => void
}

interface ChatTurn {
  id: string
  prompt: string
  referenceImage: string | null
  params: Record<string, any>
  videoUrl: string | null
  status: 'processing' | 'done'
}

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

const durationOptions = Array.from({ length: 13 }, (_, i) => (i + 3).toString())

const generationSteps = [
  { label: '分析参考图片', duration: 800 },
  { label: '理解创作意图', duration: 1200 },
  { label: '生成视频画面', duration: 2000 },
  { label: '合成完整视频', duration: 1500 },
]

const mockVideoResults: Record<string, string> = {
  '16:9': 'https://picsum.photos/seed/video-result-169/960/540',
  '9:16': 'https://picsum.photos/seed/video-result-916/540/960',
  '1:1': 'https://picsum.photos/seed/video-result-11/600/600',
  'auto': 'https://picsum.photos/seed/video-result-auto/960/540',
}

const examplePlaceholder =
  '示例：花园的叶子上，住着一群小精灵。镜头右摇，主角从家中走出——身着花瓣斗篷，手持草叶魔杖，魔杖顶端嵌着一颗发光的黄色宝石。微观世界风格。小精灵用低沉的声音说："美好的清晨，从早安开始。"'

const LINE_HEIGHT = 24
const MAX_LINES = 6

// ============================================================
// Sub-components
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

  const decrease = () => { if (canDecrease) onChange(durationOptions[index - 1]) }
  const increase = () => { if (canIncrease) onChange(durationOptions[index + 1]) }

  const [showPopup, setShowPopup] = useState(false)

  return (
    <div className="relative inline-flex items-center">
      <div
        className="inline-flex items-center rounded-lg border border-border/60 bg-secondary/30 overflow-hidden cursor-pointer"
        onClick={() => setShowPopup(!showPopup)}
      >
        <button type="button" onClick={decrease} disabled={!canDecrease} className="h-8 w-7 flex items-center justify-center text-muted-foreground hover:bg-secondary/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <Minus className="h-3 w-3" />
        </button>
        <span className="h-8 px-2 flex items-center justify-center text-xs font-medium tabular-nums min-w-[3rem]">{value}S</span>
        <button type="button" onClick={increase} disabled={!canIncrease} className="h-8 w-7 flex items-center justify-center text-muted-foreground hover:bg-secondary/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <Plus className="h-3 w-3" />
        </button>
      </div>
      {showPopup && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#2D2D2D] text-white rounded-xl p-4 shadow-2xl z-50 min-w-[220px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">时长设置</span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <button type="button" onClick={() => setShowPopup(false)} className="text-neutral-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-3">
            <input type="range" min="3" max="15" value={Number(value)} onChange={(e) => onChange(e.target.value)} className="w-full h-2 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-green-400" />
          </div>
          <div className="flex justify-between text-sm text-neutral-400">
            <span>3S</span><span>15S</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// ChatGPT-style shimmer skeleton for loading
// ============================================================

function ShimmerPlaceholder() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
        <span className="text-xs text-muted-foreground">正在生成视频...</span>
      </div>
      {/* Shimmer box — ChatGPT style */}
      <div className="w-[280px] h-[158px] rounded-xl overflow-hidden relative bg-[#E5E7EB]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style={{ width: '200%', animation: 'shimmer 1.8s ease-in-out infinite' }} />
        {/* Play icon center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
            <Play className="h-5 w-5 text-black/30 fill-current" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Thumbnail card for generated video
// ============================================================

function VideoThumbnail({ turn }: { turn: ChatTurn }) {
  const [hovered, setHovered] = useState(false)
  const [videoSrc] = useState(turn.videoUrl)
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Extract thumbnail from first frame
  useEffect(() => {
    if (!videoRef.current || !videoSrc) return
    const video = videoRef.current
    const onLoaded = () => {
      video.currentTime = 0.1
    }
    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        setThumbnailSrc(canvas.toDataURL('image/jpeg', 0.7))
      }
    }, { once: true })
    return () => video.removeEventListener('loadeddata', onLoaded)
  }, [videoSrc])

  // Fallback: use picsum as thumbnail if video frame extraction fails
  const displayThumbnail = thumbnailSrc || mockVideoResults[turn.params.ratio] || mockVideoResults['auto']

  return (
    <div className="space-y-2">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="block w-[280px] h-[158px] rounded-xl overflow-hidden relative group cursor-pointer border border-border/40 focus:outline-none"
          >
            {/* Thumbnail image */}
            <img
              src={displayThumbnail}
              alt="视频预览"
              className="w-full h-full object-cover"
            />
            {/* Hidden video for sound */}
            {videoSrc && (
              <video ref={videoRef} src={videoSrc} className="hidden" preload="auto" />
            )}
            {/* Play overlay */}
            <div className={cn(
              'absolute inset-0 flex items-center justify-center bg-black transition-opacity duration-200',
              hovered ? 'opacity-20' : 'opacity-0'
            )}>
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl transition-transform duration-200 group-hover:scale-110">
                <Play className="h-6 w-6 text-black fill-current ml-1" />
              </div>
            </div>
            {/* Duration badge */}
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] tabular-nums">
              {turn.params.duration}s
            </div>
          </button>
        </DialogTrigger>

        {/* Full video modal — Dialog 自带关闭按钮 + 动画 */}
        <DialogContent className="max-w-3xl border-border/60" showCloseButton={false}>
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {/* 统一使用 <video> 标签，mock 数据即使为图片也渲染为 video */}
            <video
              src={videoSrc}
              controls
              autoPlay
              className="w-full h-full object-contain"
              preload="auto"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Info bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <span>时长: {turn.params.duration}s</span>
          <span>·</span>
          <span>分辨率: {turn.params.resolution}</span>
        </div>
      </div>

      {/* Expiry */}
      <p className="text-xs text-muted-foreground px-1">
        视频地址有效期为24小时，请及时
        <button
          onClick={() => {
            if (videoSrc) {
              const a = document.createElement('a')
              a.href = videoSrc
              a.download = `video-${Date.now()}.mp4`
              a.click()
            }
          }}
          className="mx-1 text-foreground hover:text-primary underline transition-colors"
        >
          【下载视频】
        </button>
        到本地。
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg" onClick={() => navigator.clipboard.writeText(turn.prompt)}>
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">复制提示词</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg" onClick={() => {
                setChatInputValue(turn.prompt)
                setChatImage(turn.referenceImage)
              }}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">重新生成</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg" onClick={() => {
                if (videoSrc) {
                  const a = document.createElement('a')
                  a.href = videoSrc
                  a.download = `video-${Date.now()}.mp4`
                  a.click()
                }
              }}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">下载</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg" onClick={() => {
                navigator.clipboard.writeText(videoSrc || '')
              }}>
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">复制链接</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">删除</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function ImageToVideoExperienceArea({
  agent,
  text,
  paramValues,
  onTextChange,
  onParamChange,
  error,
  isProcessing,
  onStartProcess,
}: ImageToVideoExperienceProps) {
  const mode = paramValues.mode || 'image-to-video'
  const ratio = paramValues.ratio || 'auto'
  const resolution = paramValues.resolution || '540p'
  const duration = String(paramValues.duration || '5')
  const bgm = !!paramValues.bgm

  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // ---- Chat state ----
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([])
  const [chatInputValue, setChatInputValue] = useState('')
  const [chatImage, setChatImage] = useState<string | null>(null)
  const [processingTurnId, setProcessingTurnId] = useState<string | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatImageInputRef = useRef<HTMLInputElement>(null)
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Fix #12: track if user has uploaded an image for chat input
  const hasChatImage = !!chatImage

  const isChatting = chatTurns.length > 0

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatTurns, processingTurnId, activeStepIndex])

  // Cleanup
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Auto resize chat textarea
  useEffect(() => {
    const el = chatTextareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const newHeight = Math.min(el.scrollHeight, LINE_HEIGHT * MAX_LINES)
    el.style.height = `${newHeight}px`
  }, [chatInputValue])

  // Run generation for a turn
  useEffect(() => {
    if (!processingTurnId) return

    let currentStep = 0
    const runStep = () => {
      if (currentStep >= generationSteps.length) {
        setActiveStepIndex(generationSteps.length)
        const videoUrl = mockVideoResults[ratio] || mockVideoResults['auto']
        setChatTurns(prev =>
          prev.map(t => t.id === processingTurnId ? { ...t, videoUrl, status: 'done' } : t)
        )
        setProcessingTurnId(null)
        return
      }
      setActiveStepIndex(currentStep)
      currentStep++
      timerRef.current = setTimeout(runStep, generationSteps[currentStep - 1].duration)
    }
    timerRef.current = setTimeout(runStep, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [processingTurnId, ratio])

  // ---- Send handler (first send from input card) ----
  const handleSend = useCallback(() => {
    if (processingTurnId) return
    if (mode === 'image-to-video' && !uploadedImage) {
      toast.error('请先上传图片', { description: '上传一张图片作为视频生成的参考图' })
      return
    }
    if (!text.trim()) {
      toast.error('请输入提示词', { description: '描述您想要生成的视频效果' })
      return
    }

    const turn: ChatTurn = {
      id: `turn-${Date.now()}`,
      prompt: text,
      referenceImage: uploadedImage,
      params: { mode, ratio, resolution, duration, bgm },
      videoUrl: null,
      status: 'processing',
    }

    setChatTurns([turn])
    setChatInputValue('')
    setChatImage(null)
    setActiveStepIndex(0)
    setUploadedImage(null)
    setProcessingTurnId(turn.id)
    onStartProcess()
    onTextChange('')
  }, [processingTurnId, mode, uploadedImage, text, ratio, resolution, duration, bgm, onStartProcess, onTextChange])

  // ---- Send handler (from chat input) ----
  const handleChatSend = useCallback(() => {
    if (processingTurnId) return
    if (!chatInputValue.trim()) return

    const turn: ChatTurn = {
      id: `turn-${Date.now()}`,
      prompt: chatInputValue,
      referenceImage: chatImage,
      params: { mode, ratio, resolution, duration, bgm },
      videoUrl: null,
      status: 'processing',
    }

    setChatTurns(prev => [...prev, turn])
    setChatInputValue('')
    setChatImage(null)
    setActiveStepIndex(0)
    setProcessingTurnId(turn.id)
    onStartProcess()
  }, [processingTurnId, chatInputValue, chatImage, mode, ratio, resolution, duration, bgm, onStartProcess])

  // ---- Image upload for chat input ----
  const handleChatImageUpload = () => {
    chatImageInputRef.current?.click()
  }
  const handleChatImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setChatImage(URL.createObjectURL(file))
    e.target.value = ''
  }

  // ---- Image upload for initial input ----
  const handleImageUpload = () => { imageInputRef.current?.click() }
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setUploadedImage(URL.createObjectURL(file))
    e.target.value = ''
  }

  // ============================================================
  // RENDER: Chat Mode — 用 flex 自适应高度
  // ============================================================
  if (isChatting) {
    return (
      <div className="w-full flex flex-col h-full">
        {/* Messages Area — flex-1 自动填充剩余空间 */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-6 space-y-8">
            {chatTurns.map((turn, turnIdx) => {
              const isProcessing = turn.status === 'processing'
              const isLatestTurn = turnIdx === chatTurns.length - 1
              return (
                <div key={turn.id} className="space-y-4">
                  {/* ---- User Message (right-aligned) ---- */}
                  {/* 顺序：图片 → 提示词 → 参数 */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] w-fit space-y-2">
                      {/* Fix #5: 统一用固定尺寸+圆角+边框展示参考图 */}
                      {turn.referenceImage && (
                        <img
                          src={turn.referenceImage}
                          alt="参考图"
                          className="w-[208px] h-[208px] rounded-xl object-cover border border-border/40"
                        />
                      )}
                      {/* Fix #7: 提示词加 line-clamp-3 限制行数 */}
                      {turn.prompt && (
                        <p className="text-sm text-foreground line-clamp-3">{turn.prompt}</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">{turn.params.duration}s</Badge>
                        <Badge variant="secondary" className="text-[10px]">{turn.params.ratio}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{turn.params.resolution}</Badge>
                        {/* Fix #9: BGM badge 用不同颜色区分 */}
                        {turn.params.bgm && (
                          <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">BGM</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ---- AI Response (left-aligned) ---- */}
                  <div className="flex gap-3">
                    <div className="text-xl flex-shrink-0 mt-0.5">🎬</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {agent.name}
                      </p>

                      {/* Loading: ChatGPT-style shimmer placeholder */}
                      {isProcessing && isLatestTurn && <ShimmerPlaceholder />}

                      {/* Done: small thumbnail, click to open modal */}
                      {!isProcessing && turn.videoUrl && <VideoThumbnail turn={turn} />}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fix #1: 底部输入区用 flex-shrink-0 不再用 calc(100vh) */}
        <div className="shrink-0 border-t border-border bg-background">
          <div className="rounded-b-lg" style={{ backgroundColor: '#F7F8FB' }}>
            {/* Chat Image Preview */}
            {chatImage && (
              <div className="px-4 pt-3">
                <div className="relative inline-flex">
                  <img src={chatImage} alt="参考图" className="w-12 h-12 rounded-lg object-cover border border-border/60" />
                  <button
                    onClick={() => setChatImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-foreground/70 text-background flex items-center justify-center"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Textarea + Buttons */}
            <div className="p-4 flex items-end gap-3">
              {/* Fix #4: 图片上传按钮添加 active:scale-95 反馈 */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-10 w-10 shrink-0 active:scale-95 transition-transform"
                      onClick={handleChatImageUpload}
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">上传参考图片</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Textarea
                ref={chatTextareaRef}
                value={chatInputValue}
                onChange={(e) => setChatInputValue(e.target.value)}
                placeholder="输入提示词继续生成视频..."
                rows={1}
                className="flex-1 min-h-[24px] max-h-[144px] resize-none border-0 bg-transparent focus-visible:ring-0 shadow-none text-sm p-0 leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleChatSend()
                  }
                }}
              />

              {/* Fix #3: 发送按钮使用品牌色 #6642D8 与首页一致 */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      className={cn(
                        'h-10 w-10 rounded-full shrink-0',
                        chatInputValue.trim() || hasChatImage
                          ? 'bg-[#6642D8] hover:bg-[#5A3AD4] text-white'
                          : 'bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#9CA3AF]'
                      )}
                      onClick={handleChatSend}
                      disabled={!chatInputValue.trim() && !hasChatImage}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{hasChatImage ? '开始生成' : '发送对话'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50">
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <ToolbarSelect value={mode} options={modeOptions} onChange={(v) => onParamChange('mode', v)} className="min-w-[5rem] h-8 text-xs" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>选择生成模式</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="w-px h-4 bg-border/50 mx-1" />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <ToolbarSelect value={ratio} options={ratioOptions} onChange={(v) => onParamChange('ratio', v)} className="min-w-[4rem] h-8 text-xs" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>画面比例</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <ToolbarSelect value={resolution} options={resolutionOptions} onChange={(v) => onParamChange('resolution', v)} className="min-w-[4rem] h-8 text-xs" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>清晰度</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="w-px h-4 bg-border/50 mx-1" />

                <DurationStepper value={duration} onChange={(v) => onParamChange('duration', v)} />

                <div className="w-px h-4 bg-border/50 mx-1" />

                <div className="inline-flex items-center gap-1.5 h-8 px-2 rounded-lg border border-border/60 bg-secondary/30">
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">声音</span>
                  <Switch checked={bgm} onCheckedChange={(checked) => onParamChange('bgm', checked)} className="scale-75 data-[state=checked]:bg-primary" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span className="font-semibold text-foreground tabular-nums">{agent.costPoints} 智点</span>
                </div>
              </div>
            </div>
          </div>

          <input
            ref={chatImageInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,.bmp"
            className="hidden"
            onChange={handleChatImageFileChange}
          />
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER: Initial Input View
  // ============================================================

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <ImagePlay className="h-5 w-5 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          你想创作什么视频？
        </h2>
      </div>

      {/* Input Card */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-0 flex flex-col">
          <div className={cn(
            'min-h-[260px] h-full p-5',
            mode === 'image-to-video' ? 'flex gap-4' : ''
          )}>
            {mode === 'image-to-video' && (
              <div className="w-40 flex-shrink-0">
                {uploadedImage ? (
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-border/60">
                    <img src={uploadedImage} alt="上传的图片" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
                      <span className="text-xs">✕</span>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={handleImageUpload} className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border/60 bg-secondary/10 flex flex-col items-center justify-center gap-2 hover:bg-secondary/30 hover:border-border transition-colors">
                    <PlusIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">上传图片</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex-1">
              <Textarea
                id="image-to-video-textarea"
                placeholder={examplePlaceholder}
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                className="w-full h-full min-h-[220px] resize-none rounded-none border-0 bg-secondary/10 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed placeholder:text-muted-foreground/60"
              />
            </div>

            <input ref={imageInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.bmp" className="hidden" onChange={handleImageFileChange} />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border/40 bg-card">
            <div className="flex items-center gap-2 flex-wrap">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><ToolbarSelect value={mode} options={modeOptions} onChange={(v) => onParamChange('mode', v)} className="min-w-[6rem]" /></div>
                  </TooltipTrigger>
                  <TooltipContent>选择生成模式</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-4 bg-border/60" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><ToolbarSelect value={ratio} options={ratioOptions} onChange={(v) => onParamChange('ratio', v)} className="min-w-[4.5rem]" /></div>
                  </TooltipTrigger>
                  <TooltipContent>设置视频宽高比</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><ToolbarSelect value={resolution} options={resolutionOptions} onChange={(v) => onParamChange('resolution', v)} className="min-w-[4.5rem]" /></div>
                  </TooltipTrigger>
                  <TooltipContent>选择视频分辨率</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DurationStepper value={duration} onChange={(v) => onParamChange('duration', v)} />

              <div className="w-px h-4 bg-border/60" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 h-8 px-2 rounded-lg border border-border/60 bg-secondary/30">
                      <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">声音</span>
                      <Switch checked={bgm} onCheckedChange={(checked) => onParamChange('bgm', checked)} className="scale-75 data-[state=checked]:bg-primary" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>是否添加背景音乐</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-foreground tabular-nums">{agent.costPoints}</span>
              </div>
              <Button
                className="h-9 px-4 rounded-lg gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                onClick={handleSend}
                disabled={!!processingTurnId}
              >
                <Send className="h-3.5 w-3.5" />
                发送
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
