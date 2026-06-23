'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Agent } from '@/lib/mock-data'
import { AgentSceneCards } from '@/components/agent/agent-scene-cards'
import { AgentUploadZone } from '@/components/agent/agent-upload-zone'
import { AgentParamsForm } from '@/components/agent/agent-params-form'
import { AgentResultPreview, ResultType } from '@/components/agent/agent-result-preview'
import { ArrowLeft, Play, Zap, Clock, FileText, CheckCircle, Download } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { toast } from 'sonner'

interface AgentDetailViewProps {
  agent: Agent
  onBack: () => void
}

// Mock 历史任务数据
const mockHistoryTasks = [
  { id: 'task-1', name: '会议录音_20241218.mp3', status: 'success' as const, createdAt: '2024-12-18 14:30', result: '会议纪要约1200字' },
  { id: 'task-2', name: '播客_episode_42.m4a', status: 'success' as const, createdAt: '2024-12-17 09:15', result: '转稿约3500字' },
  { id: 'task-3', name: '课堂_人工智能导论.mp4', status: 'success' as const, createdAt: '2024-12-16 16:00', result: '笔记约2800字' },
]

export function AgentDetailView({ agent, onBack }: AgentDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'scene' | 'experience' | 'history'>('scene')
  const [showResultPage, setShowResultPage] = useState(false)
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
  const [result, setResult] = useState<{
    type: ResultType
    content?: string
    url?: string
    fileName?: string
  } | null>(null)

  const IconComponent = (LucideIcons as any)[agent.icon] || LucideIcons.Sparkles

  const handleParamChange = useCallback((id: string, value: any) => {
    setParamValues((prev) => ({ ...prev, [id]: value }))
  }, [])

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

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return prev + Math.floor(Math.random() * 15) + 5
      })
    }, 500)

    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setIsProcessing(false)

      let mockResult: { type: ResultType; content?: string; url?: string; fileName?: string }
      switch (agent.category) {
        case 'audio':
          mockResult = {
            type: agent.id === 'text-to-speech' ? 'audio' : 'text',
            content: agent.id === 'speech-to-text'
              ? `【语音转文字结果】\n\n大家好，今天我们来讨论一下人工智能在医疗领域的应用...`
              : agent.id === 'audio-video-summary'
                ? `【音视频摘要】\n\n核心要点：\n1. AI在医疗诊断中的应用...`
                : undefined,
            url: agent.id === 'text-to-speech' ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' : undefined,
            fileName: agent.id === 'text-to-speech' ? 'tts-output.mp3' : undefined,
          }
          break
        case 'copywriting':
          mockResult = {
            type: 'text',
            content: agent.id === 'topic-to-copywriting'
              ? `【短视频脚本】\n\n🎬 开场（3秒）\n"你是不是也有过这样的经历..."`
              : `【分镜脚本】\n\n镜1 | 0:00-0:03 | 品牌Logo动画渐入`,
          }
          break
        case 'image':
          mockResult = { type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' }
          break
        default:
          mockResult = { type: 'file', fileName: `${agent.name}-处理结果.zip` }
      }

      setResult(mockResult)
      setShowResultPage(true)
      toast.success('处理完成！')
    }, 3000)
  }, [agent, file, text])

  // 返回结果页到详情页
  const handleBackFromResult = () => {
    setShowResultPage(false)
    setActiveTab('experience')
  }

  // 重新处理
  const handleReprocess = () => {
    setShowResultPage(false)
    setResult(null)
    setActiveTab('experience')
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col w-full max-w-[720px] mx-auto px-4 md:px-6 pt-6 pb-10">
          {/* 头部 */}
          <div className="w-full flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={showResultPage ? handleBackFromResult : onBack} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0`}>
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">
                {showResultPage ? '处理结果' : agent.name}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {showResultPage ? agent.name : agent.description}
              </p>
            </div>
            {!showResultPage && (
              <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{agent.costPoints} 智点</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{agent.avgProcessTime}</span>
              </div>
            )}
          </div>

          {/* 结果页 - 独立内页 */}
          {showResultPage ? (
            <div className="space-y-4">
              <AgentResultPreview
                isProcessing={false}
                resultType={result?.type}
                resultContent={result?.content}
                resultUrl={result?.url}
                resultFileName={result?.fileName}
                progress={100}
                onDownload={() => toast.info('下载功能模拟中...')}
              />
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleReprocess}>
                  <Play className="h-4 w-4 mr-2" />
                  重新处理
                </Button>
                <Button className="flex-1" onClick={() => toast.info('下载功能模拟中...')}>
                  <Download className="h-4 w-4 mr-2" />
                  下载结果
                </Button>
              </div>
            </div>
          ) : (
            /* 3个Tab */
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="scene">场景介绍</TabsTrigger>
                <TabsTrigger value="experience">体验应用</TabsTrigger>
                <TabsTrigger value="history">历史任务</TabsTrigger>
              </TabsList>

              {/* 场景介绍 */}
              <TabsContent value="scene" className="mt-0">
                <AgentSceneCards scenes={agent.scenes} />
                <Card className="border-border/60">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold mb-3">功能说明</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>支持格式：{agent.acceptedFiles?.join('、') || '文本输入'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>最大文件：{agent.maxFileSize ? `${agent.maxFileSize}MB` : '无限制'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>预计耗时：{agent.avgProcessTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 体验应用 */}
              <TabsContent value="experience" className="mt-0">
                <AgentUploadZone
                  inputType={agent.inputType}
                  acceptedFiles={agent.acceptedFiles}
                  maxFileSize={agent.maxFileSize}
                  file={file}
                  text={text}
                  onFileChange={handleFileChange}
                  onTextChange={setText}
                  error={uploadError}
                />
                <AgentParamsForm parameters={agent.parameters} values={paramValues} onChange={handleParamChange} />
                <Button className="w-full" size="lg" onClick={handleProcess} disabled={isProcessing}>
                  <Play className="h-4 w-4 mr-2" />
                  {isProcessing ? '处理中...' : '开始处理'}
                </Button>
                <AgentResultPreview
                  isProcessing={isProcessing}
                  resultType={result?.type}
                  resultContent={result?.content}
                  resultUrl={result?.url}
                  resultFileName={result?.fileName}
                  progress={progress}
                  onDownload={() => toast.info('下载功能模拟中...')}
                />
              </TabsContent>

              {/* 历史任务 */}
              <TabsContent value="history" className="mt-0">
                <div className="space-y-3">
                  {mockHistoryTasks.map((task) => (
                    <Card key={task.id} className="border-border/60">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{task.name}</p>
                              <Badge variant={task.status === 'success' ? 'default' : 'secondary'} className="text-[10px]">
                                {task.status === 'success' ? '已完成' : '处理中'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{task.createdAt}</p>
                            <p className="text-xs text-muted-foreground mt-1">{task.result}</p>
                          </div>
                          <Button variant="ghost" size="icon-sm" className="shrink-0 h-7 w-7">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
