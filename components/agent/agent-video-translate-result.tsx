'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================
// Types
// ============================================================

interface Subtitle {
  id: number
  startTime: string
  endTime: string
  text: string
  translatedText: string
}

interface VideoTranslateResult {
  subtitles: Subtitle[]
  videoUrl: string
  originalFile: File
}

interface VideoTranslateResultPageProps {
  result: VideoTranslateResult
  onBackToEdit?: () => void
}

// ============================================================
// Subtitle List Component
// ============================================================

function SubtitleList({ subtitles }: { subtitles: Subtitle[] }) {
  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {subtitles.map((subtitle) => (
        <div 
          key={subtitle.id} 
          className="p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/30 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              {subtitle.startTime} - {subtitle.endTime}
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">原文：</p>
              <p className="text-sm font-medium">{subtitle.text}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">翻译：</p>
              <p className="text-sm font-medium text-primary">{subtitle.translatedText}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// Video Player Component
// ============================================================

function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
          <span className="text-xs text-muted-foreground w-10 text-right">
            {duration ? formatTime(duration) : '00:00'}
          </span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setVolume(volume > 0 ? 0 : 1)}
              className="h-8 w-8 p-0"
            >
              {volume > 0 ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value)
                setVolume(newVolume)
                if (videoRef.current) {
                  videoRef.current.volume = newVolume
                }
              }}
              className="w-20 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>

          <Button size="sm" className="h-8">
            <Download className="h-4 w-4 mr-2" />
            导出视频
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function VideoTranslateResultPage({ 
  result, 
  onBackToEdit 
}: VideoTranslateResultPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">翻译结果</h2>
        {onBackToEdit && (
          <Button variant="outline" onClick={onBackToEdit}>
            返回编辑
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Subtitles */}
        <div className="space-y-3">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">字幕翻译结果</h3>
              <SubtitleList subtitles={result.subtitles} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Video Player */}
        <div className="space-y-3">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">视频预览</h3>
              <VideoPlayer videoUrl={result.videoUrl} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}