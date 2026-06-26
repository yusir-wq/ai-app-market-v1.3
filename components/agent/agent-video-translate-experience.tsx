'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload,
  FileVideo,
  X,
  AlertCircle,
  Languages,
  Sparkles,
  Eye,
  Type,
  Mic2,
  ScanText,
  Globe,
  Music,
  Subtitles,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/mock-data'

// ============================================================
// Types
// ============================================================

interface VideoTranslateExperienceProps {
  agent: Agent
  onStartProcess?: () => void
  onProcessComplete?: (result: any) => void
}

// ============================================================
// Helpers
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

// ============================================================
// Language list
// ============================================================

const LANGUAGES = [
  { value: 'auto', label: '智能识别' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁体中文' },
  { value: 'en', label: '英文' },
  { value: 'ja', label: '日文' },
  { value: 'ko', label: '韩文' },
  { value: 'fr', label: '法语' },
  { value: 'de', label: '德语' },
  { value: 'es', label: '西班牙语' },
  { value: 'pt', label: '葡萄牙语' },
  { value: 'it', label: '意大利语' },
  { value: 'ru', label: '俄语' },
  { value: 'ar', label: '阿拉伯语' },
  { value: 'th', label: '泰语' },
  { value: 'vi', label: '越南语' },
  { value: 'ms', label: '马来语' },
  { value: 'hi', label: '印地语' },
  { value: 'nl', label: '荷兰语' },
]

const TARGET_LANGUAGES = LANGUAGES.filter(l => l.value !== 'auto')

// ============================================================
// Default params
// ============================================================

const DEFAULT_PARAMS = {
  translateMode: 'full', // 'full' | 'subtitle-only'
  subtitleSource: 'asr', // 'asr' | 'ocr'
  sourceLang: 'auto',
  targetLang: 'en',
  aiDubbing: 'clone', // 'clone' | 'ai'
  removeOriginal: false,
}

// ============================================================
// Empty / Upload State
// ============================================================

function UploadZone({ agent, onFileSelected }: { agent: Agent; onFileSelected: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setError(undefined)
      onFileSelected(droppedFile)
    }
  }, [onFileSelected])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setError(undefined)
      onFileSelected(selectedFile)
    }
    e.target.value = ''
  }, [onFileSelected])

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Drag & drop area — 上传区与按钮视觉一体 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'p-4 text-center transition-all flex flex-col items-center gap-5',
            'bg-secondary/20',
            isDragging && 'bg-primary/5'
          )}
        >
          {/* Dashed border zone — 上传按钮与提示文案都在虚线区内 */}
          <div
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative w-full border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center gap-5',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30 hover:bg-accent/30'
            )}
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              拖拽本地音视频文件到这里
            </p>

            {/* Upload button — inside dashed zone */}
            <Button
              className="h-11 gap-2 px-8"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
            >
              <Upload className="h-4 w-4" />
              上传文件
            </Button>

            {/* Format / size / duration hints */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>mp3/mp4/mov/webm/wav等30种格式</span>
              <span className="text-border/60">|</span>
              <span>视频 ≤ 4GB；音频 ≤ 500M</span>
              <span className="text-border/60">|</span>
              <span>时长 ≤ 3小时</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </Card>
  )
}

// ============================================================
// Edit Mode / Video Editor
// ============================================================

function VideoEditor({
  agent,
  file,
  onBack,
  onFileChange,
  onStartProcess,
}: {
  agent: Agent
  file: File
  onBack: () => void
  onFileChange: (file: File) => void
  onStartProcess?: () => void
}) {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateParam = useCallback(<K extends keyof typeof DEFAULT_PARAMS>(
    key: K,
    value: typeof DEFAULT_PARAMS[K]
  ) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleReselect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileChange(selectedFile)
    }
    e.target.value = ''
  }, [onFileChange])

  const isSubtitleOnly = params.translateMode === 'subtitle-only'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* === LEFT: Video Preview === */}
      <div className="flex flex-col gap-4">
        <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col">
          {/* Video player */}
          <div className="relative bg-black">
            <video
              src={URL.createObjectURL(file)}
              className="w-full aspect-video"
              controls
            />
          </div>
          {/* File info bar */}
          <div className="flex items-center gap-3 p-3 border-t border-border/40 bg-secondary/20">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileVideo className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => inputRef.current?.click()}
              >
                重选
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onBack}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/*,audio/*"
            className="hidden"
            onChange={handleReselect}
          />
        </Card>
      </div>

      {/* === RIGHT: Parameter Panel === */}
      <div className="flex flex-col gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 space-y-4">
            {/* ---- Section: 翻译方式 ---- */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                翻译方式
              </Label>
              <div className="flex rounded-lg bg-secondary/50 p-1 gap-1">
                <button
                  onClick={() => updateParam('translateMode', 'full')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
                    params.translateMode === 'full'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Languages className="h-3.5 w-3.5" />
                  翻译字幕+配音
                </button>
                <button
                  onClick={() => updateParam('translateMode', 'subtitle-only')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
                    params.translateMode === 'subtitle-only'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Subtitles className="h-3.5 w-3.5" />
                  仅翻译字幕
                </button>
              </div>
            </div>

            {/* ---- Section: 字幕来源 ---- */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                字幕来源
              </Label>
              <div className="flex rounded-lg bg-secondary/50 p-1 gap-1">
                <button
                  onClick={() => updateParam('subtitleSource', 'asr')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
                    params.subtitleSource === 'asr'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Mic2 className="h-3.5 w-3.5" />
                  语音识别（ASR）
                </button>
                <button
                  onClick={() => updateParam('subtitleSource', 'ocr')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
                    params.subtitleSource === 'ocr'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ScanText className="h-3.5 w-3.5" />
                  画面识别（OCR）
                </button>
              </div>
            </div>

            {/* ---- Section: 源语言 & 目标语言 ---- */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                语言设置
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {/* 源语言 */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    源语言
                  </Label>
                  <Select
                    value={params.sourceLang}
                    onValueChange={(v) => updateParam('sourceLang', v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* 目标语言 */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Type className="h-3 w-3" />
                    目标语言
                  </Label>
                  <Select
                    value={params.targetLang}
                    onValueChange={(v) => updateParam('targetLang', v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_LANGUAGES.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ---- Section: 智能配音 (仅在翻译字幕+配音模式显示) ---- */}
            {!isSubtitleOnly && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  智能配音
                </Label>
                <div className="flex rounded-lg bg-secondary/50 p-1 gap-1">
                  <button
                    onClick={() => updateParam('aiDubbing', 'clone')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
                      params.aiDubbing === 'clone'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Music className="h-3.5 w-3.5" />
                    克隆原声
                  </button>
                  <button
                    onClick={() => updateParam('aiDubbing', 'ai')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
                      params.aiDubbing === 'ai'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    AI配音
                  </button>
                </div>
              </div>
            )}

            {/* ---- Section: 去除原字幕/水印 ---- */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                视频处理
              </Label>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">去除原字幕/水印</span>
                </div>
                <button
                  role="switch"
                  aria-checked={params.removeOriginal}
                  onClick={() => updateParam('removeOriginal', !params.removeOriginal)}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                    params.removeOriginal ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                      params.removeOriginal ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---- 开始翻译 Button ---- */}
        <Button
          className="w-full h-12 text-base gap-3"
          onClick={onStartProcess}
        >
          <Sparkles className="h-4 w-4" />
          开始翻译
          <span className="text-xs flex items-center gap-1 text-white/80">
            <Zap className="h-3 w-3" />
            {agent.costPoints} 智点
          </span>
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function VideoTranslateExperienceArea({
  agent,
  onStartProcess,
  onProcessComplete,
}: VideoTranslateExperienceProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processProgress, setProcessProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  if (!file) {
    return <UploadZone agent={agent} onFileSelected={setFile} />
  }

  if (isProcessing) {
    // 显示处理进度
    const steps = [
      "上传成功!可在历史任务中查看结果",
      "正在深度解析视频，智能提取字幕", 
      "正在进行高精度翻译校准",
      "正在进行最后的细节优化与渲染"
    ]
    
    return (
      <div className="space-y-6">
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                  {processProgress}%
                </div>
              </div>
              
              <div>
                <p className="text-lg font-semibold text-foreground">预计共需1分钟，内容即将呈现</p>
                <p className="text-sm text-muted-foreground mt-1">AI正在处理您的视频翻译请求</p>
              </div>
              
              <div className="w-full max-w-md">
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${processProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3 w-full max-w-md">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index <= currentStep 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index <= currentStep 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-sm ${
                      index <= currentStep 
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground'
                    }`}>
                      {step}
                    </span>
                    {index < currentStep && (
                      <div className="ml-auto text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <VideoEditor
      agent={agent}
      file={file}
      onBack={() => setFile(null)}
      onFileChange={setFile}
      onStartProcess={() => {
        setIsProcessing(true);
        setProcessProgress(0);
        setCurrentStep(0);
        
        // 模拟处理过程
        const interval = setInterval(() => {
          setProcessProgress(prev => {
            const newProgress = prev + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              // 处理完成，跳转到结果页
              setTimeout(() => {
                setIsProcessing(false);
                if (onProcessComplete) {
                  onProcessComplete({
                    subtitles: [
                      { id: 1, startTime: '00:00:01', endTime: '00:00:04', text: '这是第一句字幕', translatedText: 'This is the first subtitle' },
                      { id: 2, startTime: '00:00:05', endTime: '00:00:08', text: '这是第二句字幕', translatedText: 'This is the second subtitle' },
                      { id: 3, startTime: '00:00:09', endTime: '00:00:12', text: '这是第三句字幕', translatedText: 'This is the third subtitle' },
                    ],
                    videoUrl: URL.createObjectURL(file),
                    originalFile: file
                  });
                }
              }, 500);
              return 100;
            }
            
            // 更新步骤
            if (newProgress >= 25 && currentStep < 1) {
              setCurrentStep(1);
            } else if (newProgress >= 50 && currentStep < 2) {
              setCurrentStep(2);
            } else if (newProgress >= 75 && currentStep < 3) {
              setCurrentStep(3);
            }
            
            return newProgress;
          });
        }, 300);
      }}
    />
  )
}
