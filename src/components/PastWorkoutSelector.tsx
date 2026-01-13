import { Workout, WorkoutType } from '@/lib/types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Clock, CheckCircle } from '@phosphor-icons/react'

interface PastWorkoutSelectorProps {
  workouts: Workout[]
  workoutType: WorkoutType
  onSelect: (workout: Workout) => void
  onSkip: () => void
}

export default function PastWorkoutSelector({
  workouts,
  workoutType,
  onSelect,
  onSkip
}: PastWorkoutSelectorProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getExerciseSummary = (workout: Workout) => {
    const exerciseCount = workout.exercises.length
    const completedCount = workout.exercises.filter(e => e.completed).length
    return `${completedCount}/${exerciseCount} exercises completed`
  }

  const getWorkoutDetails = (workout: Workout) => {
    if (workout.type === 'Swim') {
      const swimExercise = workout.exercises.find(e => e.type === 'swim')
      if (swimExercise && 'targetDistance' in swimExercise) {
        return `${swimExercise.targetDistance}m target`
      }
    } else if (workout.type === 'Run (Gym)' || workout.type === 'Run (Outdoor)') {
      const runExercise = workout.exercises.find(e => e.type === 'run')
      if (runExercise && 'targetDistance' in runExercise) {
        return `${runExercise.targetDistance}km target`
      }
    } else {
      // Strength workouts
      const equipmentCount = workout.exercises.filter(e => e.type === 'equipment').length
      const cardioCount = workout.exercises.filter(e => e.type === 'cardio').length
      const parts: string[] = []
      if (equipmentCount > 0) parts.push(`${equipmentCount} equipment`)
      if (cardioCount > 0) parts.push(`${cardioCount} cardio`)
      return parts.join(', ')
    }
    return ''
  }

  if (workouts.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-2">No previous {workoutType} workouts found</p>
          <p className="text-sm text-muted-foreground">Start fresh and create your first workout!</p>
        </Card>
        <Button onClick={onSkip} className="w-full h-12" size="lg">
          Start Fresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Load from Previous Workout</h3>
        <p className="text-sm text-muted-foreground">
          Select a workout to pre-populate your targets, or start fresh
        </p>
      </div>

      <div className="space-y-3">
        {workouts.map((workout, index) => (
          <Card
            key={workout.id}
            className="p-4 cursor-pointer transition-all hover:scale-[1.02] hover:border-accent active:scale-[0.98]"
            onClick={() => onSelect(workout)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock size={20} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{formatDate(workout.date)}</h4>
                  {index === 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                      Most Recent
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getWorkoutDetails(workout)}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <CheckCircle size={14} />
                  <span>{getExerciseSummary(workout)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={onSkip} variant="outline" className="w-full h-12" size="lg">
        Start Fresh
      </Button>
    </div>
  )
}
