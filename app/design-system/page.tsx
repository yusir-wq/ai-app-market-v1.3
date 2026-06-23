'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Type,
  Ruler,
  Contrast,
  Component,
  FormInput,
  Copy,
  Check,
  ArrowLeft,
  Bot,
  Zap,
  Clock,
  Smartphone,
  Headphones,
  BookOpen,
  Search,
  AlertCircle,
  ChevronRight,
  Palette,
  Layers,
  Box,
  MousePointerClick,
  CheckSquare,
  Menu,
  X,
  Sparkles,
  Terminal,
} from 'lucide-react'

// ── Navigation sections ─────────────────────────
const sections = [
  { id: 'overview', label: '概览', icon: Sparkles },
  { id: 'colors', label: '颜色系统', icon: Palette },
  { id: 'typography', label: '排版系统', icon: Type },
  { id: 'spacing', label: '间距 & 圆角', icon: Ruler },
  { id: 'shadows', label: '阴影 & 过渡', icon: Contrast },
  { id: 'buttons', label: '按钮', icon: MousePointerClick },
  { id: 'forms', label: '表单控件', icon: FormInput },
  { id: 'feedback', label: '反馈 & 数据展示', icon: Layers },
  { id: 'overlay', label: '弹窗 & 浮层', icon: Box },
  { id: 'agent-patterns', label: '智能体模式', icon: Bot },
  { id: 'validation', label: '表单校验', icon: CheckSquare },
]

// ── Token data ─────────────────────────────────
const colorTokens = [
  { name: '--background', light: '#FFFFFF', dark: '#09090B', label: '页面背景', usage: 'body' },
  { name: '--foreground', light: '#09090B', dark: '#FAFAFA', label: '主文字', usage: 'text' },
  { name: '--primary', light: '#575CE9', dark: '#7B7DF7', label: '品牌主色', usage: 'btn / accent' },
  { name: '--primary-foreground', light: '#FAFAFA', dark: '#09090B', label: '主色文字', usage: 'on-primary' },
  { name: '--secondary', light: '#F7F8FB', dark: '#27272A', label: '次要背景', usage: 'chip / badge' },
  { name: '--secondary-foreground', light: '#18181B', dark: '#FAFAFA', label: '次要文字', usage: 'on-secondary' },
  { name: '--muted', light: '#F7F8FB', dark: '#27272A', label: '静音背景', usage: 'hover bg' },
  { name: '--muted-foreground', light: '#71717A', dark: '#A1A1AA', label: '辅助文字', usage: 'description' },
  { name: '--accent', light: '#F4F4F8', dark: '#27272A', label: '强调背景', usage: 'hover / active' },
  { name: '--accent-foreground', light: '#18181B', dark: '#FAFAFA', label: '强调文字', usage: 'on-accent' },
  { name: '--destructive', light: '#EF4444', dark: '#7F1D1D', label: '危险/错误', usage: 'error state' },
  { name: '--border', light: '#E4E4E7', dark: '#27272A', label: '边框', usage: 'card / input border' },
  { name: '--input', light: '#E4E4E7', dark: '#27272A', label: '输入框边框', usage: 'input border' },
  { name: '--ring', light: '#575CE9', dark: '#7B7DF7', label: '焦点环', usage: 'focus ring' },
]

const fontSizes = [
  { size: '2.25rem', token: 'text-4xl', px: '36px', label: '页面标题' },
  { size: '1.875rem', token: 'text-3xl', px: '30px', label: '区域标题' },
  { size: '1.5rem', token: 'text-2xl', px: '24px', label: '卡片标题' },
  { size: '1.25rem', token: 'text-xl', px: '20px', label: '大正文' },
  { size: '1rem', token: 'text-base', px: '16px', label: '正文' },
  { size: '0.875rem', token: 'text-sm', px: '14px', label: '列表/卡片' },
  { size: '0.75rem', token: 'text-xs', px: '12px', label: '标签/时间戳' },
]

const spacingTokens = [
  { token: 'p-1 / gap-1', value: '4px', label: '极小' },
  { token: 'p-2 / gap-2', value: '8px', label: '基础' },
  { token: 'p-3 / gap-3', value: '12px', label: '卡片内边距' },
  { token: 'p-4 / gap-4', value: '16px', label: '标准间距' },
  { token: 'p-6 / gap-6', value: '24px', label: '区块间距' },
  { token: 'p-8 / gap-8', value: '32px', label: '大区块' },
]

const radiusTokens = [
  { token: 'rounded-sm', value: '6px', label: '小按钮/标签' },
  { token: 'rounded-md', value: '8px', label: '标准按钮/输入' },
  { token: 'rounded-lg', value: '12px', label: '卡片/弹窗' },
  { token: 'rounded-xl', value: '16px', label: '大卡片/容器' },
]

const shadowTokens = [
  { token: 'shadow-xs', value: '0 1px 2px rgb(0 0 0 / 0.05)', label: '微阴影' },
  { token: 'shadow-sm', value: '0 1px 3px rgb(0 0 0 / 0.1)', label: '卡片默认' },
  { token: 'shadow-md', value: '0 4px 6px rgb(0 0 0 / 0.1)', label: '悬浮面板' },
  { token: 'shadow-lg', value: '0 10px 15px rgb(0 0 0 / 0.1)', label: '弹窗/抽屉' },
  { token: 'shadow-xl', value: '0 20px 25px rgb(0 0 0 / 0.1)', label: '模态框' },
]

const transitionTokens = [
  { token: '--transition-fast', value: '150ms', label: 'hover等快速反馈' },
  { token: '--transition-base', value: '200ms', label: '标准过渡' },
  { token: '--transition-slow', value: '300ms', label: '展开/收起' },
]

// ── CodeBlock component ────────────────────────
function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="relative group mt-3 rounded-lg border border-border bg-[#0F1117] overflow-hidden">
      {label && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#161B22] border-b border-border/30">
          <span className="text-[11px] text-muted-foreground font-mono">{label}</span>
          <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      )}
      <pre className="p-3 text-[12px] font-mono text-[#E6EDF3] overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ── Section wrapper ────────────────────────────
function Section({ id, title, description, children, className }: any) {
  return (
    <section id={id} className={cn('scroll-mt-20', className)}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-primary" />
          {title}
        </h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </section>
  )
}

// ── Copyable color swatch ──────────────────────
function ColorSwatch({ name, value, label, usage }: { name: string; value: string; label: string; usage: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(name)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <button onClick={handleCopy} className="group text-left w-full">
      <div
        className="w-full aspect-square rounded-xl border border-border/60 shadow-xs transition-transform group-hover:scale-[1.03] group-hover:shadow-sm relative"
        style={{ backgroundColor: value }}
      >
        {copied && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
            <Check className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-[11px] font-mono text-muted-foreground truncate">{name}</p>
        <p className="text-[11px] text-foreground font-medium truncate">{label}</p>
        <p className="text-[10px] text-muted-foreground">{usage}</p>
      </div>
    </button>
  )
}

// ── Main page ──────────────────────────────────
export default function DesignSystemPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sliderVal, setSliderVal] = useState([50])
  const [switchOn, setSwitchOn] = useState(true)

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileNavOpen(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#575CE9] to-[#7B7DF7] flex items-center justify-center">
            <Palette className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-base font-bold text-foreground hidden sm:block">AI应用广场 · 设计系统</h1>
          <div className="flex-1" />
          <Badge variant="secondary" className="text-[10px]">V1.3</Badge>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar nav */}
        <aside
          className={cn(
            'fixed lg:sticky top-14 left-0 z-30 w-[240px] h-[calc(100vh-3.5rem)] bg-background border-r border-border',
            'transition-transform duration-200',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <ScrollArea className="h-full">
            <nav className="p-3 space-y-0.5">
              {sections.map((s) => {
                const Icon = s.icon
                const isActive = activeSection === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : '')} />
                    {s.label}
                    {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
                  </button>
                )
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* Mobile overlay */}
        {mobileNavOpen && <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setMobileNavOpen(false)} />}

        {/* Content */}
        <main className="flex-1 min-w-0 px-4 py-8 lg:px-8 space-y-16">
          {/* ── Overview ──────────────────────── */}
          <Section id="overview" title="设计系统概览" description="AI应用广场 V1.3 的设计令牌与组件规范，确保所有页面视觉一致">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Card className="border-primary/20">
                <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">14 个语义化颜色令牌</h3>
                  <p className="text-xs text-muted-foreground">基于 CSS Variables，支持自动深色模式</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Component className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">shadcn/ui 组件库</h3>
                  <p className="text-xs text-muted-foreground">new-york 风格，基于 Radix UI 的无头组件</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Ruler className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">8px 间距网格</h3>
                  <p className="text-xs text-muted-foreground">所有间距为 4px 倍数，严格对齐</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 border-border/60">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  路径别名
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <code className="text-primary">@/components/ui</code>
                    <span className="text-muted-foreground">→ shadcn 组件</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <code className="text-primary">@/lib/utils</code>
                    <span className="text-muted-foreground">→ cn() 工具</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <code className="text-primary">@/lib/mock-data</code>
                    <span className="text-muted-foreground">→ Mock 数据</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <code className="text-primary">@/hooks</code>
                    <span className="text-muted-foreground">→ 自定义 Hooks</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CodeBlock
              label="cn() 使用示例"
              code={`import { cn } from '@/lib/utils'

// ✅ 正确 - 合并类名
cn('base-class', condition && 'conditional-class', 'hover:bg-accent')

// ✅ 正确 - 使用语义化变量
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">`}
            />
          </Section>

          {/* ── Colors ────────────────────────── */}
          <Section id="colors" title="颜色系统" description="使用 CSS Variables 语义化颜色令牌，严禁硬编码颜色">
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3 mt-4">
              {colorTokens.map((c) => (
                <ColorSwatch key={c.name} name={c.name} value={c.light} label={c.label} usage={c.usage} />
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-border/60">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold mb-3">浅色模式</h4>
                  <div className="rounded-xl p-6 bg-white border border-border space-y-3">
                    <div className="h-8 rounded-md bg-[#575CE9] flex items-center px-3">
                      <span className="text-sm text-white font-medium">Primary</span>
                    </div>
                    <div className="h-8 rounded-md bg-[#F7F8FB] border border-[#E4E4E7] flex items-center px-3">
                      <span className="text-sm text-[#18181B]">Secondary</span>
                    </div>
                    <div className="h-8 rounded-md bg-[#F4F4F8] flex items-center px-3">
                      <span className="text-sm text-[#18181B]">Accent</span>
                    </div>
                    <div className="h-8 rounded-md bg-[#EF4444] flex items-center px-3">
                      <span className="text-sm text-white">Destructive</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold mb-3">深色模式</h4>
                  <div className="rounded-xl p-6 bg-[#09090B] border border-[#27272A] space-y-3">
                    <div className="h-8 rounded-md bg-[#7B7DF7] flex items-center px-3">
                      <span className="text-sm text-[#09090B] font-medium">Primary</span>
                    </div>
                    <div className="h-8 rounded-md bg-[#27272A] border border-[#3F3F46] flex items-center px-3">
                      <span className="text-sm text-[#FAFAFA]">Secondary</span>
                    </div>
                    <div className="h-8 rounded-md bg-[#27272A] flex items-center px-3">
                      <span className="text-sm text-[#FAFAFA]">Accent</span>
                    </div>
                    <div className="h-8 rounded-md bg-[#7F1D1D] flex items-center px-3">
                      <span className="text-sm text-white">Destructive</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <CodeBlock
              label="颜色使用规范"
              code={`// ✅ 正确 - 使用语义化变量
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">

// ❌ 错误 - 硬编码颜色
<div className="bg-white text-black">
  <button className="bg-blue-500">`}
            />
          </Section>

          {/* ── Typography ────────────────────── */}
          <Section id="typography" title="排版系统" description="Inter 正文 + JetBrains Mono 代码">
            <Card className="mt-4 border-border/60">
              <CardContent className="p-5 space-y-5">
                {fontSizes.map((f) => (
                  <div key={f.token} className="flex items-center gap-4">
                    <div className="w-20 text-right">
                      <code className="text-[11px] text-muted-foreground font-mono">{f.token}</code>
                    </div>
                    <div className="flex-1">
                      <span className={cn(f.token, 'text-foreground block')} style={{ fontSize: f.size }}>
                        {f.label} · {f.px}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-border/60">
                <CardContent className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">正文示例</h4>
                  <p className="text-base text-foreground leading-relaxed">
                    这是标准正文文本。AI应用广场是一个聚合多模型能力的平台，用户可以通过对话方式与各种AI模型进行交互。
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">代码示例</h4>
                  <code className="text-sm font-mono text-foreground block leading-relaxed">
                    const model = await getModelById('gpt-4')<br />
                    const response = await model.chat(messages)
                  </code>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── Spacing & Radius ──────────────── */}
          <Section id="spacing" title="间距 & 圆角" description="基于 4px 的间距网格系统">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">间距令牌</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {spacingTokens.map((s) => (
                    <div key={s.token} className="flex items-center gap-3">
                      <code className="text-[11px] text-muted-foreground font-mono w-28">{s.token}</code>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="bg-primary/30 rounded" style={{ width: s.value, height: '16px' }} />
                        <span className="text-xs text-muted-foreground">{s.value} · {s.label}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">圆角令牌</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {radiusTokens.map((r) => (
                    <div key={r.token} className="flex items-center gap-3">
                      <code className="text-[11px] text-muted-foreground font-mono w-28">{r.token}</code>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="bg-primary/30 border border-primary/20" style={{ width: '48px', height: '48px', borderRadius: r.value }} />
                        <span className="text-xs text-muted-foreground">{r.value} · {r.label}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── Shadows & Transitions ─────────── */}
          <Section id="shadows" title="阴影 & 过渡" description="统一的阴影层级和过渡动画">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {shadowTokens.map((s) => (
                <Card key={s.token} className={cn(s.token, 'border-border/60')}
                  style={{ boxShadow: s.value.replace(/shadow-xs/g, '').replace(/shadow-sm/g, '').replace(/shadow-md/g, '').replace(/shadow-lg/g, '').replace(/shadow-xl/g, '') }}>
                  <CardContent className="p-4">
                    <code className="text-[11px] text-muted-foreground font-mono block">{s.token}</code>
                    <p className="text-xs text-foreground mt-1">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {transitionTokens.map((t) => (
                <Card key={t.token} className="border-border/60">
                  <CardContent className="p-4">
                    <code className="text-[11px] text-muted-foreground font-mono block">{t.token}</code>
                    <p className="text-xs text-foreground mt-1">{t.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          {/* ── Buttons ───────────────────────── */}
          <Section id="buttons" title="按钮组件" description="shadcn/ui Button 的所有变体和尺寸">
            <Card className="mt-4 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">变体 (Variants)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
                <CodeBlock
                  label="使用方式"
                  code={`<Button variant="default">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="outline">描边按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="destructive">危险按钮</Button>
<Button variant="link">链接样式</Button>`}
                />
              </CardContent>
            </Card>
            <Card className="mt-4 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">尺寸 (Sizes)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Sparkles className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
            <Card className="mt-4 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">状态</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button>正常</Button>
                <Button disabled>禁用</Button>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">错误</Button>
                <Button className="opacity-50">加载中...</Button>
              </CardContent>
            </Card>
          </Section>

          {/* ── Forms ─────────────────────────── */}
          <Section id="forms" title="表单控件" description="输入框、选择器、开关、滑块等表单组件">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">输入框</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="标准输入框" />
                  <Input placeholder="禁用状态" disabled />
                  <Input placeholder="错误状态" aria-invalid />
                  <Textarea placeholder="文本域..." className="min-h-[80px]" />
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">选择器 & 标签</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select defaultValue="option1">
                    <SelectTrigger>
                      <SelectValue placeholder="选择一项" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">选项一</SelectItem>
                      <SelectItem value="option2">选项二</SelectItem>
                      <SelectItem value="option3">选项三</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">开关 & 复选框</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">自动保存</Label>
                    <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">夜间模式</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm">同意用户协议</Label>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">滑块</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">音量</Label>
                      <span className="text-xs text-muted-foreground font-mono">{sliderVal}%</span>
                    </div>
                    <Slider value={sliderVal} onValueChange={setSliderVal} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">语速</Label>
                      <span className="text-xs text-muted-foreground font-mono">1.5x</span>
                    </div>
                    <Slider defaultValue={[75]} max={200} step={10} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── Feedback ──────────────────────── */}
          <Section id="feedback" title="反馈 & 数据展示" description="加载状态、骨架屏、空状态">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">骨架屏</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-[60%]" />
                      <Skeleton className="h-2 w-[40%]" />
                    </div>
                  </div>
                  <Skeleton className="h-24 w-full rounded-lg" />
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">空状态</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">没有找到结果</p>
                  <p className="text-xs text-muted-foreground mt-1">请尝试其他关键词</p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">处理中状态</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-sm text-foreground">AI处理中...</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[65%] rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">65%</p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">错误提示</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>文件大小不能超过 100MB</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 text-emerald-600 text-sm">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>文件上传成功</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── Overlay ───────────────────────── */}
          <Section id="overlay" title="弹窗 & 浮层" description="Dialog / Sheet / Drawer 组件">
            <Card className="mt-4 border-border/60">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">打开弹窗</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>确认操作</DialogTitle>
                        <DialogDescription>您确定要执行此操作吗？此操作不可撤销。</DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline">取消</Button>
                        <Button>确认</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={() => alert('Sheet / Drawer 示例，实际项目按需引入')}>
                    Sheet 抽屉
                  </Button>
                </div>
                <CodeBlock
                  label="Dialog 使用方式"
                  code={`<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">打开弹窗</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>标题</DialogTitle>
      <DialogDescription>描述文字</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`}
                />
              </CardContent>
            </Card>
          </Section>

          {/* ── Agent Patterns ────────────────── */}
          <Section id="agent-patterns" title="智能体卡片模式" description="V1.3 智能体列表页和详情页的统一视觉模式">
            <Card className="mt-4 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">智能体列表卡片</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Demo agent card */}
                  <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0">
                          <Smartphone className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground truncate">语音转文字</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">上传音频或视频，AI精准识别语音并转成文字</p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Zap className="h-3 w-3" />20 智点</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />30秒-2分钟</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5"><Smartphone className="h-2.5 w-2.5 mr-0.5" />会议记录</Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5"><Headphones className="h-2.5 w-2.5 mr-0.5" />播客转稿</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shrink-0">
                          <Headphones className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground truncate">文字转语音</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">输入文案，选择音色，一键生成自然流畅的语音</p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Zap className="h-3 w-3" />15 智点</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />10-30秒</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5"><BookOpen className="h-2.5 w-2.5 mr-0.5" />有声小说</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">智能体详情页结构</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mock agent detail */}
                <div className="max-w-[720px] mx-auto border border-border rounded-xl p-4 bg-background">
                  <div className="flex items-center gap-3 mb-4">
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg font-bold text-foreground truncate">语音转文字</h1>
                      <p className="text-xs text-muted-foreground truncate">上传音频或视频，AI精准识别语音并转成文字</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" />20 智点</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />30秒-2分钟</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h2 className="text-sm font-medium text-muted-foreground mb-2">🎯 适用场景</h2>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: Smartphone, title: '会议记录', desc: '会议录音一键转会议纪要' },
                        { icon: Headphones, title: '播客转稿', desc: '播客音频转成公众号文章' },
                        { icon: BookOpen, title: '课堂笔记', desc: '课堂录音转结构化笔记' },
                      ].map((s, i) => (
                        <Card key={i} className="border-border/60">
                          <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <s.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <h3 className="text-xs font-semibold text-foreground">{s.title}</h3>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">{s.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <Card className="mb-3 border-border/60">
                    <CardContent className="p-4">
                      <Label className="text-sm font-medium mb-2 block">上传文件 (.mp3、.wav) 最大 500 MB</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <span className="text-sm text-muted-foreground">拖拽文件到此处，或点击上传</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="mb-3 border-border/60">
                    <CardContent className="p-4 space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">⚙️ 参数设置</h3>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">识别语言</Label>
                        <span className="text-xs text-muted-foreground">中文</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">自动添加标点</Label>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                  <Button className="w-full"><Sparkles className="h-4 w-4 mr-2" />开始处理</Button>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* ── Validation ────────────────────── */}
          <Section id="validation" title="表单校验规范" description="使用 react-hook-form + zod 进行表单校验">
            <Card className="mt-4 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">校验规则示例</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  label="zod schema 示例"
                  code={`import { z } from 'zod'

const agentSchema = z.object({
  // 文件上传校验
  file: z.instanceof(File).optional()
    .refine(file => !file || file.size <= 100 * 1024 * 1024, 
      '文件大小不能超过100MB'),
  
  // 文本输入校验
  text: z.string()
    .min(1, '请输入内容')
    .max(5000, '内容不能超过5000字'),
  
  // 参数校验
  language: z.enum(['zh', 'en', 'ja']),
  quality: z.enum(['low', 'medium', 'high']),
})

// 在组件中使用
const form = useForm({
  resolver: zodResolver(schema),
})`}
                />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">邮箱校验</Label>
                    <Input placeholder="请输入邮箱" value="invalid-email" aria-invalid />
                    <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />请输入有效的邮箱地址</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">必填校验</Label>
                    <Input placeholder="请输入名称" value="" />
                    <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />名称至少需要2个字符</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Footer */}
          <div className="pt-8 pb-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              AI应用广场设计系统 V1.3 · 基于 shadcn/ui (new-york) + Tailwind CSS
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
