'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Zap } from 'lucide-react'
import type { Agent, AgentCategory } from '@/lib/mock-data'

/* ──────────────── 按分类的主题色映射 ──────────────── */
const categoryAccent: Record<AgentCategory, {
  border: string
  glow: string
  badge: string
  overlay: string
}> = {
  video: {
    border: 'hover:border-cyan-400/40',
    glow: 'hover:shadow-cyan-500/25 hover:shadow-2xl',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    overlay: 'from-cyan-950/70 via-cyan-950/30',
  },
  audio: {
    border: 'hover:border-purple-400/40',
    glow: 'hover:shadow-purple-500/25 hover:shadow-2xl',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    overlay: 'from-purple-950/70 via-purple-950/30',
  },
  copywriting: {
    border: 'hover:border-fuchsia-400/40',
    glow: 'hover:shadow-fuchsia-500/25 hover:shadow-2xl',
    badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
    overlay: 'from-fuchsia-950/70 via-fuchsia-950/30',
  },
  image: {
    border: 'hover:border-amber-400/40',
    glow: 'hover:shadow-amber-500/25 hover:shadow-2xl',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    overlay: 'from-amber-950/70 via-amber-950/30',
  },
}

const categoryLabel: Record<AgentCategory, string> = {
  video: '视频',
  audio: '音频',
  copywriting: '文案',
  image: '图片',
}

/* ──────────────── Props ──────────────── */
interface AgentGridCardProps {
  agent: Agent
  onClick?: (agentId: string) => void
}

/* ──────────────── 组件 ──────────────── */
export function AgentGridCard({ agent, onClick }: AgentGridCardProps) {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const accent = categoryAccent[agent.category]

  /* —— 视频悬停播放 —— */
  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    if (agent.coverVideo && videoRef.current) {
      // 延迟播放避免快速划过时频繁触发
      hoverTimer.current = setTimeout(() => {
        videoRef.current?.play().catch(() => {})
      }, 300)
    }
  }, [agent.coverVideo])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [])

  const handleClick = () => onClick?.(agent.id)

  return (
    <article
      className={cn(
        /* 基础容器 */
        'group relative flex flex-col cursor-pointer rounded-2xl overflow-hidden',
        'bg-card border border-border/60',
        /* 入场动画 */
        'animate-in fade-in slide-in-from-bottom-4 duration-500',
        /* Hover 过渡 */
        'transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1.2)]',
        'hover:-translate-y-1.5',
        accent.border,
        accent.glow,
        /* 暗色模式微调 */
        'dark:border-slate-800/70 dark:bg-slate-900/80',
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ═══════ 封面图区域 ═══════ */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl bg-muted dark:bg-slate-800">
        {/* 静态封面图 */}
        {agent.coverImage && !imgError ? (
          <img
            src={agent.coverImage}
            alt={agent.name}
            loading="lazy"
            className={cn(
              'absolute inset-0 w-full h-full object-cover rounded-t-2xl',
              'transition-transform duration-[800ms] ease-[cubic-bezier(0.25,0.8,0.25,1)]',
              'group-hover:scale-110',
            )}
            onError={() => setImgError(true)}
          />
        ) : (
          /* 无图回退：渐变色块 + 脉冲光斑 */
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br', agent.gradient,
          )}>
            <div
              className={cn(
                'absolute -bottom-8 -right-8 h-32 w-32 rounded-full',
                'bg-white/10 blur-2xl',
                'group-hover:scale-150 transition-transform duration-700',
              )}
            />
          </div>
        )}

        {/* 视频层（仅在提供 coverVideo 且 hover 时显示） */}
        {agent.coverVideo && (
          <video
            ref={videoRef}
            src={agent.coverVideo}
            muted
            loop
            playsInline
            className={cn(
              'absolute inset-0 w-full h-full object-cover',
              'transition-opacity duration-500',
              hovered ? 'opacity-100' : 'opacity-0',
            )}
          />
        )}

        {/* 底部渐变遮罩 —— 保证文字可读 */}
        <div className={cn(
          'absolute inset-x-0 bottom-0 h-3/4',
          'bg-gradient-to-t', accent.overlay, 'to-transparent',
          'pointer-events-none',
        )} />

        {/* —— 右上角智点标签 —— */}
        <div className="absolute top-3 right-3 z-10">
          <span className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full',
            'text-[11px] font-semibold tracking-tight',
            'backdrop-blur-xl',
            'bg-black/45 text-white border border-white/15',
            'shadow-lg shadow-black/20',
            'transition-all duration-300',
            'group-hover:bg-black/60 group-hover:border-white/25',
          )}>
            <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400/30" />
            {agent.costPoints}
          </span>
        </div>

        {/* —— 左上角分类标签 —— */}
        <div className="absolute top-3 left-3 z-10">
          <span className={cn(
            'text-[10px] uppercase tracking-[0.15em] font-medium',
            'px-2 py-0.5 rounded-full',
            'backdrop-blur-md bg-white/10 text-white/80 border border-white/10',
            'transition-all duration-300',
            'group-hover:bg-white/15 group-hover:text-white',
          )}>
            {categoryLabel[agent.category]}
          </span>
        </div>
      </div>

      {/* ═══════ 文本内容 ═══════ */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        <h3 className={cn(
          'font-semibold text-sm leading-tight',
          'text-foreground line-clamp-1',
          'transition-colors duration-300',
          'group-hover:text-primary dark:group-hover:text-sky-300',
        )}>
          {agent.name}
        </h3>
        <p className={cn(
          'text-xs leading-relaxed',
          'text-muted-foreground/80 line-clamp-2',
          'flex-1',
        )}>
          {agent.description}
        </p>
      </div>

      {/* —— 底部装饰条（hover 时出现） —— */}
      <div className={cn(
        'absolute bottom-0 inset-x-0 h-[2px]',
        'bg-gradient-to-r from-transparent via-primary/60 to-transparent',
        'scale-x-0 group-hover:scale-x-100',
        'transition-transform duration-500 ease-out',
        'origin-center',
      )} />
    </article>
  )
}
