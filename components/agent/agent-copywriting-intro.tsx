'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  PenTool,
  Sparkles,
  FileText,
  Wand2,
  Lightbulb,
  Hash,
  Globe,
  Video,
  Store,
  Megaphone,
  Leaf,
  Newspaper,
  Building2,
  MessageSquareText,
  Sliders,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================
// Hero — compact, functional
// ============================================================

function HeroSection() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        AI生成视频文案
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        输入一段视频主题，AI即可自动生成完整的视频脚本与推荐发布关键词，支持多语言输出和自定义文案要求。
      </p>
    </div>
  )
}

// ============================================================
// Steps — visual stepper with order guidance
// ============================================================

const steps = [
  {
    icon: PenTool,
    title: '输入主题',
    desc: '输入视频主题、产品名称或创意关键词，AI自动理解你的创作意图与目标受众。',
  },
  {
    icon: Wand2,
    title: 'AI智能生成',
    desc: '一键生成完整视频脚本，附带推荐关键词，可直接用于内容发布。',
  },
  {
    icon: FileText,
    title: '编辑使用',
    desc: '在线编辑文案内容，一键复制或导出TXT，也可以直接基于脚本生成视频。',
  },
]

function StepsSection() {
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-foreground mb-5">使用流程</h2>
      <div className="relative flex flex-col md:flex-row md:items-start gap-0">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isLast = index === steps.length - 1
          return (
            <div key={index} className="relative flex md:flex-1 md:flex-col items-start md:items-center">
              {!isLast && (
                <div className="hidden md:block absolute top-5 left-[calc(50%+24px)] w-[calc(100%-48px)] h-[2px] bg-gradient-to-r from-primary/40 to-primary/10" />
              )}
              {!isLast && (
                <div className="md:hidden absolute left-5 top-12 w-[2px] h-[calc(100%-32px)] bg-gradient-to-b from-primary/40 to-primary/10" />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm shadow-primary/25">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="mt-2 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="ml-4 md:ml-0 md:mt-3 md:text-center md:px-2 pb-6 md:pb-0 flex-1">
                <h3 className="text-sm font-bold text-foreground mb-1 tracking-wide">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed tracking-wide max-w-[220px] md:mx-auto">{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ============================================================
// Features — compact grid, short descriptions
// ============================================================

const features = [
  {
    icon: Globe,
    title: '多语言输出',
    desc: '支持简体中文、English、日本語、한국어、Español 五种语言，也可以选择自动检测',
  },
  {
    icon: Hash,
    title: '段落灵活控制',
    desc: '1-10 段自由调节，精准控制文案篇幅，适配不同时长和平台的发布需求',
  },
  {
    icon: MessageSquareText,
    title: '自定义文案要求',
    desc: '自由描述语气、风格、目标受众等偏好，AI按需生成最贴合需求的脚本',
  },
  {
    icon: Sparkles,
    title: '附带视频关键词',
    desc: '生成脚本的同时自动匹配热搜标签，可直接复制用于视频发布获得更多曝光',
  },
  {
    icon: Sliders,
    title: '编辑后生成视频',
    desc: '对生成结果在线编辑调整，满意后一键跳转AI文案生视频，完成出片流程',
  },
  {
    icon: Lightbulb,
    title: '灵感枯竭救星',
    desc: '只需输入一个主题即可获得完整脚本与关键词，告别创作焦虑',
  },
]

function FeaturesSection() {
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-foreground mb-4">功能特性</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((item, index) => {
          const Icon = item.icon
          return (
            <Card
              key={index}
              className="group p-0 bg-white dark:bg-card border-border/40 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-3 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground mb-1 tracking-wide">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed tracking-wide">{item.desc}</p>
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
// Scenarios — colorful gradient cards
// ============================================================

const scenarios = [
  {
    icon: Video,
    title: '短视频脚本',
    desc: '输入产品卖点或话题方向，自动生成带节奏感的脚本，附带平台热门标签',
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-white/70 dark:bg-white/10',
  },
  {
    icon: Store,
    title: '产品推广',
    desc: '输入产品名称与核心卖点，快速生成展示型脚本及营销关键词',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-white/70 dark:bg-white/10',
  },
  {
    icon: Megaphone,
    title: '品牌宣传',
    desc: '输入品牌理念与价值主张，生成有感染力的品牌叙事脚本',
    bg: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-white/70 dark:bg-white/10',
  },
  {
    icon: Leaf,
    title: '生活方式内容',
    desc: '输入穿搭、美食、旅行等生活类主题，生成打卡式 VLOG 脚本',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-white/70 dark:bg-white/10',
  },
  {
    icon: Newspaper,
    title: '知识科普',
    desc: '输入知识点或行业热点，自动生成通俗易懂的科普讲解脚本',
    bg: 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-white/70 dark:bg-white/10',
  },
  {
    icon: Building2,
    title: '品牌故事',
    desc: '输入品牌背景，生成打动人心的品牌叙事，建立用户深层情感连接',
    bg: 'bg-gradient-to-br from-indigo-50 to-fuchsia-50 dark:from-indigo-950/30 dark:to-fuchsia-950/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-white/70 dark:bg-white/10',
  },
]

function ScenariosSection() {
  return (
    <section className="mt-12 pt-12 mb-8 border-t border-border/30">
      <h2 className="text-base font-semibold text-foreground mb-4">适用场景</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((item, index) => {
          const Icon = item.icon
          return (
            <Card
              key={index}
              className={cn(
                'group p-0 border-0 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300',
                item.bg
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm',
                    item.iconBg
                  )}>
                    <Icon className={cn('h-4 w-4', item.iconColor)} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground tracking-wide">{item.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground/90 leading-relaxed tracking-wide pl-[52px]">{item.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

// ============================================================
// FAQ — compact accordion
// ============================================================

const faqs = [
  {
    q: '如何使用AI生成视频文案？',
    a: '非常简单：输入视频主题或产品关键词 → 设置生成语言、段落数量和自定义要求 → 点击"开始生成"，AI即刻生成完整视频脚本与推荐关键词，支持在线编辑、复制导出以及一键跳转生成视频。',
  },
  {
    q: '生成的文案是原创的吗？',
    a: '是的。AI基于大语言模型进行语义理解和创意生成，每篇文案都是独立创作，不会直接复制网络上的已有内容。同时支持查重校验，确保内容原创度。',
  },
  {
    q: '支持哪些使用场景？',
    a: '覆盖短视频脚本、产品推广、品牌宣传、生活方式 VLOG、知识科普、品牌故事等多种内容创作场景。只需输入一个主题，AI即可匹配合适的脚本结构。',
  },
  {
    q: '如何自定义文案的风格和语气？',
    a: '在右侧参数区的"自定义要求"输入框中，你可以自由描述期望的语气、面向的用户类型、内容风格等偏好，比如"轻松幽默，面向年轻用户，开头要有悬念"，AI会据此精准生成。',
  },
  {
    q: '生成的文案长度能控制吗？',
    a: '可以。通过"段落数量"滑块（1-10段）灵活控制脚本篇幅：1-3段适合15秒短视频，4-6段适合1-3分钟内容，7-10段适合深度长视频。',
  },
  {
    q: '不满意可以重新生成吗？',
    a: '可以。你可以调整参数后再次生成，也可以在结果页直接编辑脚本内容后再点击"生成视频"跳转到文案生视频应用，完成出片流程。',
  },
  {
    q: '生成的文案可以商用吗？',
    a: '可以。VIP会员生成的文案可用于商业用途，包括短视频发布、广告投放、品牌宣传等商业化场景，助你内容变现无忧。',
  },
]

function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">常见问题</h2>
      <div className="max-w-2xl space-y-2">
        {faqs.map((faq, index) => {
          const isOpen = expandedIndex === index
          return (
            <div
              key={index}
              className="rounded-lg border border-border/40 bg-card overflow-hidden transition-colors hover:border-border"
            >
              <button
                onClick={() => setExpandedIndex(isOpen ? null : index)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-secondary/30"
              >
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )} />
                <span className="flex-1 text-sm font-medium text-foreground">{faq.q}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-3 pl-10">
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ============================================================
// Main Component
// ============================================================

export function AgentCopywritingIntro() {
  return (
    <div className="w-full space-y-0">
      <HeroSection />
      <StepsSection />
      <FeaturesSection />
      <ScenariosSection />
      <FAQSection />
    </div>
  )
}
