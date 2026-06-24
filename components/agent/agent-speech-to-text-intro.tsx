'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Mic,
  Cpu,
  Users,
  Sparkles,
  Globe,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Video,
  Phone,
  ClipboardList,
  Scale,
  Upload,
  Wand2,
  FileText,
  ChevronDown,
  ArrowRight,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ============================================================
// Decorative Waveform Component
// ============================================================

function WaveformDecoration({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end justify-center gap-[3px] h-6 opacity-[0.12]', className)}>
      {[6, 14, 8, 20, 10, 24, 6, 18, 12, 22, 8, 16, 10, 20, 6, 14, 8, 24, 10, 18, 6, 16, 12, 20, 8, 14, 10, 22].map((h, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full bg-foreground"
          style={{
            height: `${h * 1.2}px`,
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}

// ============================================================
// Section Title Component
// ============================================================

function SectionTitle({
  title,
  subtitle,
  accent,
}: {
  title: string
  subtitle?: string
  accent?: string
}) {
  return (
    <div className="text-center mb-10">
      {accent && (
        <span className="inline-block text-[11px] font-semibold text-primary uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
          {accent}
        </span>
      )}
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ============================================================
// Hero Section
// ============================================================

function HeroSection() {
  return (
    <div className="relative text-center mb-14 pt-2">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />

      {/* Status badge */}
      <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        免费在线体验 · 每日1次
      </div>

      {/* Title */}
      <h1 className="relative text-3xl sm:text-4xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">
        免费在线{' '}
        <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-600 bg-clip-text text-transparent">
          AI语音转文字
        </span>
      </h1>

      {/* Subtitle */}
      <p className="relative text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed mb-6">
        AI语音转文字，精准转写、自动区分发言人，一键生成智能摘要。
        <br />
        每天免费使用1次，会听、会记、更懂你！
      </p>

      {/* Audio waveform decoration */}
      <WaveformDecoration className="mx-auto" />

      {/* Quick stats row */}
      <div className="flex items-center justify-center gap-6 mt-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          98% 准确率
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          99+ 语言
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          多格式支持
        </span>
      </div>
    </div>
  )
}

// ============================================================
// Steps Section
// ============================================================

const steps = [
  {
    icon: Upload,
    title: '上传音视频',
    desc: '点击上传或拖拽文件上传，也可选择实时录音转换，支持MP3、MP4、WAV等格式。',
    gradient: 'from-blue-500/10 to-cyan-500/5',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-900',
    stepColor: 'text-blue-500',
  },
  {
    icon: Wand2,
    title: 'AI转写提炼',
    desc: 'AI高精度识别转文字，自动区分说话人，智能提炼要点。',
    gradient: 'from-violet-500/10 to-purple-500/5',
    iconBg: 'bg-violet-50 dark:bg-violet-950/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-200 dark:border-violet-900',
    stepColor: 'text-violet-500',
  },
  {
    icon: FileText,
    title: '校对 & 导出',
    desc: '内容可快速编辑调整，一键复制导出文本，即转即用。',
    gradient: 'from-emerald-500/10 to-teal-500/5',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-900',
    stepColor: 'text-emerald-500',
  },
]

function StepsSection() {
  return (
    <section className="mb-14">
      <SectionTitle
        title="3步极速转写，语音秒变文字"
        subtitle="AI语音转文字，解放双手，专注思考与沟通。"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={index} className="relative group">
              {/* Step connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px">
                  <div className="w-full h-full bg-gradient-to-r from-border/60 to-transparent" />
                </div>
              )}

              <Card className="relative overflow-hidden border-border/40 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group-hover:shadow-primary/5">
                {/* Gradient overlay */}
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', step.gradient)} />

                <CardContent className="relative p-6">
                  {/* Step number badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={cn('text-[11px] font-bold uppercase tracking-wider', step.stepColor)}>
                      Step 0{index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-300',
                    'group-hover:scale-110 group-hover:shadow-md',
                    step.iconBg,
                    step.borderColor,
                  )}>
                    <Icon className={cn('h-6 w-6', step.iconColor)} />
                  </div>

                  {/* Content */}
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Hover arrow indicator */}
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                    <span>开始体验</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ============================================================
// Advantages Section
// ============================================================

const advantages = [
  {
    icon: Mic,
    title: '精准识别，98%准确率',
    desc: '搭载行业领先的AI语音识别引擎，针对复杂对话、专业术语、口音差异等难点深度优化，转写准确率高达98%。无论是技术研讨会中的专业名词，还是日常交流，均能清晰捕捉，大幅减少人工修正成本，确保关键信息完整呈现。',
    color: 'rose' as const,
    gradient: 'from-rose-500/5 to-rose-500/[0.02]',
  },
  {
    icon: Cpu,
    title: '实时录音，秒出文字',
    desc: '支持在线实时录音，录音完成后即时生成文字稿。会议进行中、采访现场或课堂笔记时，边录边收集信息，录制结束后秒获完整文字版，快速捕捉灵感与关键信息，让高效转写融入每一刻的沟通场景。',
    color: 'sky' as const,
    gradient: 'from-sky-500/5 to-sky-500/[0.02]',
  },
  {
    icon: Users,
    title: '多人对话，智能区分',
    desc: '针对多人对话场景，AI语音转文字可自动识别不同说话人，并在转写文本中清晰标注（如"说话人1、说话人2"），避免内容混淆。无论是团队会议、圆桌讨论还是访谈交流，都能快速理清逻辑，提升信息整理效率。',
    color: 'amber' as const,
    gradient: 'from-amber-500/5 to-amber-500/[0.02]',
  },
  {
    icon: Sparkles,
    title: '智能总结，AI问答辅助',
    desc: '不仅提供基础转写，更能自动提炼核心结论、待办事项，还可以与AI对话交互，可追问细节、调整表述。让语音内容不仅是文字记录，更能直接转化为可行动的洞察。无论是复盘会议重点，还是优化访谈内容，都能高效完成。',
    color: 'violet' as const,
    gradient: 'from-violet-500/5 to-violet-500/[0.02]',
  },
  {
    icon: Globe,
    title: '99+语言，全球通用',
    desc: '支持99+种语言及方言，包括英语、法语、德语、日语、西班牙语等主流语种，以及四川话、粤语等常用方言，满足跨国会议、多语言课程、国际调研等全球化场景需求。无论何种语言环境，AI语音转文字都能精准转写，打破语言壁垒。',
    color: 'emerald' as const,
    gradient: 'from-emerald-500/5 to-emerald-500/[0.02]',
  },
  {
    icon: ShieldCheck,
    title: '安全加密，隐私保障',
    desc: '严格遵循端到端加密存储与GDPR国际合规标准，从传输到存储全程加密保护，确保用户语音数据与转写内容100%私密安全。敏感会议、法律取证等场景均可放心使用，数据主权完全由用户掌控。',
    color: 'slate' as const,
    gradient: 'from-slate-500/5 to-slate-500/[0.02]',
  },
]

const colorMap = {
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-900/60',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    iconColor: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-900/60',
    dot: 'bg-sky-500',
    badge: 'bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-900/60',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900/60',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-900/60',
    dot: 'bg-violet-500',
    badge: 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-900/30',
    iconColor: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800/60',
    dot: 'bg-slate-500',
    badge: 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800',
  },
}

function AdvantagesSection() {
  return (
    <section className="mb-14">
      <SectionTitle
        title="AI语音转文字6大核心优势"
        subtitle="精准识别、实时高效、安全可靠，用AI语音转文字解锁语音转写的无限可能！"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advantages.map((item, index) => {
          const Icon = item.icon
          const c = colorMap[item.color]
          return (
            <Card
              key={index}
              className="group relative overflow-hidden border-border/40 hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Gradient overlay on hover */}
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', item.gradient)} />

              <CardContent className="relative p-5">
                <div className="flex items-start gap-4">
                  {/* Icon with colored background */}
                  <div className={cn(
                    'w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300',
                    'group-hover:scale-110 group-hover:shadow-sm',
                    c.bg,
                    c.border,
                  )}>
                    <Icon className={cn('h-5 w-5', c.iconColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title row with decorative dot */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
                      <h3 className="text-sm font-bold text-foreground">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

// ============================================================
// Scenarios Section
// ============================================================

const scenarios = [
  {
    icon: Briefcase,
    title: '高效会议纪要',
    desc: '智能区分每位发言人，自动生成条理清晰的会议纪要，支持一键复制待办事项与核心决议，让您全程专注会议沟通，会后执行效率提升300%。',
    color: 'sky' as const,
  },
  {
    icon: GraduationCap,
    title: '课程讲座整理',
    desc: '完整捕捉讲师每个知识点，智能识别课程重点与难点，生成结构化课堂笔记，让学生专注听讲而非埋头记录，复习效率与理解深度同步提升。',
    color: 'emerald' as const,
  },
  {
    icon: Video,
    title: '自媒体文案速记',
    desc: '一键提取热门视频文案，智能解析其爆款结构与核心话术，并据此快速生成风格相近、主题多样的仿写文案。助您轻松把握流量脉搏，高效创作优质内容。',
    color: 'violet' as const,
  },
  {
    icon: Phone,
    title: '销售拜访复盘',
    desc: '完整记录客户沟通细节，智能分析客户需求痛点与商机点，自动生成拜访报告，为销售策略优化提供数据支撑，助力成交率提升45%以上。',
    color: 'amber' as const,
  },
  {
    icon: ClipboardList,
    title: '访谈调研转录',
    desc: '专业级转录准确率保障，智能标识不同受访对象，完整保留原始语料价值，为定性研究提供精准文本基础，让工作者的数据分析事半功倍。',
    color: 'rose' as const,
  },
  {
    icon: Scale,
    title: '法律取证记录',
    desc: '符合司法取证规范的高精度转录服务，确保每个对话细节都被完整、客观记录，形成具有法律效力的文字凭证，为案件审理提供可靠依据。',
    color: 'slate' as const,
  },
]

function ScenariosSection() {
  return (
    <section className="mb-14">
      <SectionTitle
        title="AI语音转文字，赋能每一个专业场景"
        subtitle="专为高效工作者打造的AI语音转文字解决方案，让声音的价值被完整记录、高效利用！"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((item, index) => {
          const Icon = item.icon
          const c = colorMap[item.color]
          return (
            <Card
              key={index}
              className="group relative overflow-hidden border-border/40 hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardContent className="p-5">
                {/* Top: Icon + Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110',
                    c.bg,
                    c.border,
                  )}>
                    <Icon className={cn('h-4 w-4', c.iconColor)} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {item.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>

                {/* Bottom accent line */}
                <div className={cn('mt-4 h-0.5 w-0 group-hover:w-full rounded-full transition-all duration-500', c.dot)} />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

// ============================================================
// FAQ Section
// ============================================================

const faqs = [
  {
    q: 'AI语音转文字如何使用？',
    a: '使用AI语音转文字非常简单：上传音视频文件或者选择实时录音，AI即可自动识别并生成文字稿与智能总结，支持在线编辑、复制和多种格式导出。',
  },
  {
    q: '最好用的免费AI语音转文字软件是哪个？',
    a: '最好用的免费AI语音转文字工具就是本平台，每日可免费使用1次。不仅转写准确率高、支持多语言，更拥有一键智能优化等贴心功能，成为众多高效人士的首选。',
  },
  {
    q: 'AI语音转文字的准确率如何？',
    a: '本平台采用领先的AI识别引擎，在普通话和常见方言场景下均保持98%高准确率，完美满足会议记录等场景语音转换文字需求。',
  },
  {
    q: 'AI语音转文字是免费的吗？',
    a: '每位用户每天可免费体验AI语音转文字1次（20分钟内文件）。如需频繁使用或解锁高级功能，可选择开通VIP会员。',
  },
  {
    q: '上传的音视频数据安全性能保障吗？',
    a: '本平台承诺保障用户数据安全，采用银行级别加密技术，所有音视频文件仅用于转写处理，绝不外泄。',
  },
  {
    q: 'AI语音转文字能否区分不同说话人？',
    a: '可以。AI语音转文字具备自动声纹识别功能，能够智能区分对话中的不同发言人，并支持手动标注修改人物名称。',
  },
  {
    q: 'AI语音转文字支持哪些音视频格式？',
    a: '本平台兼容性强，支持MP4、MP3、WAV、M4A等19种主流音视频格式，满足绝大多数音视频转写需求。',
  },
  {
    q: 'AI语音转文字是否支持实时转写？',
    a: '支持。AI语音转文字提供实时录音转写模式，边说边转，适用于会议、访谈、课堂等需要即时文字记录的场合。',
  },
  {
    q: 'AI语音转文字是否支持多语种？',
    a: '是的。AI语音转文字除中文外，还支持英语、日语、法语等99种世界主流语言的识别转写。',
  },
  {
    q: 'AI语音转文字成功后能否复制导出？',
    a: '可以。使用AI语音转文字生成的文本，支持在线校对与修改，并可随意复制、导出Word常用文档格式使用。',
  },
]

function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <section className="mb-6">
      <SectionTitle
        title="常见问题"
        subtitle="关于免费在线AI语音转文字的常见问题，下方为你解答。"
      />

      <div className="max-w-2xl mx-auto space-y-2.5">
        {faqs.map((faq, index) => {
          const isExpanded = expandedIndex === index
          return (
            <div
              key={index}
              className="rounded-xl border border-border/40 bg-card overflow-hidden transition-all duration-300 hover:border-border"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/30"
              >
                {/* Q badge */}
                <div className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold transition-all duration-300',
                  isExpanded
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground'
                )}>
                  Q
                </div>

                <span className="flex-1 text-sm font-semibold text-foreground pr-2">
                  {faq.q}
                </span>

                <ChevronDown className={cn(
                  'h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300',
                  isExpanded && 'rotate-180'
                )} />
              </button>

              {/* Answer (collapsible) */}
              <div className={cn(
                'grid transition-all duration-300',
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}>
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 pl-[52px]">
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ============================================================
// Divider Component
// ============================================================

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <Mic className="h-4 w-4 text-muted-foreground/30" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
    </div>
  )
}

// ============================================================
// CTA Section
// ============================================================

function CTASection() {
  return (
    <section className="text-center py-10 mb-4">
      <div className="relative inline-block">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/[0.06] blur-2xl pointer-events-none" />

        <div className="relative space-y-4">
          <h3 className="text-lg font-bold text-foreground">
            准备好体验AI语音转文字了吗？
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            每天免费使用1次，立即上传音视频文件，体验高精度AI转写
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
              <Upload className="h-4 w-4 mr-2" />
              免费体验
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Main Component
// ============================================================

export function AgentSpeechToTextIntro() {
  return (
    <div className="w-full pb-4">
      <HeroSection />
      <StepsSection />
      <SectionDivider />
      <AdvantagesSection />
      <SectionDivider />
      <ScenariosSection />
      <FAQSection />
      <CTASection />
    </div>
  )
}
