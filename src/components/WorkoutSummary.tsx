import { Workout } from '@/lib/types'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { CheckCircle, Timer, Barbell, Fire } from '@phosphor-icons/react'
import { formatDuration, getTotalVolume } from '@/lib/workout-utils'

interface WorkoutSummaryProps {
  workout: Workout
  onClose: () => void
}

export default function WorkoutSummary({ workout, onClose }: WorkoutSummaryProps) {
  const duration = formatDuration(workout.startTime, workout.endTime)
  const completedExercises = workout.exercises.filter(e => e.completed).length
  const totalVolume = getTotalVolume(workout)

  return (
    <div className="p-4 space-y-6 min-h-screen flex flex-col">
      <div className="flex-1 space-y-6">
        <div className="text-center space-y-2 py-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-4">
            <CheckCircle size={40} weight="fill" className="text-accent" />
          </div>
          <h1 className="text-[32px] font-bold tracking-tight leading-[1.1]">
            Workout Complete!
          </h1>
          <p className="text-muted-foreground">
            Great job on your {workout.type} session
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer size={20} className="text-accent" />
              <span className="text-sm text-muted-foreground">Duration</span>
            </div>
            <p className="text-3xl font-bold font-mono">{duration}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-accent" weight="fill" />
              <span className="text-sm text-muted-foreground">Exercises</span>
            </div>
            <p className="text-3xl font-bold font-mono">{completedExercises}</p>
          </Card>
        </div>

        {totalVolume > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Barbell size={20} className="text-accent" weight="fill" />
              <span className="text-sm text-muted-foreground">Total Volume</span>
            </div>
            <p className="text-3xl font-bold font-mono">{totalVolume.toLocaleString()}kg</p>
          </Card>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-3">Exercises Completed</h2>
          <div className="space-y-2">
            {workout.exercises
              .filter(e => e.completed)
              .map((exercise) => (
                <Card key={exercise.id} className="p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} weight="fill" className="text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{exercise.name}</h3>
                      {exercise.type === 'equipment' && (
                        <p className="text-sm text-muted-foreground font-mono">
                          {exercise.weight}kg × {exercise.targetReps} × {exercise.completedSets}
                        </p>
                      )}
                      {exercise.type === 'cardio' && (
                        <p className="text-sm text-muted-foreground font-mono">
                          {exercise.targetDistance && `${exercise.targetDistance}km`}
                          {exercise.targetDistance && exercise.targetDuration && ' • '}
                          {exercise.targetDuration && `${exercise.targetDuration}min`}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {workout.exercises.some(e => !e.completed) && (
          <div>
            <h2 className="text-xl font-semibold mb-3 text-muted-foreground">
              Skipped Exercises
            </h2>
            <div className="space-y-2">
              {workout.exercises
                .filter(e => !e.completed)
                .map((exercise) => (
                  <Card key={exercise.id} className="p-3 opacity-50">
                    <div className="flex items-center gap-2">
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{exercise.name}</h3>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onClose}
        className="w-full h-14 text-lg font-semibold"
        size="lg"
      >
        Done
      </Button>
    </div>
  )
}
