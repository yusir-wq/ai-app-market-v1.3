'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Agent } from '@/lib/mock-data'
import { AgentSceneCards } from '@/components/agent/agent-scene-cards'
import { AgentSpeechToTextIntro } from '@/components/agent/agent-speech-to-text-intro'
import { AgentTextToSpeechIntro } from '@/components/agent/agent-text-to-speech-intro'
import { AgentVideoToTextIntro } from '@/components/agent/agent-video-to-text-intro'
import { AgentCopywritingIntro } from '@/components/agent/agent-copywriting-intro'
import { CopywritingExperienceArea } from '@/components/agent/agent-copywriting-experience'
import { CopywritingToVideoExperienceArea } from '@/components/agent/copywriting-to-video-experience'
import { AgentInputArea } from '@/components/agent/agent-input-area'
import { AgentResultArea } from '@/components/agent/agent-result-area'
import { TextToSpeechExperienceArea } from '@/components/agent/agent-text-to-speech-experience'
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
  onViewResult?: (resultId: string, fileName?: string) => void
  prefillText?: string
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
    { id: 'ht-1', title: 'meeting-recording.mp3', status: 'completed', createdAt: '2024-01-15 14:30', resultPreview: '会议讨论了Q4产品规划，确定了三个主要方向：一是继续深化AI语音识别在医疗、教育、金融等垂直行业的应用；二是加强多语言模型训练，支持50种以上语言的实时转写和翻译；三是在用户体验层面引入智能分段、自动摘要、关键词提取等新功能模块。会议还重点探讨了如何在有限算力条件下，通过模型蒸馏和量化压缩来实现产品落地，预计Q4将完成内部测试版本并向部分客户开放试点。', resultId: 'result-speech-to-text' },
  ],
  'text-to-speech': [
    { id: 'ht-2', title: '请帮我写一段关于智能科技改变生活的品牌宣传文案，要求语言生动、富有感染力，适合用于视频配音，让听众沉浸其中。', status: 'completed', createdAt: '2024-01-14 09:15', resultPreview: '音频文件：product-ad.mp3', resultId: 'result-text-to-speech' },
    { id: 'ht-10', title: '萤火虫的秘密\n深夜，九岁的阿布悄悄溜出外婆家，提着一盏熄灭的马灯走向神秘的黑森林。\n他想抓住传说中能实现愿望的"黄金萤火虫"，来治好外婆的眼睛。', status: 'completed', createdAt: '2024-01-13 16:30', resultPreview: '温柔的AI女声演绎品牌故事…', resultId: 'result-text-to-speech-2' },
    { id: 'ht-11', title: '在这个快速迭代的时代，科技创新正以前所未有的速度改变着我们的生活。从清晨智能闹钟的轻柔唤醒，到夜晚智能助手的贴心陪伴，科技已经融入了我们生命中的每一个角落。', status: 'completed', createdAt: '2024-01-12 11:00', resultPreview: '已生成3章节课程旁白音频…', resultId: 'result-text-to-speech-3' },
  ],
  'video-to-text': [
    { id: 'ht-3', title: 'product-launch-2024.mp4', status: 'completed', createdAt: '2024-01-13 15:20', resultPreview: '各位来宾，欢迎参加我们2024年度新品发布会。今天我将为大家介绍三款全新产品。第一款是我们最新研发的智能语音助手V2，它采用了全新的端侧AI芯片，响应速度提升了300%，支持离线唤醒和连续对话。无论是在嘈杂的地铁还是安静的办公室，它都能精准识别你的指令。第二款产品是面向B端的企业级AI中台。可以帮助企业在不招募AI团队的情况下，快速搭建自己的智能客服、智能推荐和智能质检系统。目前已经有超过200家企业接入使用。', resultId: 'result-video-to-text' },
    { id: 'ht-12', title: 'q4-strategy-meeting.mov', status: 'completed', createdAt: '2024-01-11 09:00', resultPreview: '今天会议的主要议题是Q4的产品战略规划。首先我们回顾一下Q3的整体表现，AI语音助手V1的市场占有率从15%提升到了22%，企业级AI中台的客户续费率达到了91%。接下来我们要讨论的是如何在Q4将新产品推向更广阔的市场，特别是海外市场的拓展计划。技术团队已经完成了多语言模型的预训练，预计下个月可以上线测试。', resultId: 'result-video-to-text' },
    { id: 'ht-13', title: 'online-course-ai-basics.webm', status: 'completed', createdAt: '2024-01-08 14:45', resultPreview: '大家好，欢迎来到AI基础入门课程。今天我们要学习的是深度学习的核心概念。首先，什么是神经网络？简单来说，它是模仿人脑神经元连接方式的计算模型。一个基本的神经网络由输入层、隐藏层和输出层组成，每一层包含多个节点，节点之间通过带权重的连接进行信息传递。通过反向传播算法，网络可以自动调整这些权重，从而不断优化预测结果。', resultId: 'result-video-to-text' },
  ],
  'topic-to-copywriting': [
    { id: 'ht-4', title: '新品智能耳机发布', status: 'completed', createdAt: '2024-01-09 16:30', resultPreview: '已生成5段视频脚本及12个热门关键词：#新品首发 #降噪耳机 #NeoBudsPro3 #真无线耳机...', resultId: 'result-topic-to-copywriting' },
    { id: 'ht-14', title: '夏季防晒霜推广', status: 'completed', createdAt: '2024-01-06 10:15', resultPreview: '已生成4段种草脚本及10个关键词：#夏日必备 #防晒推荐 #敏感肌友好...', resultId: 'result-topic-to-copywriting' },
    { id: 'ht-15', title: '亲子露营VLOG脚本', status: 'completed', createdAt: '2024-01-03 14:00', resultPreview: '已生成4段温馨脚本及12个关键词：#亲子时光 #周末露营 #治愈系VLOG...', resultId: 'result-topic-to-copywriting' },
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

export function AgentDetailView({ agent, onBack, onViewResult, prefillText }: AgentDetailViewProps) {
  const [activeTab, setActiveTab] = useState<string>('experience')
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState(prefillText || '')
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
      case 'topic-to-copywriting':
        return [
          { label: '主题分析', status: 'done' },
          { label: '脚本撰写', status: 'running' },
          { label: '关键词提炼', status: 'pending' },
          { label: '格式整理', status: 'pending' },
        ]
      default:
        return [
          { label: '接收任务', status: 'done' },
          { label: 'AI处理中', status: 'running' },
          { label: '结果生成', status: 'pending' },
        ]
    }
  }, [agent.id])

  // 语音转文字 / 视频转文字：上传文件后自动开始处理
  useEffect(() => {
    if (agent.id !== 'speech-to-text' && agent.id !== 'video-to-text') return
    if (file && !isProcessing) {
      const timer = setTimeout(() => {
        handleProcess()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [agent.id, file, isProcessing])

  // 开始处理
  const handleProcess = useCallback((skipValidation?: boolean) => {
    if (!skipValidation) {
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
      onViewResult?.(`result-${agent.id}`, file?.name)
    }, 3500)
  }, [agent, file, text, generateSteps, onViewResult])

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
                使用应用
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
              ) : agent.id === 'video-to-text' ? (
                <AgentVideoToTextIntro />
              ) : agent.id === 'topic-to-copywriting' ? (
                <AgentCopywritingIntro />
              ) : (
                <AgentSceneCards scenes={agent.scenes} />
              )}
            </TabsContent>

            {/* === 体验应用 Tab === */}
            <TabsContent value="experience" className="mt-0 space-y-4">
              {/* 文字转语音：自定义左右布局 */}
              {agent.id === 'text-to-speech' ? (
                <div className="space-y-4">
                  <TextToSpeechExperienceArea
                    agent={agent}
                    text={text}
                    paramValues={paramValues}
                    onTextChange={setText}
                    onParamChange={handleParamChange}
                    error={uploadError}
                    isProcessing={isProcessing}
                    onStartProcess={handleProcess}
                  />
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
                </div>
              ) : agent.id === 'topic-to-copywriting' ? (
                /* AI生成视频文案：自定义左右布局 */
                <div className="space-y-4">
                  <CopywritingExperienceArea
                    agent={agent}
                    text={text}
                    paramValues={paramValues}
                    onTextChange={setText}
                    onParamChange={handleParamChange}
                    error={uploadError}
                    isProcessing={isProcessing}
                    onStartProcess={handleProcess}
                  />
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
                </div>
              ) : agent.id === 'copywriting-to-video' ? (
                /* AI文案生视频：顶部标题 + 大输入卡片 + 底部工具栏 */
                <div className="space-y-4">
                  <CopywritingToVideoExperienceArea
                    agent={agent}
                    text={text}
                    paramValues={paramValues}
                    onTextChange={setText}
                    onParamChange={handleParamChange}
                    error={uploadError}
                    isProcessing={isProcessing}
                    onStartProcess={handleProcess}
                  />
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
                </div>
              ) : (
                <>
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
                    isProcessing={isProcessing}
                    progress={progress}
                    progressSteps={progressSteps}
                    onStartProcess={(agent.id === 'speech-to-text' || agent.id === 'video-to-text') ? () => handleProcess(true) : undefined}
                  />

                  {/* 操作按钮：非语音转文字显示 */}
                  {agent.id !== 'speech-to-text' && agent.id !== 'video-to-text' && (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleProcess()}
                      disabled={isProcessing}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isProcessing ? '处理中...' : '开始处理'}
                    </Button>
                  )}

                  {/* 结果区：仅展示处理进度动画 */}
                  {isProcessing && agent.id !== 'speech-to-text' && agent.id !== 'video-to-text' && (
                    <AgentResultArea
                      isProcessing={true}
                      progress={progress}
                      progressSteps={progressSteps}
                      costPoints={agent.costPoints}
                      processTime={agent.avgProcessTime}
                    />
                  )}
                </>
              )}
            </TabsContent>

            {/* === 历史任务 Tab === */}
            <TabsContent value="history" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(() => {
                  const tasks = getHistoryTasks(agent.id)
                  return tasks.length === 0 ? (
                  <Card className="border-border/60 col-span-full">
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
                      className="border-border/60 hover:border-primary/30 transition-colors cursor-pointer group flex flex-col"
                      onClick={() => onViewResult?.(task.resultId, task.title)}
                    >
                      <CardContent className="p-4 flex flex-col flex-1">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : task.status === 'failed' ? (
                              <Loader2 className="h-5 w-5 text-destructive" />
                            ) : (
                              <Loader2 className="h-5 w-5 text-primary animate-spin" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-sm font-medium text-foreground line-clamp-5 whitespace-pre-line leading-relaxed">
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
                                className="text-[10px] shrink-0 mt-0.5"
                              >
                                {task.status === 'completed'
                                  ? '已完成'
                                  : task.status === 'failed'
                                    ? '失败'
                                    : '处理中'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-5 mb-1.5 flex-1">
                              {task.resultPreview}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto">
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
