import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Workout, WorkoutType, Exercise } from '@/lib/types'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import WorkoutTypeSelector from '../WorkoutTypeSelector'
import ExerciseList from '../ExerciseList'
import WorkoutSummary from '../WorkoutSummary'
import { CheckCircle, Timer } from '@phosphor-icons/react'
import { formatDuration } from '@/lib/workout-utils'

export default function ActiveWorkoutScreen() {
  const [activeWorkout, setActiveWorkout] = useKV<Workout | null>('active-workout', null)
  const [workouts, setWorkouts] = useKV<Workout[]>('workouts', [])
  const [showSummary, setShowSummary] = useState(false)

  const handleSelectWorkoutType = (type: WorkoutType) => {
    const newWorkout: Workout = {
      id: Date.now().toString(),
      type,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      exercises: [],
      completed: false
    }
    setActiveWorkout(newWorkout)
  }

  const handleFinishWorkout = () => {
    if (!activeWorkout) return

    const completedWorkout: Workout = {
      ...activeWorkout,
      endTime: new Date().toISOString(),
      completed: true
    }

    setWorkouts(prev => [...(prev ?? []), completedWorkout])
    setShowSummary(true)
  }

  const handleCloseSummary = () => {
    setShowSummary(false)
    setActiveWorkout(null)
  }

  const handleCancelWorkout = () => {
    setActiveWorkout(null)
  }

  if (showSummary && activeWorkout) {
    return (
      <WorkoutSummary
        workout={activeWorkout}
        onClose={handleCloseSummary}
      />
    )
  }

  if (!activeWorkout) {
    return (
      <div className="p-4">
        <header className="mb-6">
          <h1 className="text-[32px] font-bold tracking-tight leading-[1.1]">
            Start Workout
          </h1>
          <p className="text-muted-foreground mt-2">Select your workout type</p>
        </header>

        <WorkoutTypeSelector onSelect={handleSelectWorkoutType} />
      </div>
    )
  }

  const duration = formatDuration(activeWorkout.startTime)
  const completedCount = activeWorkout.exercises.filter(e => e.completed).length
  const totalCount = activeWorkout.exercises.length

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{activeWorkout.type}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelWorkout}
            >
              Cancel
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Timer size={18} />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={18} />
              <span>{completedCount} / {totalCount}</span>
            </div>
          </div>
        </div>

        {totalCount > 0 && completedCount === totalCount && (
          <Button
            onClick={handleFinishWorkout}
            className="w-full h-12"
            size="lg"
          >
            <CheckCircle size={24} weight="bold" />
            Finish Workout
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto p-4">
        <ExerciseList
          workout={activeWorkout}
          onUpdateWorkout={setActiveWorkout}
        />

        {totalCount > 0 && completedCount < totalCount && (
          <div className="mt-6">
            <Button
              onClick={handleFinishWorkout}
              variant="outline"
              className="w-full h-12"
              size="lg"
            >
              Finish Early
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
