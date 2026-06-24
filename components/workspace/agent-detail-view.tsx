'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Agent } from '@/lib/mock-data'
import { AgentSceneCards } from '@/components/agent/agent-scene-cards'
import { AgentSpeechToTextIntro } from '@/components/agent/agent-speech-to-text-intro'
import { AgentTextToSpeechIntro } from '@/components/agent/agent-text-to-speech-intro'
import { AgentInputArea } from '@/components/agent/agent-input-area'
import { AgentResultArea } from '@/components/agent/agent-result-area'
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

interface AgentDetailViewProps {
  agent: Agent
  onBack: () => void
  onViewResult?: (resultId: string) => void
}

// ============================================================
// Mock 历史任务数据
// ============================================================

interface HistoryTask {
  id: string
  title: string
  status: 'completed' | 'failed' | 'processing'
  createdAt: string
  resultPreview: string
  resultId: string
}

const mockHistoryTasks: Record<string, HistoryTask[]> = {
  'speech-to-text': [
    { id: 'ht-1', title: '会议录音转写', status: 'completed', createdAt: '2024-01-15 14:30', resultPreview: '会议讨论了Q4产品规划，确定了三个主要方向...', resultId: 'result-speech-to-text' },
  ],
  'text-to-speech': [
    { id: 'ht-2', title: '产品宣传配音', status: 'completed', createdAt: '2024-01-14 09:15', resultPreview: '音频文件：product-ad.mp3', resultId: 'result-text-to-speech' },
  ],
  'video-to-text': [
    { id: 'ht-3', title: '产品发布会视频转写', status: 'completed', createdAt: '2024-01-13 15:20', resultPreview: '三款新品介绍，主持人口播转文字...', resultId: 'result-video-to-text' },
  ],
  'topic-to-copywriting': [
    { id: 'ht-4', title: '新品发布短视频脚本', status: 'completed', createdAt: '2024-01-09 16:30', resultPreview: '已生成钩子+正文+CTA...', resultId: 'result-topic-to-copywriting' },
  ],
  'copywriting-to-video': [
    { id: 'ht-5', title: '品牌宣传片生成', status: 'completed', createdAt: '2024-01-08 09:00', resultPreview: '已生成6镜分镜脚本...', resultId: 'result-copywriting-to-video' },
  ],
  'image-to-video': [
    { id: 'ht-6', title: '旅行相册MV', status: 'completed', createdAt: '2024-01-12 10:30', resultPreview: '已生成15秒运镜视频...', resultId: 'result-image-to-video' },
  ],
  'video-translate': [
    { id: 'ht-7', title: '英文课程中文字幕', status: 'completed', createdAt: '2024-01-11 14:00', resultPreview: '已生成8条双语字幕...', resultId: 'result-video-translate' },
  ],
  'video-dubbing': [
    { id: 'ht-8', title: '解说视频配音', status: 'completed', createdAt: '2024-01-10 11:20', resultPreview: '旁白、专家、用户三角色配音...', resultId: 'result-video-dubbing' },
  ],
  'video-subtitle': [
    { id: 'ht-9', title: '课程视频配字幕', status: 'completed', createdAt: '2024-01-12 10:30', resultPreview: '已生成10条字幕轨道...', resultId: 'result-video-subtitle' },
  ],
}

function getHistoryTasks(agentId: string): HistoryTask[] {
  return mockHistoryTasks[agentId] || mockHistoryTasks['speech-to-text'] || []
}

export function AgentDetailView({ agent, onBack, onViewResult }: AgentDetailViewProps) {
  const [activeTab, setActiveTab] = useState<string>('experience')
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
      case 'video-to-text':
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
      case 'copywriting-to-video':
        return [
          { label: '文案分析', status: 'done' },
          { label: '分镜设计', status: 'running' },
          { label: '画面生成', status: 'pending' },
          { label: '配音合成', status: 'pending' },
          { label: '字幕生成', status: 'pending' },
          { label: '视频合成', status: 'pending' },
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

    // Mock 处理完成 → 直接跳转结果详情页
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setProgressSteps(prev => prev.map(s => ({ ...s, status: 'done' })))
      setIsProcessing(false)
      onViewResult?.(`result-${agent.id}`)
    }, 3500)
  }, [agent, file, text, generateSteps])

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 md:p-6">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回智能体广场
        </Button>

        {/* ========== 内容区域 ========== */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

              {/* 结果区：仅展示处理进度动画 */}
              {isProcessing && (
                <AgentResultArea
                  isProcessing={true}
                  progress={progress}
                  progressSteps={progressSteps}
                  costPoints={agent.costPoints}
                  processTime={agent.avgProcessTime}
                />
              )}
            </TabsContent>

            {/* === 历史任务 Tab === */}
            <TabsContent value="history" className="mt-0">
              <div className="space-y-3">
                {(() => {
                  const tasks = getHistoryTasks(agent.id)
                  return tasks.length === 0 ? (
                  <Card className="border-border/60">
                    <CardContent className="p-8 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        暂无历史任务
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border-border/60 hover:border-primary/30 transition-colors cursor-pointer group"
                      onClick={() => onViewResult?.(task.resultId)}
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
                )})()}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
