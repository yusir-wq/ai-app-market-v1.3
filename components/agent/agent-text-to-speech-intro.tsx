'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Mic,
  Users,
  Zap,
  Globe,
  Clock,
  Sparkles,
  Video,
  Megaphone,
  Package,
  Building2,
  GraduationCap,
  Podcast,
  FileText,
  Wand2,
  Volume2,
  ChevronRight,
} from 'lucide-react'

// ============================================================
// Section Title Component
// ============================================================

function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
    <div className="text-center mb-10">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        免费在线体验
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
        免费在线 AI 文字转语音
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        秒级生成带情感、99+语言的真人级文字朗读，言随己心，音如你愿。
      </p>
    </div>
  )
}

// ============================================================
// Steps Section
// ============================================================

const steps = [
  {
    icon: FileText,
    title: '输入文案',
    desc: '直接在文本框输入或上传 txt 文件，支持 5000 字以内任意长度的文案内容。AI 帮你写、随机故事灵感，多种填词方式随心选。',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    icon: Volume2,
    title: '选择音色 & 参数',
    desc: '从 500+ 真实人声中挑选心仪音色——温柔女声、沉稳男声、活泼童声一键切换。语速、音调、音量自由调节，输出 MP3/WAV/M4A 随心选。',
    color: 'bg-violet-50 text-violet-600 border-violet-200',
  },
  {
    icon: Wand2,
    title: '一键生成 & 下载',
    desc: '点击"开始处理"，AI 即刻进行文本分析→语音合成→音频渲染，10-30 秒即可获得带情感的自然人声，即时预览、一键下载。',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
]

function StepsSection() {
  return (
    <section className="mb-12">
      <SectionTitle
        title="3步生成，文字秒变人声"
        subtitle="简单三步，即可将文字转化为自然流畅的真人级语音。"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <Card
              key={index}
              className="border-border/60 hover:border-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-sm group"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${step.color} flex items-center justify-center shrink-0 border`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-primary">
                        0{index + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {step.desc}
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
// Advantages Section
// ============================================================

const advantages = [
  {
    icon: Mic,
    title: '自然人声，告别机械音',
    desc: '告别生硬冰冷的机械音。我们凭借领先 AI 语音技术，还原温暖、自然且富有表现力的人声，让听众沉浸其中。',
    color: 'rose',
  },
  {
    icon: Users,
    title: '500+真实声音，一键切换',
    desc: '无论是亲切的向导、生动的方言，还是沉稳的旁白，您都能在数百种独特音色中精准匹配。心仪之声，一键即达。',
    color: 'sky',
  },
  {
    icon: Zap,
    title: '操作简单，稳定流畅',
    desc: '输入文案，点击生成，即可完成文字转语音。生成音频流畅无阻，可即时预览，助您全心投入创作，尽享无忧体验。',
    color: 'amber',
  },
  {
    icon: Globe,
    title: '100+多语言支持，声传全球',
    desc: '轻松生成逾百种语言的专业配音。用地道纯正的语音制作视频与播客，助您的内容无界传播，直抵全球受众。',
    color: 'emerald',
  },
  {
    icon: Clock,
    title: '10倍速度，成本锐减',
    desc: '以十分之一的时间与成本，收获专业级配音。AI 文字转语音可在几分钟内完成以往需数日的文字配音工作，品质出众，价格惊喜。',
    color: 'violet',
  },
]

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    icon: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-900',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    icon: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-900',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-900',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    icon: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-900',
  },
}

function AdvantagesSection() {
  return (
    <section className="mb-12">
      <SectionTitle
        title="为什么认准 AI 文字转语音？"
        subtitle="真人腔调，自然发声，支持 99+ 语言，配音速度提升 10 倍。"
      />
      <div className="grid grid-cols-1 gap-4">
        {advantages.map((item, index) => {
          const Icon = item.icon
          const colors = colorMap[item.color]
          return (
            <Card
              key={index}
              className="border-border/60 hover:border-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1.5">
                      {item.title}
                    </h3>
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
    icon: Video,
    title: '短视频',
    desc: '用生动配音抓住观众注意力，提升完播率，让您的视频脱颖而出。',
    color: 'rose',
  },
  {
    icon: Megaphone,
    title: '带货广告',
    desc: '一键生成多语言、多音色的广告推销音频，让互动与转化效果最大化。',
    color: 'amber',
  },
  {
    icon: Package,
    title: '产品解说',
    desc: '以清晰、富有感染力的语音，将复杂功能娓娓道来，让用户轻松理解产品价值。',
    color: 'sky',
  },
  {
    icon: Building2,
    title: '品牌视频',
    desc: '塑造专属、统一的品牌音色，建立声音标识，增强品牌辨识度与用户信任。',
    color: 'violet',
  },
  {
    icon: GraduationCap,
    title: '在线课程',
    desc: '搭配权威且清晰的 AI 旁白，打造沉浸式学习体验，提升课程学习效率。',
    color: 'emerald',
  },
  {
    icon: Podcast,
    title: '播客开场',
    desc: '打造极具辨识度的开场白，用声音营造氛围，在三秒内牢牢抓住听众的耳朵。',
    color: 'violet',
  },
]

function ScenariosSection() {
  return (
    <section className="mb-12">
      <SectionTitle
        title="用 AI 文字转语音 解锁无限可能"
        subtitle='每个内容都需要声音，AI 文字转语音，让内容立刻"声"动。'
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((item, index) => {
          const Icon = item.icon
          const colors = colorMap[item.color]
          return (
            <Card
              key={index}
              className="border-border/60 hover:border-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`h-4 w-4 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
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
// FAQ Section
// ============================================================

const faqs = [
  {
    q: 'AI 文字转语音如何使用？',
    a: '非常简单：输入或粘贴文案 → 选择音色和语速等参数 → 点击"开始处理"，AI 即刻进行文本分析、语音合成与音频渲染，10-30 秒即可获得自然流畅的人声朗读音频，支持在线预览和下载。',
  },
  {
    q: 'AI 文字转语音支持哪些语言？',
    a: '支持 100+ 种语言及方言变体，包括中文、英语、日语、韩语、法语、德语、西班牙语等主流语种，以及粤语、四川话等方言，满足全球化配音需求。',
  },
  {
    q: '生成的语音听起来自然吗？',
    a: '非常自然。我们采用领先的 AI 语音合成技术，能够还原温暖、富有表现力的自然人声，告别生硬冰冷的机械音，让听众沉浸其中。',
  },
  {
    q: '可以自定义语速和音调吗？',
    a: '可以。支持自由调节语速（0.5x - 2.0x）、音调（-10 到 +10）和音量（50% - 150%），让每一段配音都精准匹配你的内容风格。',
  },
  {
    q: '支持哪些输出格式？',
    a: '支持 MP3、WAV、M4A 三种主流音频格式导出，兼容各类视频编辑软件、播客平台和社交媒体。',
  },
  {
    q: 'AI 文字转语音是免费的吗？',
    a: '每位用户每天可免费体验 AI 文字转语音 3 次。如需频繁使用、更大文本量或解锁更多高级音色，可选择开通 VIP 会员。',
  },
  {
    q: '一次能处理多少字的文案？',
    a: '单次支持处理 5000 字以内的文案。同时也支持上传 .txt 文件，AI 帮你写或随机故事灵感快速填充内容。',
  },
  {
    q: '生成的音频可以商用吗？',
    a: '可以。VIP 会员生成的音频可用于商业用途，包括短视频配音、广告推广、品牌视频、在线课程等场景，助您内容变现无忧。',
  },
]

function FAQSection() {
  return (
    <section className="mb-8">
      <SectionTitle
        title="常见问题"
        subtitle="关于免费在线 AI 文字转语音的常见问题，下方为你解答。"
      />
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <Card
            key={index}
            className="border-border/60 hover:border-primary/20 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">Q</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">
                    {faq.q}
                  </h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

// ============================================================
// Main Component
// ============================================================

export function AgentTextToSpeechIntro() {
  return (
    <div className="w-full pb-4">
      <HeroSection />
      <StepsSection />
      <AdvantagesSection />
      <ScenariosSection />
      <FAQSection />
    </div>
  )
}
