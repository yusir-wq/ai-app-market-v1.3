'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AgentParameter } from '@/lib/mock-data'

interface AgentParamsFormProps {
  parameters: AgentParameter[]
  values: Record<string, any>
  onChange: (id: string, value: any) => void
}

export function AgentParamsForm({ parameters, values, onChange }: AgentParamsFormProps) {
  if (parameters.length === 0) return null

  return (
    <Card className="w-full mb-4">
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          ⚙️ 参数设置
        </h3>
        <div className="space-y-5">
          {parameters.map((param) => (
            <ParamField
              key={param.id}
              param={param}
              value={values[param.id]}
              onChange={(value) => onChange(param.id, value)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ParamField({
  param,
  value,
  onChange,
}: {
  param: AgentParameter
  value: any
  onChange: (value: any) => void
}) {
  switch (param.type) {
    case 'select':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{param.label}</Label>
          <Select value={String(value)} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'switch':
      return (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{param.label}</Label>
          <Switch checked={!!value} onCheckedChange={onChange} />
        </div>
      )

    case 'slider':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{param.label}</Label>
            <span className="text-xs text-muted-foreground font-mono">
              {value}
              {param.label === '音量' && '%'}
              {param.label === '语速' && 'x'}
            </span>
          </div>
          <Slider
            value={[Number(value)]}
            onValueChange={(vals) => onChange(vals[0])}
            min={param.min}
            max={param.max}
            step={param.step}
            className="w-full"
          />
        </div>
      )

    case 'text':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{param.label}</Label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )

    default:
      return null
  }
}
