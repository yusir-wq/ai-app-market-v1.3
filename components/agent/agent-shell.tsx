'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Agent } from '@/lib/mock-data'
import { AgentSceneCards } from './agent-scene-cards'
import { AgentInputArea } from './agent-input-area'
import { AgentResultArea, ResultType, SpeakerSegment, StoryboardShot, MultiVoiceResult } from './agent-result-area'
import {
  ArrowLeft,
  Zap,
  Clock,
  CheckCircle2,
  Loader2,
  X,
  FileText,
  Calendar,
  Play,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { toast } from 'sonner'

// ============================================================
// Lazy load intro components
// ============================================================

const AgentSpeechToTextIntro = dynamic(
  () => import('./agent-speech-to-text-intro').then((m) => m.AgentSpeechToTextIntro),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)
const AgentTextToSpeechIntro = dynamic(
  () => import('./agent-text-to-speech-intro').then((m) => m.AgentTextToSpeechIntro),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)
const AgentVideoToTextIntro = dynamic(
  () => import('./agent-video-to-text-intro').then((m) => m.AgentVideoToTextIntro),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)
const AgentCopywritingIntro = dynamic(
  () => import('./agent-copywriting-intro').then((m) => m.AgentCopywritingIntro),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)
const AgentCopywritingToVideoIntro = dynamic(
  () => import('./agent-copywriting-to-video-intro').then((m) => m.AgentCopywritingToVideoIntro),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)
const AgentImageToVideoIntro = dynamic(
  () => import('./agent-image-to-video-intro').then((m) => m.AgentImageToVideoIntro),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)
const AgentVideoTranslateIntro = dynamic(
  () => import('./agent-video-translate-intro').then((m) => m.AgentVideoTranslateIntro),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)

// ============================================================
// Lazy load experience components (specialized ones)
// ============================================================

const TextToSpeechExperienceArea = dynamic(
  () => import('./agent-text-to-speech-experience').then((m) => m.TextToSpeechExperienceArea),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)
const CopywritingExperienceArea = dynamic(
  () => import('./agent-copywriting-experience').then((m) => m.CopywritingExperienceArea),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)
const CopywritingToVideoExperienceArea = dynamic(
  () => import('./copywriting-to-video-experience').then((m) => m.CopywritingToVideoExperienceArea),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)
const ImageToVideoExperienceArea = dynamic(
  () => import('./image-to-video-experience').then((m) => m.ImageToVideoExperienceArea),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)
const VideoTranslateExperienceArea = dynamic(
  () => import('./agent-video-translate-experience').then((m) => m.VideoTranslateExperienceArea),
  { loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)

// ============================================================
// Intro component mapping
// ============================================================

function IntroComponent({ agent }: { agent: Agent }) {
  switch (agent.id) {
    case 'speech-to-text':
      return <AgentSpeechToTextIntro />
    case 'text-to-speech':
      return <AgentTextToSpeechIntro />
    case 'video-to-text':
      return <AgentVideoToTextIntro />
    case 'topic-to-copywriting':
      return <AgentCopywritingIntro />
    case 'copywriting-to-video':
      return <AgentCopywritingToVideoIntro />
    case 'image-to-video':
      return <AgentImageToVideoIntro />
    case 'video-translate':
      return <AgentVideoTranslateIntro />
    default:
      return <AgentSceneCards scenes={agent.scenes} />
  }
}

// ============================================================
// Mock 历史任务
// ============================================================

const mockHistoryTasks = [
  {
    id: 'task-1', title: '会议录音转写', status: 'completed' as const,
    createdAt: '2024-06-20 14:30',
    resultPreview: '会议讨论了Q3季度产品规划，确定了三个主要方向...',
  },
  {
    id: 'task-2', title: '产品宣传配音', status: 'completed' as const,
    createdAt: '2024-06-19 09:15',
    resultPreview: '音频文件：product-ad.mp3',
  },
  {
    id: 'task-3', title: '品牌宣传片生成', status: 'failed' as const,
    createdAt: '2024-06-18 16:45',
    resultPreview: '处理失败：视频格式不支持',
  },
]

// ============================================================
// Main Shell Component
// ============================================================

export function AgentShell({ agent }: { agent: Agent }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('experience')
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [paramValues, setParamValues] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {}
    agent.parameters.forEach((p) => { defaults[p.id] = p.defaultValue })
    return defaults
  })
  const [uploadError, setUploadError] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressSteps, setProgressSteps] = useState<
    { label: string; status: 'pending' | 'running' | 'done' }[]
  >([])
  const [result, setResult] = useState<{
    type: ResultType; content?: string; url?: string; fileName?: string
    segments?: SpeakerSegment[]; storyboard?: StoryboardShot[]
    multiVoiceResults?: MultiVoiceResult[]
  } | null>(null)

  const IconComponent = (LucideIcons as any)[agent.icon] || LucideIcons.Sparkles

  // Has specialized experience component
  const hasSpecialExperience = useMemo(() =>
    ['text-to-speech', 'topic-to-copywriting', 'copywriting-to-video', 'image-to-video', 'video-translate'].includes(agent.id),
    [agent.id]
  )

  // ---- handlers ----
  const handleParamChange = useCallback((id: string, value: any) => {
    setParamValues((prev) => ({ ...prev, [id]: value }))
  }, [])

  const handleFileChange = useCallback((newFile: File | null) => {
    setUploadError(undefined)
    if (!newFile) { setFile(null); return }
    const ext = `.${newFile.name.split('.').pop()?.toLowerCase()}`
    if (agent.acceptedFiles && !agent.acceptedFiles.includes(ext)) {
      setUploadError(`不支持的文件格式，请上传 ${agent.acceptedFiles.join('、')} 格式`); return
    }
    if (agent.maxFileSize && newFile.size > agent.maxFileSize * 1024 * 1024) {
      setUploadError(`文件大小不能超过 ${agent.maxFileSize}MB`); return
    }
    setFile(newFile); toast.success(`已选择文件：${newFile.name}`)
  }, [agent.acceptedFiles, agent.maxFileSize])

  const generateSteps = useCallback((): { label: string; status: 'pending' | 'running' | 'done' }[] => {
    return [
      { label: '接收任务', status: 'done' as const },
      { label: 'AI处理中', status: 'running' as const },
      { label: '结果生成', status: 'pending' as const },
    ]
  }, [])

  const handleProcess = useCallback(() => {
    if (agent.inputType === 'file' || agent.inputType === 'both') {
      if (!file) { setUploadError('请先上传文件'); return }
    }
    if (agent.inputType === 'text' || agent.inputType === 'both') {
      if (!text.trim()) { setUploadError('请输入内容'); return }
      if (text.length > 5000) { setUploadError('内容不能超过5000字'); return }
    }
    setUploadError(undefined)
    setIsProcessing(true)
    setProgress(0)
    setResult(null)
    const steps = generateSteps()
    setProgressSteps(steps)

    let currentStep = 0
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 12) + 4
        if (next >= 100) {
          clearInterval(interval)
          return 100
        }
        const stepIndex = Math.floor((next / 100) * steps.length)
        if (stepIndex > currentStep && stepIndex < steps.length) {
          currentStep = stepIndex
          setProgressSteps(prevSteps => prevSteps.map((s, i) =>
            i < stepIndex ? { ...s, status: 'done' } : i === stepIndex ? { ...s, status: 'running' } : s
          ))
        }
        return next
      })
    }, 600)

    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setProgressSteps(prev => prev.map(s => ({ ...s, status: 'done' })))
      setIsProcessing(false)
      // Mock result based on category
      let mockResult: any = { type: 'text' as ResultType, content: '处理完成，结果已生成。' }
      if (agent.id === 'speech-to-text') {
        mockResult = {
          type: 'text' as ResultType,
          content: '【语音转文字结果】\n\n大家好，今天我们来讨论一下人工智能在医疗领域的应用。\n\n首先，AI可以帮助医生更准确地诊断疾病...',
          segments: [
            { id: 'seg-1', speaker: '说话人1', startTime: '00:00', endTime: '00:08', text: '大家好，今天我们来讨论一下人工智能在医疗领域的应用。' },
            { id: 'seg-2', speaker: '说话人1', startTime: '00:08', endTime: '00:22', text: '首先，AI可以帮助医生更准确地诊断疾病。通过深度学习算法，AI系统可以分析医学影像，识别出早期肿瘤的迹象。' },
            { id: 'seg-3', speaker: '说话人1', startTime: '00:22', endTime: '00:38', text: '其次，在药物研发方面，AI可以大大缩短新药的研发周期。' },
          ],
        }
      } else if (agent.id === 'text-to-speech') {
        mockResult = {
          type: 'audio' as ResultType,
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          fileName: 'tts-output.mp3',
        }
      } else if (agent.id === 'video-to-text') {
        mockResult = { type: 'text' as ResultType, content: '【视频转文字结果】\n\n视频内容已精准转化为文字稿...' }
      } else if (agent.category === 'video') {
        mockResult = { type: 'video' as ResultType, url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', fileName: `${agent.name}-output.mp4` }
      } else if (agent.category === 'image') {
        mockResult = { type: 'image' as ResultType, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' }
      } else if (agent.id === 'topic-to-copywriting') {
        mockResult = {
          type: 'text' as ResultType,
          content: '【短视频脚本】\n\n🎬 开场（3秒）\n"你是不是也有过这样的经历——明明很努力，却总是达不到预期效果？"\n\n📖 内容（20秒）\n今天我要分享3个让你效率翻倍的小技巧...\n\n💡 结尾（7秒）\n"试试这三个方法，评论区告诉我效果！"\n\n#效率提升 #时间管理',
        }
      }
      setResult(mockResult)
      toast.success('处理完成！')
    }, 3500)
  }, [agent, file, text, generateSteps])

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full p-4 md:p-6">
        {/* ============ LEFT: Info Panel ============ */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/agent')} className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />返回智能体广场
          </Button>
          <Card className="border-border/60">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-foreground truncate">{agent.name}</h1>
                  <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <div><p className="text-xs text-muted-foreground">消耗智点</p><p className="text-sm font-semibold">{agent.costPoints}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <div><p className="text-xs text-muted-foreground">平均耗时</p><p className="text-sm font-semibold">{agent.avgProcessTime}</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============ RIGHT: Tabs ============ */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="intro" className="text-sm">场景介绍</TabsTrigger>
              <TabsTrigger value="experience" className="text-sm">体验应用</TabsTrigger>
              <TabsTrigger value="history" className="text-sm">历史任务</TabsTrigger>
            </TabsList>

            {/* === 场景介绍 === */}
            <TabsContent value="intro" className="mt-0">
              <IntroComponent agent={agent} />
            </TabsContent>

            {/* === 体验应用 === */}
            <TabsContent value="experience" className="mt-0 space-y-4">
              {hasSpecialExperience ? (
                <>
                  {agent.id === 'text-to-speech' && (
                    <TextToSpeechExperienceArea
                      agent={agent} text={text} paramValues={paramValues}
                      onTextChange={setText} onParamChange={handleParamChange}
                      error={uploadError} isProcessing={isProcessing}
                      onStartProcess={handleProcess}
                    />
                  )}
                  {agent.id === 'topic-to-copywriting' && (
                    <CopywritingExperienceArea
                      agent={agent} text={text} paramValues={paramValues}
                      onTextChange={setText} onParamChange={handleParamChange}
                      error={uploadError} isProcessing={isProcessing}
                      onStartProcess={handleProcess}
                    />
                  )}
                  {agent.id === 'copywriting-to-video' && (
                    <CopywritingToVideoExperienceArea
                      agent={agent} text={text} paramValues={paramValues}
                      onTextChange={setText} onParamChange={handleParamChange}
                      error={uploadError} isProcessing={isProcessing}
                      onStartProcess={handleProcess}
                    />
                  )}
                  {agent.id === 'image-to-video' && (
                    <ImageToVideoExperienceArea
                      agent={agent} text={text}
                      paramValues={paramValues}
                      onTextChange={setText} onParamChange={handleParamChange}
                      error={uploadError} isProcessing={isProcessing}
                      onStartProcess={handleProcess}
                    />
                  )}
                  {agent.id === 'video-translate' && (
                    <VideoTranslateExperienceArea
                      agent={agent}
                      onStartProcess={handleProcess}
                    />
                  )}
                </>
              ) : (
                <>
                  <AgentInputArea
                    agent={agent} file={file} text={text}
                    paramValues={paramValues} onFileChange={handleFileChange}
                    onTextChange={setText} onParamChange={handleParamChange}
                    error={uploadError}
                  />
                  <Button className="w-full" size="lg" onClick={handleProcess} disabled={isProcessing}>
                    <Play className="h-4 w-4 mr-2" />
                    {isProcessing ? '处理中...' : '开始处理'}
                  </Button>
                </>
              )}

              {/* Result */}
              <AgentResultArea
                isProcessing={isProcessing}
                resultType={result?.type}
                resultContent={result?.content}
                resultUrl={result?.url}
                resultFileName={result?.fileName}
                progress={progress}
                progressSteps={progressSteps}
                segments={result?.segments}
                storyboard={result?.storyboard}
                multiVoiceResults={result?.multiVoiceResults}
                costPoints={agent.costPoints}
                processTime={agent.avgProcessTime}
                onDownload={() => toast.info('下载功能模拟中...')}
                onRetry={() => { setResult(null); handleProcess() }}
              />
            </TabsContent>

            {/* === 历史任务 === */}
            <TabsContent value="history" className="mt-0">
              <div className="space-y-3">
                {mockHistoryTasks.map((task) => (
                  <Card key={task.id} className="border-border/60 hover:border-primary/30 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-0.5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          task.status === 'completed'
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                            : 'bg-gradient-to-br from-red-400 to-rose-600'
                        }`}>
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          ) : (
                            <X className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-foreground truncate">{task.title}</h4>
                            <Badge variant={task.status === 'completed' ? 'secondary' : 'destructive'} className="text-[10px] shrink-0">
                              {task.status === 'completed' ? '已完成' : '失败'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1.5">{task.resultPreview}</p>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {task.createdAt}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
