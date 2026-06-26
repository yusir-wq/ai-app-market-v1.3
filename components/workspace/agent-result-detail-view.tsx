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
  Pencil,
  Save,
  RotateCw,
  Replace,
  Loader2,
  Settings2,
  Wand2,
  BookOpen,
  Type,
  Music,
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
    <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-primary">{info.icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground">{fileName || result.taskName}</h1>
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
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(result.textContent || '')
  const [segments, setSegments] = useState(result.segments || [])
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // 翻译状态
  const [translateLang, setTranslateLang] = useState('zh-CN')
  const [bilingualEnabled, setBilingualEnabled] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [translateOpen, setTranslateOpen] = useState(false)
  const [findOpen, setFindOpen] = useState(false)

  // 智能总结翻译状态
  const [summaryTranslateLang, setSummaryTranslateLang] = useState('zh-CN')
  const [summaryBilingualEnabled, setSummaryBilingualEnabled] = useState(false)
  const [isSummaryTranslating, setIsSummaryTranslating] = useState(false)
  const [summaryTranslatedText, setSummaryTranslatedText] = useState<string | null>(null)
  const [summaryTranslateOpen, setSummaryTranslateOpen] = useState(false)

  const fullText = result.segments && result.segments.length > 0
    ? result.segments.map((s) => s.text).join('\n')
    : result.textContent || ''

  const handleCopy = () => {
    const textToCopy = translatedText && !bilingualEnabled
      ? translatedText
      : translatedText && bilingualEnabled
        ? `${fullText}\n\n--- ${currentLangLabel} ---\n${translatedText}`
        : (isEditing ? editedText : fullText)
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopySummary = () => {
    navigator.clipboard.writeText(result.summary || '')
    setSummaryCopied(true)
    setTimeout(() => setSummaryCopied(false), 2000)
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

  const handleFindNext = () => {
    if (!findText) return
    const text = isEditing ? editedText : fullText
    const matches = [...text.matchAll(new RegExp(findText, 'g'))]
    if (matches.length === 0) return
    const nextIndex = (currentMatchIndex + 1) % matches.length
    setCurrentMatchIndex(nextIndex)
    // 滚动到匹配位置
    if (contentRef.current && !isEditing) {
      const marks = contentRef.current.querySelectorAll('mark')
      if (marks[nextIndex]) {
        marks[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const handleReplace = () => {
    if (!findText) return
    if (isEditing) {
      setEditedText((prev) => prev.replace(findText, replaceText))
    } else {
      const newFullText = fullText.replace(findText, replaceText)
      if (result.segments && result.segments.length > 0) {
        setSegments(
          newFullText.split('\n').map((text, i) => ({
            id: `seg-${i}`,
            speaker: segments[i]?.speaker || '说话人1',
            startTime: segments[i]?.startTime || '00:00',
            endTime: segments[i]?.endTime || '00:00',
            text,
          }))
        )
      }
    }
    setCurrentMatchIndex(0)
  }

  const handleReplaceAll = () => {
    if (!findText) return
    if (isEditing) {
      setEditedText((prev) => prev.split(findText).join(replaceText))
    } else {
      const newFullText = fullText.split(findText).join(replaceText)
      if (result.segments && result.segments.length > 0) {
        setSegments(
          newFullText.split('\n').map((text, i) => ({
            id: `seg-${i}`,
            speaker: segments[i]?.speaker || '说话人1',
            startTime: segments[i]?.startTime || '00:00',
            endTime: segments[i]?.endTime || '00:00',
            text,
          }))
        )
      }
    }
    setCurrentMatchIndex(0)
  }

  const highlightText = (text: string) => {
    if (!findText) return text
    const parts = text.split(new RegExp(`(${findText})`, 'g'))
    return parts.map((part, i) =>
      part === findText ? <mark key={i} className="bg-yellow-200 text-foreground rounded px-0.5">{part}</mark> : part
    )
  }

  const displaySegments = result.segments && result.segments.length > 0 ? segments : []

  const languageOptions = [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en' },
    { label: '繁體中文', value: 'zh-TW' },
    { label: 'Español', value: 'es' },
    { label: 'Português', value: 'pt' },
    { label: '日本語', value: 'ja' },
    { label: 'Français', value: 'fr' },
    { label: 'Deutsch', value: 'de' },
    { label: '한국어', value: 'ko' },
  ]

  const handleTranslateApply = () => {
    if (isTranslating) return
    setTranslateOpen(false)
    setIsTranslating(true)
    setTranslatedText(null)

    // Mock 翻译延迟
    setTimeout(() => {
      const mockTranslations: Record<string, string> = {
        'zh-CN': fullText,
        'en': '[English Translation]\n\nIn today\'s meeting, we discussed the application of artificial intelligence in the medical field.\n\nFirst, AI can help doctors diagnose diseases more accurately. Through deep learning algorithms, AI systems can analyze medical images and identify early signs of tumors.\n\nSecond, in drug development, AI can significantly shorten the R&D cycle. Traditional methods take 10-15 years, but with AI, this time can be reduced to 3-5 years.\n\nFinally, AI can also be used for personalized treatment plans. By analyzing patient genetic data and medical history, AI can customize the most suitable treatment for each patient.\n\nThank you everyone.',
        'zh-TW': '【繁體中文翻譯】\n\n在今天的會議中，我們討論了人工智慧在醫療領域的應用。\n\n首先，AI可以幫助醫生更準確地診斷疾病。通過深度學習演算法，AI系統可以分析醫學影像，識別早期腫瘤的跡象。\n\n其次，在藥物研發方面，AI可以大幅縮短新藥的研發週期。傳統方法需要10-15年，而藉助AI技術，這個時間可以縮短到3-5年。\n\n最後，AI還可以用於個人化治療方案的制定。通過分析患者的基因數據和病史，AI可以為每位患者定製最合適的治療方案。\n\n謝謝大家。',
        'es': '[Traducción al Español]\n\nEn la reunión de hoy, discutimos la aplicación de la inteligencia artificial en el campo médico.\n\nEn primer lugar, la IA puede ayudar a los médicos a diagnosticar enfermedades con mayor precisión. Mediante algoritmos de aprendizaje profundo, los sistemas de IA pueden analizar imágenes médicas e identificar signos tempranos de tumores.\n\nEn segundo lugar, en el desarrollo de fármacos, la IA puede acortar significativamente el ciclo de I+D. Los métodos tradicionales llevan de 10 a 15 años, pero con la tecnología de IA, este tiempo puede reducirse a 3-5 años.\n\nFinalmente, la IA también puede utilizarse para planes de tratamiento personalizados. Analizando los datos genéticos y el historial médico del paciente, la IA puede personalizar el tratamiento más adecuado para cada paciente.\n\nGracias a todos.',
        'pt': '[Tradução para Português]\n\nNa reunião de hoje, discutimos a aplicação da inteligência artificial no campo médico.\n\nPrimeiro, a IA pode ajudar os médicos a diagnosticar doenças com mais precisão. Através de algoritmos de aprendizagem profunda, os sistemas de IA podem analisar imagens médicas e identificar sinais precoces de tumores.\n\nEm segundo lugar, no desenvolvimento de medicamentos, a IA pode reduzir significativamente o ciclo de P&D. Os métodos tradicionais levam de 10 a 15 anos, mas com a tecnologia de IA, esse tempo pode ser reduzido para 3 a 5 anos.\n\nFinalmente, a IA também pode ser usada para planos de tratamento personalizados. Analisando os dados genéticos e o histórico médico do paciente, a IA pode personalizar o tratamento mais adequado para cada paciente.\n\nObrigado a todos.',
        'ja': '【日本語翻訳】\n\n本日の会議では、医療分野における人工知能の応用について議論しました。\n\nまず、AIは医師がより正確に病気を診断するのを支援できます。深層学習アルゴリズムを通じて、AIシステムは医用画像を分析し、腫瘍の初期兆候を特定できます。\n\n次に、医薬品開発において、AIは新薬の研究開発サイクルを大幅に短縮できます。従来の方法では10〜15年かかりますが、AI技術を活用することで3〜5年に短縮できます。\n\n最後に、AIは個別化治療計画の策定にも使用できます。患者の遺伝子データと病歴を分析することで、AIは各患者に最適な治療をカスタマイズできます。\n\n皆様、ありがとうございました。',
        'fr': '[Traduction Française]\n\nLors de la réunion d\'aujourd\'hui, nous avons discuté de l\'application de l\'intelligence artificielle dans le domaine médical.\n\nPremièrement, l\'IA peut aider les médecins à diagnostiquer les maladies avec plus de précision. Grâce aux algorithmes d\'apprentissage profond, les systèmes d\'IA peuvent analyser des images médicales et identifier les signes précoces de tumeurs.\n\nDeuxièmement, dans le développement de médicaments, l\'IA peut considérablement raccourcir le cycle de R&D. Les méthodes traditionnelles prennent 10 à 15 ans, mais avec la technologie de l\'IA, ce temps peut être réduit à 3 à 5 ans.\n\nEnfin, l\'IA peut également être utilisée pour des plans de traitement personnalisés. En analysant les données génétiques et les antécédents médicaux du patient, l\'IA peut personnaliser le traitement le plus approprié pour chaque patient.\n\nMerci à tous.',
        'de': '[Deutsche Übersetzung]\n\nIn der heutigen Besprechung haben wir die Anwendung künstlicher Intelligenz im medizinischen Bereich diskutiert.\n\nErstens kann KI Ärzten helfen, Krankheiten genauer zu diagnostizieren. Durch Deep-Learning-Algorithmen können KI-Systeme medizinische Bilder analysieren und frühe Anzeichen von Tumoren erkennen.\n\nZweitens kann KI in der Arzneimittelentwicklung den F&E-Zyklus erheblich verkürzen. Traditionelle Methoden dauern 10-15 Jahre, aber mit KI-Technologie kann diese Zeit auf 3-5 Jahre reduziert werden.\n\nSchließlich kann KI auch für personalisierte Behandlungspläne eingesetzt werden. Durch die Analyse von Patientengendaten und Krankengeschichte kann KI die am besten geeignete Behandlung für jeden Patienten anpassen.\n\nVielen Dank an alle.',
        'ko': '[한국어 번역]\n\n오늘 회의에서 우리는 의료 분야에서의 인공지능 응용에 대해 논의했습니다.\n\n첫째, AI는 의사가 질병을 더 정확하게 진단하도록 도울 수 있습니다. 딥러닝 알고리즘을 통해 AI 시스템은 의료 영상을 분석하고 종양의 초기 징후를 식별할 수 있습니다.\n\n둘째, 신약 개발에서 AI는 연구개발 주기를 크게 단축할 수 있습니다. 전통적인 방법은 10-15년이 걸리지만, AI 기술을 활용하면 이 시간을 3-5년으로 단축할 수 있습니다.\n\n마지막으로, AI는 개인 맞춤형 치료 계획 수립에도 사용될 수 있습니다. 환자의 유전자 데이터와 병력을 분석하여 AI는 각 환자에게 가장 적합한 치료법을 맞춤화할 수 있습니다.\n\n감사합니다.',
      }
      setTranslatedText(mockTranslations[translateLang] || fullText)
      setIsTranslating(false)
    }, 1500)
  }

  const clearTranslation = () => {
    setTranslatedText(null)
  }

  const handleSummaryTranslateApply = () => {
    if (isSummaryTranslating) return
    setSummaryTranslateOpen(false)
    setIsSummaryTranslating(true)
    setSummaryTranslatedText(null)
    setTimeout(() => {
      const mockTranslations: Record<string, string> = {
        'zh-CN': result.summary || '',
        'en': '[Summary Translation - English]\n\nThe meeting covered three key topics: AI applications in medical diagnosis, drug development acceleration, and personalized treatment plans. AI can assist doctors in accurate disease detection, shorten pharmaceutical R&D from 10-15 years to 3-5 years, and customize patient treatments based on genetic and medical history data.',
        'zh-TW': '【摘要翻譯 - 繁體中文】\n\n會議涵蓋三個核心主題：AI在醫療診斷中的應用、藥物研發加速，以及個性化治療方案。AI可協助醫生精確檢測疾病，將藥物研發從10-15年縮短至3-5年，並根據病患基因與病史數據量身定制治療方案。',
        'es': '[Resumen - Español]\n\nLa reunión cubrió tres temas clave: aplicaciones de IA en diagnóstico médico, aceleración del desarrollo de fármacos y planes de tratamiento personalizados. La IA puede ayudar a los médicos en la detección precisa de enfermedades, acortar la I+D farmacéutica de 10-15 años a 3-5 años, y personalizar tratamientos según datos genéticos e historial médico.',
        'pt': '[Resumo - Português]\n\nA reunião abordou três tópicos principais: aplicações de IA em diagnóstico médico, aceleração do desenvolvimento de medicamentos e planos de tratamento personalizados. A IA pode auxiliar médicos na detecção precisa de doenças, reduzir a P&D farmacêutica de 10-15 anos para 3-5 anos, e personalizar tratamentos com base em dados genéticos e histórico médico.',
        'ja': '【要約 - 日本語】\n\n会議では、医療診断におけるAI応用、創薬の加速、個別化治療計画の3つの重要テーマが取り上げられました。AIは医師の精密な疾患検出を支援し、医薬品研究開発を10〜15年から3〜5年に短縮し、遺伝子データと病歴に基づいて患者ごとの治療をカスタマイズできます。',
        'fr': '[Résumé - Français]\n\nLa réunion a couvert trois thèmes clés : applications de l\'IA dans le diagnostic médical, accélération du développement de médicaments et plans de traitement personnalisés. L\'IA peut aider les médecins à détecter précisément les maladies, réduire la R&D pharmaceutique de 10-15 ans à 3-5 ans, et personnaliser les traitements selon les données génétiques et les antécédents médicaux.',
        'de': '[Zusammenfassung - Deutsch]\n\nDas Meeting behandelte drei Kernthemen: KI-Anwendungen in der medizinischen Diagnostik, Beschleunigung der Arzneimittelentwicklung und personalisierte Behandlungspläne. KI kann Ärzte bei der präzisen Krankheitserkennung unterstützen, die pharmazeutische F&E von 10-15 Jahren auf 3-5 Jahre verkürzen und Behandlungen basierend auf genetischen Daten und Krankengeschichte anpassen.',
        'ko': '[요약 - 한국어]\n\n회의에서는 의료 진단에서의 AI 응용, 신약 개발 가속화, 개인 맞춤형 치료 계획의 세 가지 핵심 주제를 다루었습니다. AI는 의사의 정밀한 질병 감지를 지원하고, 제약 연구개발을 10-15년에서 3-5년으로 단축하며, 유전자 데이터와 병력을 기반으로 환자 맞춤형 치료를 제공할 수 있습니다.',
      }
      setSummaryTranslatedText(mockTranslations[summaryTranslateLang] || result.summary || '')
      setIsSummaryTranslating(false)
    }, 1500)
  }

  const clearSummaryTranslation = () => {
    setSummaryTranslatedText(null)
  }

  const summaryCurrentLangLabel = languageOptions.find((l) => l.value === summaryTranslateLang)?.label || '简体中文'

  const currentLangLabel = languageOptions.find((l) => l.value === translateLang)?.label || '简体中文'

  return (
    <>
      {/* 两栏布局：桌面端左右分栏，移动端垂直堆叠 */}
      <div className="flex flex-col lg:flex-row gap-3 lg:h-[calc(100vh-220px)] lg:min-h-[500px]">
        {/* 左侧：转写内容 */}
        <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col min-h-0">
          <Card className="flex flex-col h-auto lg:h-full border border-border/40 shadow-sm bg-card overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              {/* 工具栏 */}
              <div className="flex items-center justify-between gap-1 px-3 py-2 shrink-0">
                <h3 className="text-sm font-semibold">AI转写内容</h3>
                <div className="flex items-center gap-0.5">
                  <Popover open={findOpen} onOpenChange={setFindOpen}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className={cn('h-8 w-8', findText && 'text-primary')}>
                            <Search className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>查找/替换</TooltipContent>
                    </Tooltip>
                    <PopoverContent className="w-72 p-0" align="end">
                      <div className="p-3 border-b border-border/40">
                        <h4 className="text-sm font-semibold">查找 / 替换</h4>
                      </div>
                      <div className="p-3 space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">查找内容</label>
                          <Input
                            value={findText}
                            onChange={(e) => {
                              setFindText(e.target.value)
                              setCurrentMatchIndex(0)
                            }}
                            placeholder="输入要查找的内容"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">替换为</label>
                          <Input
                            value={replaceText}
                            onChange={(e) => setReplaceText(e.target.value)}
                            placeholder="留空则只查找"
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 p-3 border-t border-border/40">
                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleFindNext}>
                          查找
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleReplace}>
                          替换
                        </Button>
                        <Button size="sm" className="text-xs h-8 flex-1" onClick={handleReplaceAll}>
                          全部替换
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (isEditing) {
                            handleSaveEdit()
                          } else {
                            setEditedText(displaySegments.length > 0 ? displaySegments.map((s) => s.text).join('\n') : fullText)
                            setIsEditing(true)
                          }
                        }}
                      >
                        {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isEditing ? '保存' : '编辑'}</TooltipContent>
                  </Tooltip>
                  <Popover open={translateOpen} onOpenChange={setTranslateOpen}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className={cn('h-8 w-8', translatedText && 'text-primary')}>
                            {isTranslating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Languages className="h-4 w-4" />
                            )}
                          </Button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>翻译</TooltipContent>
                    </Tooltip>
                    <PopoverContent side="bottom" align="end" className="w-56 p-0 overflow-hidden shadow-xl border-border/80">
                      <div className="p-3">
                        <div className="max-h-[220px] overflow-y-auto space-y-0.5 mb-3">
                          {languageOptions.map((lang) => (
                            <button
                              key={lang.value}
                              onClick={() => setTranslateLang(lang.value)}
                              className={cn(
                                'w-full text-xs py-2 px-3 rounded-md text-left transition-colors',
                                translateLang === lang.value
                                  ? 'bg-primary text-primary-foreground font-medium'
                                  : 'hover:bg-secondary text-foreground'
                              )}
                            >
                              {lang.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-xs text-muted-foreground">双语显示</span>
                          <Switch
                            checked={bilingualEnabled}
                            onCheckedChange={setBilingualEnabled}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {translatedText && (
                            <Button variant="outline" size="sm" className="text-xs h-9 rounded-lg" onClick={clearTranslation}>
                              还原
                            </Button>
                          )}
                          <Button
                            className="flex-1 h-9 text-sm gap-2 rounded-lg"
                            onClick={handleTranslateApply}
                            disabled={isTranslating}
                          >
                            {isTranslating ? (
                              <><Loader2 className="h-3.5 w-3.5 animate-spin" />翻译中...</>
                            ) : (
                              <>
                                <Languages className="h-3.5 w-3.5" />
                                开始翻译
                                <span className="flex items-center gap-1 ml-1 text-xs font-normal opacity-70">
                                  <span className="w-px h-3 bg-primary-foreground/30" />
                                  <Zap className="h-3 w-3" />1
                                </span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                        {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{copied ? '已复制' : '复制'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>导出TXT</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* 转写内容区 */}
              <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-2 max-h-[50vh] lg:max-h-none">
                {isEditing ? (
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-full resize-none text-sm leading-relaxed"
                  />
                ) : displaySegments.length > 0 ? (
                  <div ref={contentRef} className="space-y-2">
                    {/* 原文 */}
                    {(!translatedText || bilingualEnabled) && displaySegments.map((seg) => (
                      <div key={seg.id} className="p-2.5 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[10px]">{seg.speaker}</Badge>
                          <span className="text-[11px] text-muted-foreground font-mono">{seg.startTime} - {seg.endTime}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{highlightText(seg.text)}</p>
                      </div>
                    ))}
                    {/* 翻译分隔 */}
                    {translatedText && bilingualEnabled && (
                      <div className="flex items-center gap-2 pt-2 pb-1">
                        <div className="h-px flex-1 bg-border/60" />
                        <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                          {currentLangLabel}
                        </span>
                        <div className="h-px flex-1 bg-border/60" />
                      </div>
                    )}
                    {/* 翻译内容 */}
                    {translatedText && (
                      <div className="p-2.5 rounded-md bg-primary/5 border border-primary/10">
                        <p className="text-sm text-foreground leading-relaxed">{highlightText(translatedText)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* 原文 */}
                    {(!translatedText || bilingualEnabled) && (
                      <div ref={contentRef} className="p-3 rounded-lg bg-secondary/30">
                        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{highlightText(fullText)}</pre>
                      </div>
                    )}
                    {/* 翻译分隔 */}
                    {translatedText && bilingualEnabled && (
                      <div className="flex items-center gap-2 pt-1 pb-1">
                        <div className="h-px flex-1 bg-border/60" />
                        <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                          {currentLangLabel}
                        </span>
                        <div className="h-px flex-1 bg-border/60" />
                      </div>
                    )}
                    {/* 翻译内容 */}
                    {translatedText && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{highlightText(translatedText)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 底部音频播放器 */}
              <div className="px-3 pb-2 pt-1 shrink-0">
                <AudioPlayer url={result.audioUrl} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：智能总结 */}
        <div className="w-full lg:w-80 lg:shrink-0 flex flex-col min-h-0">
          <Card className="flex flex-col h-auto lg:h-full border border-border/40 shadow-sm bg-card overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="flex items-center justify-between gap-2 px-3 py-2 shrink-0">
                <h3 className="text-sm font-semibold">智能总结</h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="重新生成">
                    <RotateCw className="h-3.5 w-3.5" />
                  </Button>
                  <Popover open={summaryTranslateOpen} onOpenChange={setSummaryTranslateOpen}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className={cn('h-7 w-7', summaryTranslatedText && 'text-primary')} title="翻译">
                            {isSummaryTranslating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Languages className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>翻译</TooltipContent>
                    </Tooltip>
                    <PopoverContent side="bottom" align="end" className="w-56 p-0 overflow-hidden shadow-xl border-border/80">
                      <div className="p-3">
                        <div className="max-h-[220px] overflow-y-auto space-y-0.5 mb-3">
                          {languageOptions.map((lang) => (
                            <button
                              key={lang.value}
                              onClick={() => setSummaryTranslateLang(lang.value)}
                              className={cn(
                                'w-full text-xs py-2 px-3 rounded-md text-left transition-colors',
                                summaryTranslateLang === lang.value
                                  ? 'bg-primary text-primary-foreground font-medium'
                                  : 'hover:bg-secondary text-foreground'
                              )}
                            >
                              {lang.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-xs text-muted-foreground">双语显示</span>
                          <Switch
                            checked={summaryBilingualEnabled}
                            onCheckedChange={setSummaryBilingualEnabled}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {summaryTranslatedText && (
                            <Button variant="outline" size="sm" className="text-xs h-9 rounded-lg" onClick={clearSummaryTranslation}>
                              还原
                            </Button>
                          )}
                          <Button
                            className="flex-1 h-9 text-sm gap-2 rounded-lg"
                            onClick={handleSummaryTranslateApply}
                            disabled={isSummaryTranslating}
                          >
                            {isSummaryTranslating ? (
                              <><Loader2 className="h-3.5 w-3.5 animate-spin" />翻译中...</>
                            ) : (
                              <>
                                <Languages className="h-3.5 w-3.5" />
                                开始翻译
                                <span className="flex items-center gap-1 ml-1 text-xs font-normal opacity-70">
                                  <span className="w-px h-3 bg-primary-foreground/30" />
                                  <Zap className="h-3 w-3" />1
                                </span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="复制" onClick={handleCopySummary}>
                    {summaryCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 max-h-[40vh] lg:max-h-none">
                {result.summary ? (
                  <div className="space-y-2">
                    {(!summaryTranslatedText || summaryBilingualEnabled) && (
                      <div className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{result.summary}</div>
                    )}
                    {summaryTranslatedText && summaryBilingualEnabled && (
                      <div className="flex items-center gap-2 pt-1 pb-1">
                        <div className="h-px flex-1 bg-border/60" />
                        <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                          {summaryCurrentLangLabel}
                        </span>
                        <div className="h-px flex-1 bg-border/60" />
                      </div>
                    )}
                    {summaryTranslatedText && (
                      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{summaryTranslatedText}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">暂无智能总结</p>
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
    value: 'female-gentle', label: '温柔女声', tag: '女声',
    desc: '温暖知性，情感细腻，适合有声读物、产品解说',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  {
    value: 'female-lively', label: '活泼女声', tag: '女声',
    desc: '俏皮灵动，元气满满，适合短视频、带货广告',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  {
    value: 'male-calm', label: '沉稳男声', tag: '男声',
    desc: '大气稳重，字正腔圆，适合新闻播报、品牌视频',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    value: 'male-deep', label: '磁性男声', tag: '男声',
    desc: '低沉醇厚，感染力强，适合广告配音、播客开场',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  {
    value: 'child', label: '可爱童声', tag: '童声',
    desc: '天真烂漫，自然灵动，适合儿童内容、在线教育',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
]

const bgmOptions = [
  { value: 'none', label: '无背景音乐' },
  { value: 'light', label: '轻音乐 - 温馨舒缓' },
  { value: 'inspire', label: '励志 - 昂扬向上' },
  { value: 'upbeat', label: '欢快 - 活泼灵动' },
  { value: 'cinematic', label: '电影感 - 大气磅礴' },
  { value: 'lofi', label: 'Lo-fi - 休闲放松' },
  { value: 'classical', label: '古典 - 优雅庄重' },
  { value: 'electronic', label: '电子 - 科技律动' },
]

function VoiceSettingsPopover({
  speed, pitch, volume,
  onSpeedChange, onPitchChange, onVolumeChange,
}: {
  speed: number; pitch: number; volume: number
  onSpeedChange: (v: number) => void; onPitchChange: (v: number) => void; onVolumeChange: (v: number) => void
}) {
  return (
    <PopoverContent side="left" align="start" className="w-72 p-0 overflow-hidden shadow-xl border-border/80">
      <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">声音参数设置</span>
        </div>
      </div>
      <div className="p-4 space-y-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">语速</Label>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md tabular-nums">{speed}x</span>
          </div>
          <Slider value={[speed]} onValueChange={(vals) => onSpeedChange(vals[0])} min={0.5} max={2.0} step={0.1} className="w-full" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground"><span>0.5x 慢速</span><span>2.0x 快速</span></div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">音调</Label>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md tabular-nums">{pitch > 0 ? `+${pitch}` : pitch}</span>
          </div>
          <Slider value={[pitch]} onValueChange={(vals) => onPitchChange(vals[0])} min={-10} max={10} step={1} className="w-full" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground"><span>-10 低沉</span><span>+10 高亢</span></div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">音量</Label>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md tabular-nums">{volume}%</span>
          </div>
          <Slider value={[volume]} onValueChange={(vals) => onVolumeChange(vals[0])} min={50} max={150} step={10} className="w-full" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground"><span>50%</span><span>150%</span></div>
        </div>
      </div>
    </PopoverContent>
  )
}

function VoiceResultRow({
  voice, isSelected, isPlaying, onSelect, onTogglePlay,
  speed, pitch, volume, onSpeedChange, onPitchChange, onVolumeChange,
}: {
  voice: typeof voicePresets[number]
  isSelected: boolean; isPlaying: boolean
  onSelect: () => void; onTogglePlay: () => void
  speed: number; pitch: number; volume: number
  onSpeedChange: (v: number) => void; onPitchChange: (v: number) => void; onVolumeChange: (v: number) => void
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <div onClick={onSelect} className={cn(
      'group flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200',
      isSelected ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/25 shadow-sm' : 'border-border/50 bg-card hover:border-primary/20 hover:bg-accent/30'
    )}>
      {/* Voice info - left side, always visible */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn('text-sm font-semibold transition-colors', isSelected ? 'text-primary' : 'text-foreground')}>{voice.label}</span>
          <span className={cn('inline-flex items-center rounded-md px-1.5 py-px text-[10px] font-medium border', voice.color)}>{voice.tag}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed truncate">{voice.desc}</p>
      </div>
      {isPlaying && (
        <div className="flex items-end gap-px h-4 opacity-60 shrink-0">
          {[3, 6, 4, 8, 5, 7, 4].map((h, i) => (
            <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}
      {/* Buttons - right side, hidden by default, shown on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <button onClick={(e) => { e.stopPropagation(); setSettingsOpen(!settingsOpen) }} className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
              settingsOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}>
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <VoiceSettingsPopover speed={speed} pitch={pitch} volume={volume} onSpeedChange={onSpeedChange} onPitchChange={onPitchChange} onVolumeChange={onVolumeChange} />
        </Popover>
        <button onClick={(e) => { e.stopPropagation(); onTogglePlay() }} className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
          isPlaying ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
        )}>
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>
      </div>
    </div>
  )
}

function TextToSpeechResult({ result, agent }: { result: AgentResultDetail; agent: Agent }) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [text, setText] = useState(result.sourceText || '')
  const [paramValues, setParamValues] = useState<Record<string, any>>(() => ({
    voice: result.params?.voice || 'female-gentle',
    speed: result.params?.speed ?? 1.0,
    pitch: result.params?.pitch ?? 0,
    volume: result.params?.volume ?? 100,
    bgm: result.params?.bgm || 'none',
  }))
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>()

  const currentVoice = paramValues.voice || 'female-gentle'
  const currentSpeed = paramValues.speed ?? 1.0
  const currentPitch = paramValues.pitch ?? 0
  const currentVolume = paramValues.volume ?? 100
  const currentBgm = paramValues.bgm || 'none'

  const togglePreview = (voiceValue: string) => {
    if (playingVoice === voiceValue) { setPlayingVoice(null) }
    else { setPlayingVoice(voiceValue); setTimeout(() => setPlayingVoice(null), 2000) }
  }

  const handleParamChange = (id: string, value: any) => {
    setParamValues((prev) => ({ ...prev, [id]: value }))
  }

  const handleRegenerate = () => {
    if (!text.trim()) { setError('请输入内容'); return }
    if (text.length > 5000) { setError('内容不能超过5000字'); return }
    setError(undefined)
    setIsProcessing(true)
    // Mock re-processing
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
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* ========================================== */}
      {/* LEFT: 输入内容 + 音频播放器                              */}
      {/* ========================================== */}
      <div className="flex-1 min-w-0">
        <Card className="border-border/60 shadow-sm overflow-hidden h-full">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI语音合成结果</p>
                  <p className="text-xs text-muted-foreground">可继续编辑文案并重新生成</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                      {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{copied ? '已复制' : '复制文案'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>下载音频</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Editable source text */}
            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">输入内容</span>
                <span className={cn('text-xs font-medium tabular-nums ml-auto', text.length > 4500 ? 'text-destructive' : 'text-muted-foreground')}>
                  {text.length}/5000
                </span>
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[180px] resize-none rounded-xl border-border/40 bg-secondary/10 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 text-sm leading-relaxed placeholder:text-muted-foreground/50"
                disabled={isProcessing}
              />
            </div>

            {/* Generated Audio Player */}
            <div className="px-5 pb-5">
              <div className="rounded-xl overflow-hidden border border-emerald-200/60 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-emerald-950/10">
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Static audio icon, no interaction */}
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 dark:bg-emerald-900/40">
                      <FileAudio className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{result.audioFileName || '生成的音频'}</p>
                      {result.audioInfo?.voiceName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{result.audioInfo.voiceName}</p>
                      )}
                    </div>
                  </div>
                  {result.audioUrl && <audio src={result.audioUrl} controls className="w-full mt-3" />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================== */}
      {/* RIGHT: 配音音色 + 背景音乐 + 重新生成按钮                   */}
      {/* ========================================== */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">
          {/* 配音音色 Card */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">配音音色</p>
                <p className="text-xs text-muted-foreground">替换配音音色重新生成</p>
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              {voicePresets.map((voice) => (
                <VoiceResultRow
                  key={voice.value}
                  voice={voice}
                  isSelected={currentVoice === voice.value}
                  isPlaying={playingVoice === voice.value}
                  onSelect={() => handleParamChange('voice', voice.value)}
                  onTogglePlay={() => togglePreview(voice.value)}
                  speed={currentSpeed} pitch={currentPitch} volume={currentVolume}
                  onSpeedChange={(v) => handleParamChange('speed', v)}
                  onPitchChange={(v) => handleParamChange('pitch', v)}
                  onVolumeChange={(v) => handleParamChange('volume', v)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 背景音乐 */}
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Music className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">背景音乐</p>
                <p className="text-xs text-muted-foreground">更换背景音乐重新生成</p>
              </div>
            </div>
            <div className="p-4">
              <Select value={currentBgm} onValueChange={(v) => handleParamChange('bgm', v)}>
                <SelectTrigger disabled={isProcessing} className="w-full h-11 rounded-xl border-border/60 bg-secondary/20 hover:bg-secondary/30 transition-colors">
                  <Music className="h-4 w-4 text-muted-foreground mr-2" />
                  <SelectValue placeholder="选择背景音乐" />
                </SelectTrigger>
                <SelectContent>
                  {bgmOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span>{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 重新生成按钮 */}
        <Button
          className="w-full h-12 text-base font-semibold gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5"
          size="lg"
          onClick={handleRegenerate}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              重新生成中...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              重新生成
              <span className="flex items-center gap-1 ml-1 text-xs font-normal opacity-80">
                <span className="w-px h-3 bg-primary-foreground/30" />
                <Zap className="h-3 w-3" />
                {agent.costPoints} 智点
              </span>
            </>
          )}
        </Button>

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
// 8. AI生成视频文案 — 视频脚本 + 关键词
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
    <div>
      {/* 视频脚本 + 关键词 合一卡片 */}
      <Card className="border-border/60 shadow-sm overflow-hidden gap-0">
        {/* Header + 工具栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-secondary/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">生成结果 — {result.taskName}</p>
              <p className="text-xs text-muted-foreground">
                AI 已根据主题生成完整视频脚本及推荐关键词
              </p>
            </div>
          </div>
          {/* 工具栏按钮 */}
          <div className="flex items-center gap-1 shrink-0 ml-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (isEditing) {
                      handleSaveEdit()
                    } else {
                      setEditedText(result.textContent || '')
                      setIsEditing(true)
                    }
                  }}
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isEditing ? '保存' : '编辑'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? '已复制' : '复制全文'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExportTxt}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>导出 TXT</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-xs gap-1.5 rounded-lg"
                  onClick={handleGenerateVideo}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  生成视频
                </Button>
              </TooltipTrigger>
              <TooltipContent>基于脚本生成视频</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 脚本内容区 */}
        <CardContent className="p-0">
          {isEditing ? (
            <div className="px-5 pb-0">
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[280px] resize-none rounded-xl border-border/40 bg-secondary/10 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 text-sm leading-relaxed"
              />
            </div>
          ) : (
            <div className="px-5 pb-0">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-secondary/10 rounded-xl py-4 px-0 max-h-[60vh] overflow-y-auto">
                {result.textContent}
              </pre>
            </div>
          )}

          {/* 视频关键词 */}
          {result.videoKeywords && result.videoKeywords.length > 0 && (
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Hash className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">视频关键词</span>
                <span className="text-[10px] text-muted-foreground">推荐标签，可直接用于视频发布</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.videoKeywords.map((kw, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/25 hover:bg-primary/15 transition-colors cursor-default"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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

  const handleCopyShot = (shot: StoryboardShot) => {
    const newShot: StoryboardShot = {
      ...shot,
      id: `${shot.id}-copy-${Date.now()}`,
      index: shots.length + 1,
      caption: `${shot.caption || shot.description}（复制）`,
    }
    setShots((prev) => [...prev, newShot])
    toast.success('已复制分镜')
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
            <div className="w-full max-w-2xl">
              {/* Loading 状态 */}
              <Card className="border-border/60">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      视频生成中…{Math.round(composingProgress)}%
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      我的灵感噼啪作响，客官的视频马上就好~
                    </p>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="w-full max-w-sm">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${composingProgress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="w-full max-w-3xl space-y-4">
              {/* 合成完成 - 视频预览 */}
              <Card className="border-border/60 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-black">
                    <video
                      src={composedVideoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* 下载按钮 */}
              <div className="flex gap-3">
                <Button className="flex-1 h-10">
                  <Download className="h-4 w-4 mr-2" />
                  下载视频
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-10"
                  onClick={() => setShowFinalVideo(false)}
                >
                  返回编辑
                </Button>
              </div>
              
              {/* 可复制的文案 */}
              {result.sourceText && (
                <Card className="border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">视频文案</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={handleCopySourceText}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        复制
                      </Button>
                    </div>
                    <div className="bg-secondary/10 rounded-lg p-3 border border-border/40">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {result.sourceText}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 源文案 */}
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

          {/* 分镜 + 预览 */}
          {shots.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 左侧：分镜列表 - 占 40% 宽度，固定高度可滚动 */}
              <div className="w-full lg:w-2/5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clapperboard className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">分镜脚本</h3>
                    <Badge variant="secondary" className="text-[10px]">{shots.length} 镜</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">点击分镜可在右侧预览</span>
                </div>

                {/* 分镜卡片容器 - 固定高度可滚动 */}
                <div 
                  className="space-y-3 overflow-y-auto pr-1"
                  style={{ height: 'calc(100vh - 120px)' }}
                >
                  {shots.map((shot) => {
                    const isActive = activeShotId === shot.id
                    return (
                      <div
                        key={shot.id}
                        onClick={() => setActiveShotId(shot.id)}
                        className={cn(
                          'group rounded-[8px] border bg-card overflow-hidden transition-all cursor-pointer shadow-sm hover:shadow-md',
                          isActive
                            ? 'border-primary/40 ring-1 ring-primary/20'
                            : 'border-border/60 hover:border-primary/20'
                        )}
                      >
                        <div className="flex gap-3 p-3">
                          {/* 左侧：视频缩略图 - 固定宽度 */}
                          <div className="relative shrink-0 w-[140px] aspect-video rounded-[8px] overflow-hidden bg-secondary/40 border border-border/50">
                            {shot.imageUrl ? (
                              <img
                                src={shot.imageUrl}
                                alt={`镜${shot.index}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <ImagePlus className="h-6 w-6" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-6 w-6 text-white fill-white" />
                            </div>
                            <Badge className="absolute bottom-2 left-2 text-[10px] h-4 px-1 bg-black/70 text-white border-0">
                              镜{shot.index}
                            </Badge>
                          </div>

                          {/* 右侧：分镜内容区 */}
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            {/* 顶部：分镜序号 + 操作按钮 */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground">
                                  镜 {shot.index}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {shot.duration}
                                </span>
                              </div>
                              {/* 操作按钮 */}
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn('h-6 w-6', editingShotId === shot.id && 'text-primary bg-primary/10')}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingShotId(shot.id)
                                    textareaRefs.current[shot.id]?.focus()
                                  }}
                                  title="编辑分镜"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopyShot(shot)
                                  }}
                                  title="复制分镜"
                                >
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteShot(shot.id)
                                  }}
                                  title="删除分镜"
                                >
                                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>

                            {/* 底部：分镜字幕文本框 */}
                            <div className="flex-1 min-h-0">
                              <Textarea
                                ref={(el) => { textareaRefs.current[shot.id] = el }}
                                value={shot.caption || shot.description}
                                onChange={(e) => handleCaptionChange(shot.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={() => setEditingShotId(shot.id)}
                                onBlur={() => setEditingShotId((prev) => (prev === shot.id ? null : prev))}
                                placeholder="输入分镜字幕..."
                                className={cn(
                                  'h-full min-h-[60px] resize-none rounded-[6px] border bg-secondary/10 text-xs leading-relaxed py-1.5 px-2 transition-all',
                                  editingShotId === shot.id
                                    ? 'border-primary ring-1 ring-primary/20'
                                    : 'border-border/40 focus-visible:ring-1 focus-visible:ring-primary/30'
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 右侧：视频预览 - 占 60% 宽度，高度与左侧保持一致 */}
              <div className="w-full lg:w-3/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">视频预览</h3>
                </div>

                <Card className="border-border/60 overflow-hidden h-full">
                  <CardContent className="p-0 flex flex-col h-full" style={{ height: 'calc(100vh - 120px)' }}>
                    {/* 视频播放器 - 占主要空间 */}
                    <div className="relative flex-1 bg-black">
                      <video
                        key={composedVideoUrl}
                        src={composedVideoUrl}
                        controls
                        className="w-full h-full object-contain"
                        poster={activeShot?.imageUrl}
                      />
                      {activeShot?.caption && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-[90%] px-3 py-1.5 rounded-md bg-black/70 text-white text-xs text-center line-clamp-2">
                          {activeShot.caption}
                        </div>
                      )}
                    </div>

                    {/* 底部控制区 */}
                    <div className="p-4 border-t border-border/40 bg-card space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          当前分镜：
                          <span className="text-foreground font-medium ml-1">
                            镜{activeShot?.index || 1} / {shots.length}
                          </span>
                        </span>
                        <span>{activeShot?.duration}</span>
                      </div>

                      <Button
                        className="w-full h-10"
                        onClick={handleCompose}
                        disabled={isComposing}
                      >
                        {isComposing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            合成中…
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            合成完整视频
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {shots.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground border rounded-xl border-border/60">
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
        <ResultHeader result={result} agent={agent} fileName={fileName} />

        {/* 结果内容 */}
        {renderResult()}
      </div>
    </div>
  )
}
