import { useState, useEffect, useMemo } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { HealthMetric, HEALTH_METRIC_LABELS } from '@/lib/types'
import HealthSetup from './HealthSetup'

export default function HealthScreen() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [viewDays, setViewDays] = useState(7)

  useEffect(() => {
    fetch(`/api/health?days=${viewDays}`)
      .then(r => r.json())
      .then(data => {
        setMetrics(data.metrics || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [viewDays])

  // Group metrics by type, get latest value for each
  const latestByType = useMemo(() => {
    const map = new Map<string, HealthMetric>()
    // metrics are already sorted by date desc
    for (const m of metrics) {
      if (!map.has(m.type)) {
        map.set(m.type, m)
      }
    }
    return map
  }, [metrics])

  // Group metrics by date for selected type
  const dailyData = useMemo(() => {
    if (!selectedType) return []
    const filtered = metrics.filter(m => m.type === selectedType)
    // Group by date (YYYY-MM-DD)
    const byDate = new Map<string, HealthMetric[]>()
    for (const m of filtered) {
      const dateKey = m.date.slice(0, 10)
      if (!byDate.has(dateKey)) byDate.set(dateKey, [])
      byDate.get(dateKey)!.push(m)
    }
    // Aggregate: for steps/activeEnergy/walkingDistance sum, for heartRate average
    const result: { date: string; value: number }[] = []
    for (const [date, items] of byDate) {
      let value: number
      if (['steps', 'activeEnergy', 'walkingDistance'].includes(selectedType)) {
        value = items.reduce((s, i) => s + i.value, 0)
      } else {
        value = items.reduce((s, i) => s + i.value, 0) / items.length
      }
      result.push({ date, value: Math.round(value * 10) / 10 })
    }
    return result.sort((a, b) => a.date.localeCompare(b.date))
  }, [metrics, selectedType])

  // Simple bar chart max
  const maxValue = useMemo(() => {
    if (dailyData.length === 0) return 1
    return Math.max(...dailyData.map(d => d.value))
  }, [dailyData])

  if (loading) {
    return (
      <div className="p-4 pt-12 flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  const availableTypes = Array.from(latestByType.keys())

  if (showSetup) {
    return <HealthSetup apiUrl={window.location.origin} onBack={() => setShowSetup(false)} />
  }

  return (
    <div className="p-4 pt-12 space-y-6 pb-24">
      <h1 className="text-2xl font-bold">健康数据</h1>

      {/* Time range selector */}
      <div className="flex gap-2">
        {[7, 14, 30].map(d => (
          <Button
            key={d}
            variant={viewDays === d ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewDays(d)}
          >
            {d}天
          </Button>
        ))}
      </div>

      {/* Setup button - always visible */}
      <Button variant="outline" size="sm" onClick={() => setShowSetup(true)}>
        ⚙️ 同步设置
      </Button>

      {availableTypes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-5xl mb-4">📱</p>
          <p className="text-foreground font-semibold text-lg">暂无健康数据</p>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            通过 iPhone 快捷指令自动同步 Apple Health 数据
          </p>
          <Button className="w-full h-12 text-base" onClick={() => setShowSetup(true)}>
            设置数据同步
          </Button>
        </Card>
      ) : (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-2 gap-3">
            {availableTypes.map(type => {
              const meta = HEALTH_METRIC_LABELS[type] || { label: type, icon: '📊', color: 'text-foreground', unit: '' }
              const latest = latestByType.get(type)!
              const isSelected = selectedType === type
              return (
                <Card
                  key={type}
                  className={`p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-accent' : 'hover:bg-secondary/50'}`}
                  onClick={() => setSelectedType(isSelected ? null : type)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{meta.icon}</span>
                    <span className="text-xs text-muted-foreground">{meta.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${meta.color}`}>
                    {latest.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{meta.unit}</p>
                </Card>
              )
            })}
          </div>

          {/* Detail chart for selected type */}
          {selectedType && dailyData.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-4">
                {(HEALTH_METRIC_LABELS[selectedType] || { icon: '📊', label: selectedType }).icon}{' '}
                {(HEALTH_METRIC_LABELS[selectedType] || { label: selectedType }).label} — 过去{viewDays}天
              </h3>
              <div className="space-y-2">
                {dailyData.map(d => {
                  const pct = (d.value / maxValue) * 100
                  const meta = HEALTH_METRIC_LABELS[selectedType]
                  return (
                    <div key={d.date} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-12 shrink-0">
                        {new Date(d.date + 'T00:00:00').toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                      </span>
                      <div className="flex-1 bg-secondary/30 rounded-full h-5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            meta?.color === 'text-blue-400' ? 'bg-blue-500/60' :
                            meta?.color === 'text-red-400' ? 'bg-red-500/60' :
                            meta?.color === 'text-pink-400' ? 'bg-pink-500/60' :
                            meta?.color === 'text-orange-400' ? 'bg-orange-500/60' :
                            meta?.color === 'text-indigo-400' ? 'bg-indigo-500/60' :
                            meta?.color === 'text-green-400' ? 'bg-green-500/60' :
                            'bg-accent/60'
                          }`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-16 text-right">
                        {d.value.toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
