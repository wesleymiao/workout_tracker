import { useLocalStorage } from '@/hooks/use-local-storage'
import { Workout, WorkoutType } from '@/lib/types'
import { Card } from '../ui/card'
import { CheckCircle, Fire, Barbell, TrendUp, CaretLeft, CaretRight, Clock } from '@phosphor-icons/react'
import { getWorkoutStreak, getTotalVolume } from '@/lib/workout-utils'
import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type Duration = '7' | '30' | '90' | '365' | 'all'

const getWorkoutTypeColor = (type: WorkoutType): string => {
  switch (type) {
    case 'Pull':
      return 'bg-blue-500'
    case 'Push':
      return 'bg-red-500'
    case 'Legs':
      return 'bg-green-500'
    case 'Swim':
      return 'bg-cyan-500'
    case 'Run (Gym)':
      return 'bg-orange-500'
    case 'Run (Outdoor)':
      return 'bg-purple-500'
  }
}

export default function StatsScreen() {
  const [workouts] = useLocalStorage<Workout[]>('workouts', [])
  const [duration, setDuration] = useState<Duration>('30')
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const completedWorkouts = useMemo(() => {
    return workouts.filter(w => w.completed)
  }, [workouts])

  const filteredWorkouts = useMemo(() => {
    const now = new Date()
    let cutoffDate = new Date()

    switch (duration) {
      case '7':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90':
        cutoffDate.setDate(now.getDate() - 90)
        break
      case '365':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        return completedWorkouts
    }

    return completedWorkouts.filter(w => new Date(w.date) >= cutoffDate)
  }, [completedWorkouts, duration])

  const streak = getWorkoutStreak(completedWorkouts)

  const workoutsByType = useMemo(() => {
    const counts: Record<WorkoutType, number> = {
      'Pull': 0,
      'Push': 0,
      'Legs': 0,
      'Swim': 0,
      'Run (Gym)': 0,
      'Run (Outdoor)': 0
    }

    filteredWorkouts.forEach(w => {
      counts[w.type]++
    })

    return counts
  }, [filteredWorkouts])

  const totalVolume = useMemo(() => {
    return filteredWorkouts.reduce((sum, workout) => sum + getTotalVolume(workout), 0)
  }, [filteredWorkouts])

  const averageWorkoutDuration = useMemo(() => {
    const workoutsWithDuration = filteredWorkouts.filter(w => w.endTime)
    if (workoutsWithDuration.length === 0) return 0

    const totalMinutes = workoutsWithDuration.reduce((sum, w) => {
      const start = new Date(w.startTime)
      const end = new Date(w.endTime!)
      return sum + (end.getTime() - start.getTime()) / 60000
    }, 0)

    return Math.round(totalMinutes / workoutsWithDuration.length)
  }, [filteredWorkouts])

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startPadding = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: Array<{ date: Date | null; workoutCount: number; workoutTypes: WorkoutType[] }> = []

    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, workoutCount: 0, workoutTypes: [] })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayWorkouts = completedWorkouts.filter(w => {
        const workoutDate = new Date(w.date)
        return workoutDate.getFullYear() === year &&
               workoutDate.getMonth() === month &&
               workoutDate.getDate() === day
      })

      days.push({
        date,
        workoutCount: dayWorkouts.length,
        workoutTypes: dayWorkouts.map(w => w.type)
      })
    }

    return days
  }, [currentMonth, completedWorkouts])

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }

  const durationLabel = duration === 'all' ? 'All Time' : 
                        duration === '7' ? 'Past 7 Days' :
                        duration === '30' ? 'Past Month' :
                        duration === '90' ? 'Past 3 Months' :
                        'Past Year'

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="space-y-2">
        <h1 className="text-[32px] font-bold tracking-tight leading-[1.1]">
          Statistics
        </h1>
        <p className="text-muted-foreground">Track your progress over time</p>
      </header>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Activity Calendar</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
            >
              <CaretLeft size={20} />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {monthLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
            >
              <CaretRight size={20} />
            </Button>
          </div>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (!day.date) {
                return <div key={i} className="aspect-square" />
              }

              const isToday = day.date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={i}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs font-medium transition-all p-0.5 ${
                    day.workoutCount === 0
                      ? 'bg-secondary/30 text-muted-foreground'
                      : 'bg-accent/20 text-accent-foreground border border-accent/30'
                  } ${
                    isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                  }`}
                >
                  <div className="text-[10px] font-medium">{day.date.getDate()}</div>
                  {day.workoutCount > 0 && (
                    <div className="flex flex-wrap gap-[1px] justify-center mt-0.5">
                      {day.workoutTypes.map((type, idx) => (
                        <div
                          key={idx}
                          className={`w-1 h-1 rounded-full ${getWorkoutTypeColor(type)}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Workout Types:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Pull</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Push</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Legs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-muted-foreground">Swim</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">Run (Gym)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">Run (Outdoor)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Performance</h2>
          <Select value={duration} onValueChange={(v) => setDuration(v as Duration)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Past 7 Days</SelectItem>
              <SelectItem value="30">Past Month</SelectItem>
              <SelectItem value="90">Past 3 Months</SelectItem>
              <SelectItem value="365">Past Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Fire size={20} className="text-accent" weight="fill" />
              <span className="text-sm text-muted-foreground">Streak</span>
            </div>
            <p className="text-3xl font-bold font-mono">{streak}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {streak === 1 ? 'day' : 'days'}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-accent" weight="fill" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-3xl font-bold font-mono">{filteredWorkouts.length}</p>
            <p className="text-xs text-muted-foreground mt-1">workouts</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Barbell size={20} className="text-accent" weight="fill" />
              <span className="text-sm text-muted-foreground">Volume</span>
            </div>
            <p className="text-3xl font-bold font-mono">
              {(totalVolume / 1000).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">tons lifted</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} className="text-accent" />
              <span className="text-sm text-muted-foreground">Avg Duration</span>
            </div>
            <p className="text-3xl font-bold font-mono">{averageWorkoutDuration}</p>
            <p className="text-xs text-muted-foreground mt-1">minutes</p>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Workouts by Type <span className="text-sm font-normal text-muted-foreground">({durationLabel})</span>
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(workoutsByType) as [WorkoutType, number][]).map(([type, count]) => (
            <Card key={type} className="p-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">{type}</h3>
              <p className="text-2xl font-bold font-mono">{count}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
