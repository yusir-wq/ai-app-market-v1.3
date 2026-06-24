'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Agent } from '@/lib/mock-data'
import { AgentSceneCards } from './agent-scene-cards'
import { AgentSpeechToTextIntro } from './agent-speech-to-text-intro'
import { AgentTextToSpeechIntro } from './agent-text-to-speech-intro'
import { AgentInputArea } from './agent-input-area'
import { AgentResultArea, ResultType, SpeakerSegment, StoryboardShot, MultiVoiceResult } from './agent-result-area'
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Loader2,
  FileText,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'

interface AgentShellProps {
  agent: Agent
}

// ============================================================
// Mock 历史任务数据
// ============================================================

const mockHistoryTasks = [
  {
    id: 'task-1',
    title: '会议录音转写',
    status: 'completed' as const,
    createdAt: '2024-01-15 14:30',
    resultType: 'text' as ResultType,
    resultPreview: '会议讨论了Q4季度产品规划，确定了三个主要方向...',
  },
  {
    id: 'task-2',
    title: '产品宣传配音',
    status: 'completed' as const,
    createdAt: '2024-01-14 09:15',
    resultType: 'audio' as ResultType,
    resultPreview: '音频文件：product-ad.mp3',
  },
  {
    id: 'task-3',
    title: '品牌宣传片生成',
    status: 'failed' as const,
    createdAt: '2024-01-13 16:45',
    resultType: 'video' as ResultType,
    resultPreview: '处理失败：视频格式不支持',
  },
]

export function AgentShell({ agent }: AgentShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab')
    return ['intro', 'experience', 'history'].includes(tab || '') ? tab! : 'experience'
  })

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['intro', 'experience', 'history'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'experience') {
      params.delete('tab')
    } else {
      params.set('tab', value)
    }
    router.replace(`/agent/${agent.id}${params.toString() ? `?${params.toString()}` : ''}`, {
      scroll: false,
    })
  }, [agent.id, router, searchParams])
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [paramValues, setParamValues] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {}
    agent.parameters.forEach((p) => {
      defaults[p.id] = p.defaultValue
    })
    return defaults
  })
  const [uploadError, setUploadError] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressSteps, setProgressSteps] = useState<{ label: string; status: 'pending' | 'running' | 'done' }[]>([])
  const [result, setResult] = useState<{
    type: ResultType
    content?: string
    url?: string
    fileName?: string
    segments?: SpeakerSegment[]
    storyboard?: StoryboardShot[]
    multiVoiceResults?: MultiVoiceResult[]
  } | null>(null)

  // 参数变化处理
  const handleParamChange = useCallback((id: string, value: any) => {
    setParamValues((prev) => ({ ...prev, [id]: value }))
  }, [])

  // 文件变化校验
  const handleFileChange = useCallback(
    (newFile: File | null) => {
      setUploadError(undefined)
      if (!newFile) {
        setFile(null)
        return
      }
      const ext = `.${newFile.name.split('.').pop()?.toLowerCase()}`
      if (agent.acceptedFiles && !agent.acceptedFiles.includes(ext)) {
        setUploadError(`不支持的文件格式，请上传 ${agent.acceptedFiles.join('、')} 格式`)
        return
      }
      if (agent.maxFileSize && newFile.size > agent.maxFileSize * 1024 * 1024) {
        setUploadError(`文件大小不能超过 ${agent.maxFileSize}MB`)
        return
      }
      setFile(newFile)
      toast.success(`已选择文件：${newFile.name}`)
    },
    [agent.acceptedFiles, agent.maxFileSize]
  )

  // 生成处理步骤
  const generateSteps = useCallback((): { label: string; status: 'pending' | 'running' | 'done' }[] => {
    switch (agent.id) {
      case 'speech-to-text':
        return [
          { label: '上传文件', status: 'done' },
          { label: '音频解码', status: 'running' },
          { label: '语音识别', status: 'pending' },
          { label: '文本整理', status: 'pending' },
        ]
      case 'text-to-speech':
        return [
          { label: '文本分析', status: 'done' },
          { label: '语音合成', status: 'running' },
          { label: '音频渲染', status: 'pending' },
        ]
      case 'copywriting-to-video-advanced':
        return [
          { label: '文案分析', status: 'done' },
          { label: '分镜设计', status: 'running' },
          { label: '画面生成', status: 'pending' },
          { label: '配音合成', status: 'pending' },
          { label: '字幕生成', status: 'pending' },
          { label: '视频合成', status: 'pending' },
        ]
      case 'video-remove-watermark':
        return [
          { label: '视频解析', status: 'done' },
          { label: '水印检测', status: 'running' },
          { label: '智能修复', status: 'pending' },
          { label: '视频编码', status: 'pending' },
        ]
      default:
        return [
          { label: '接收任务', status: 'done' },
          { label: 'AI处理中', status: 'running' },
          { label: '结果生成', status: 'pending' },
        ]
    }
  }, [agent.id])

  // 开始处理
  const handleProcess = useCallback(() => {
    if (agent.inputType === 'file' || agent.inputType === 'both') {
      if (!file) {
        setUploadError('请先上传文件')
        return
      }
    }
    if (agent.inputType === 'text' || agent.inputType === 'both') {
      if (!text.trim()) {
        setUploadError('请输入内容')
        return
      }
      if (text.length > 5000) {
        setUploadError('内容不能超过5000字')
        return
      }
    }

    setUploadError(undefined)
    setIsProcessing(true)
    setProgress(0)
    setResult(null)

    const steps = generateSteps()
    setProgressSteps(steps)

    // Mock 处理进度 + 步骤更新
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
          setProgressSteps(prevSteps =>
            prevSteps.map((s, i) =>
              i < stepIndex ? { ...s, status: 'done' }
                : i === stepIndex ? { ...s, status: 'running' }
                : s
            )
          )
        }
        return next
      })
    }, 600)

    // Mock 处理完成
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setProgressSteps(prev => prev.map(s => ({ ...s, status: 'done' })))
      setIsProcessing(false)

      let mockResult: {
        type: ResultType
        content?: string
        url?: string
        fileName?: string
        segments?: SpeakerSegment[]
        storyboard?: StoryboardShot[]
        multiVoiceResults?: MultiVoiceResult[]
      }

      switch (agent.category) {
        case 'audio':
          if (agent.id === 'text-to-speech') {
            mockResult = {
              type: 'audio',
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              fileName: 'tts-output.mp3',
            }
          } else if (agent.id === 'speech-to-text') {
            mockResult = {
              type: 'text',
              content: `【语音转文字结果】\n\n大家好，今天我们来讨论一下人工智能在医疗领域的应用。\n\n首先，AI可以帮助医生更准确地诊断疾病。通过深度学习算法，AI系统可以分析医学影像，识别出早期肿瘤的迹象。\n\n其次，在药物研发方面，AI可以大大缩短新药的研发周期。传统方法需要10-15年，而借助AI技术，这个时间可以缩短到3-5年。\n\n最后，AI还可以用于个性化治疗方案的制定。通过分析患者的基因数据和病史，AI可以为每位患者定制最合适的治疗方案。\n\n谢谢大家。`,
              segments: [
                { id: 'seg-1', speaker: '说话人1', startTime: '00:00', endTime: '00:08', text: '大家好，今天我们来讨论一下人工智能在医疗领域的应用。' },
                { id: 'seg-2', speaker: '说话人1', startTime: '00:08', endTime: '00:22', text: '首先，AI可以帮助医生更准确地诊断疾病。通过深度学习算法，AI系统可以分析医学影像，识别出早期肿瘤的迹象。' },
                { id: 'seg-3', speaker: '说话人1', startTime: '00:22', endTime: '00:38', text: '其次，在药物研发方面，AI可以大大缩短新药的研发周期。传统方法需要10-15年，而借助AI技术，这个时间可以缩短到3-5年。' },
                { id: 'seg-4', speaker: '说话人1', startTime: '00:38', endTime: '00:50', text: '最后，AI还可以用于个性化治疗方案的制定。通过分析患者的基因数据和病史，AI可以为每位患者定制最合适的治疗方案。' },
                { id: 'seg-5', speaker: '说话人1', startTime: '00:50', endTime: '00:53', text: '谢谢大家。' },
              ],
            }
          } else {
            mockResult = {
              type: 'text',
              content: `【音视频摘要】\n\n核心要点：\n1. AI在医疗诊断中的应用，通过深度学习分析医学影像\n2. AI加速药物研发，周期从10-15年缩短至3-5年\n3. 个性化治疗方案，基于基因数据和病史定制\n\n待办事项：\n□ 调研AI影像诊断的最新进展\n□ 联系药企了解AI药物研发合作机会\n□ 收集个性化治疗案例数据`,
            }
          }
          break

        case 'copywriting':
          if (agent.id === 'copywriting-to-video-advanced') {
            mockResult = {
              type: 'storyboard',
              storyboard: [
                { id: 'shot-1', index: 1, duration: '0:00-0:03', description: '品牌Logo动画渐入，配轻快背景音乐', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=225&fit=crop' },
                { id: 'shot-2', index: 2, duration: '0:03-0:08', description: '产品全景展示，慢推镜头，突出产品质感', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=225&fit=crop' },
                { id: 'shot-3', index: 3, duration: '0:08-0:15', description: '产品核心功能特写，配合功能说明字幕', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=225&fit=crop' },
                { id: 'shot-4', index: 4, duration: '0:15-0:22', description: '用户使用场景，生活化画面，展示真实体验', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop' },
                { id: 'shot-5', index: 5, duration: '0:22-0:28', description: '产品对比画面，突出优势和差异化', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop' },
                { id: 'shot-6', index: 6, duration: '0:28-0:30', description: 'CTA行动号召 + 品牌Slogan，配强烈节奏音乐', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop' },
              ],
            }
          } else {
            mockResult = {
              type: 'text',
              content: `【短视频脚本】\n\n🎬 开场（3秒）\n"你是不是也有过这样的经历——明明很努力，却总是达不到预期效果？"\n\n📖 内容（20秒）\n今天我要分享3个让你效率翻倍的小技巧：\n1️⃣ 番茄工作法：25分钟专注+5分钟休息\n2️⃣ 两分钟法则：能在2分钟内完成的事立刻做\n3️⃣ 批量处理：同类任务集中处理，减少切换成本\n\n💡 结尾（7秒）\n"试试这三个方法，评论区告诉我效果！关注我，每天进步一点点！"\n\n#效率提升 #时间管理 #自我成长`,
            }
          }
          break

        case 'image':
          mockResult = {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          }
          break

        case 'video':
          if (agent.id === 'video-dubbing') {
            mockResult = {
              type: 'audio',
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              fileName: 'dubbing-output.mp3',
            }
          } else if (agent.id === 'copywriting-to-video') {
            mockResult = {
              type: 'video',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
              fileName: 'generated-video.mp4',
            }
          } else {
            mockResult = {
              type: 'video',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
              fileName: `${agent.name}-output.mp4`,
            }
          }
          break

        default:
          mockResult = {
            type: 'file',
            fileName: `${agent.name}-处理结果.zip`,
          }
      }

      setResult(mockResult)
      toast.success('处理完成！')
    }, 3500)
  }, [agent, file, text, generateSteps])

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 md:p-6">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/agent')}
          className="text-muted-foreground w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回智能体广场
        </Button>

        {/* ========== 内容区域 ========== */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="intro" className="text-sm">
                场景介绍
              </TabsTrigger>
              <TabsTrigger value="experience" className="text-sm">
                体验应用
              </TabsTrigger>
              <TabsTrigger value="history" className="text-sm">
                历史任务
              </TabsTrigger>
            </TabsList>

            {/* === 场景介绍 Tab === */}
            <TabsContent value="intro" className="mt-0">
              {agent.id === 'speech-to-text' ? (
                <AgentSpeechToTextIntro />
              ) : agent.id === 'text-to-speech' ? (
                <AgentTextToSpeechIntro />
              ) : (
                <AgentSceneCards scenes={agent.scenes} />
              )}
            </TabsContent>

            {/* === 体验应用 Tab === */}
            <TabsContent value="experience" className="mt-0 space-y-4">
              {/* 输入区 */}
              <AgentInputArea
                agent={agent}
                file={file}
                text={text}
                paramValues={paramValues}
                onFileChange={handleFileChange}
                onTextChange={setText}
                onParamChange={handleParamChange}
                error={uploadError}
              />

              {/* 操作按钮 */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleProcess}
                disabled={isProcessing}
              >
                <Play className="h-4 w-4 mr-2" />
                {isProcessing ? '处理中...' : '开始处理'}
              </Button>

              {/* 结果区 */}
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
                onRetry={() => {
                  setResult(null)
                  handleProcess()
                }}
              />
            </TabsContent>

            {/* === 历史任务 Tab === */}
            <TabsContent value="history" className="mt-0">
              <div className="space-y-3">
                {mockHistoryTasks.length === 0 ? (
                  <Card className="border-border/60">
                    <CardContent className="p-8 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        暂无历史任务
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  mockHistoryTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border-border/60 hover:border-primary/30 transition-colors cursor-pointer group"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : task.status === 'failed' ? (
                              <Loader2 className="h-5 w-5 text-destructive" />
                            ) : (
                              <Loader2 className="h-5 w-5 text-primary animate-spin" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {task.title}
                              </h4>
                              <Badge
                                variant={
                                  task.status === 'completed'
                                    ? 'secondary'
                                    : task.status === 'failed'
                                      ? 'destructive'
                                      : 'default'
                                }
                                className="text-[10px] shrink-0"
                              >
                                {task.status === 'completed'
                                  ? '已完成'
                                  : task.status === 'failed'
                                    ? '失败'
                                    : '处理中'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mb-1.5">
                              {task.resultPreview}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.createdAt}
                              </span>
                              <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
