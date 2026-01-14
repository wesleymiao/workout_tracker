import { Workout, isSwimWorkout, isRunWorkout } from '@/lib/types'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { CheckCircle, Fire, Confetti, Trophy } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'

interface WorkoutSummaryProps {
  workout: Workout
  onClose: () => void
}

export default function WorkoutSummary({ workout, onClose }: WorkoutSummaryProps) {
  const [showConfetti, setShowConfetti] = useState(true)
  const completedExercises = workout.exercises.filter(e => e.completed).length
  const allCompleted = completedExercises === workout.exercises.length && workout.exercises.length > 0

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const getDistanceSummary = () => {
    if (isSwimWorkout(workout.type)) {
      const swimEx = workout.exercises.find(e => e.type === 'swim')
      if (swimEx && 'actualDistance' in swimEx && swimEx.actualDistance) {
        return `${swimEx.actualDistance}m swam`
      }
      if (swimEx && 'targetDistance' in swimEx) {
        return `${swimEx.targetDistance}m target`
      }
    }
    if (isRunWorkout(workout.type)) {
      const runEx = workout.exercises.find(e => e.type === 'run')
      if (runEx && 'actualDistance' in runEx && runEx.actualDistance) {
        return `${runEx.actualDistance}km ran`
      }
      if (runEx && 'targetDistance' in runEx) {
        return `${runEx.targetDistance}km target`
      }
    }
    return null
  }

  const distanceSummary = getDistanceSummary()

  return (
    <div className="p-4 space-y-6 min-h-screen flex flex-col relative overflow-hidden">
      {/* Confetti animation */}
      {showConfetti && allCompleted && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-start justify-center pt-20">
          <div className="animate-confetti-fall">
            <Confetti size={80} className="text-accent" weight="fill" />
          </div>
        </div>
      )}

      <div className="flex-1 space-y-6">
        <div className="text-center space-y-2 py-6">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${allCompleted ? 'bg-accent/20 animate-bounce-slow' : 'bg-accent/20'}`}>
            {allCompleted ? (
              <Trophy size={40} weight="fill" className="text-accent" />
            ) : (
              <CheckCircle size={40} weight="fill" className="text-accent" />
            )}
          </div>
          <h1 className="text-[32px] font-bold tracking-tight leading-[1.1]">
            {allCompleted ? 'Perfect Workout!' : 'Workout Complete!'}
          </h1>
          <p className="text-muted-foreground">
            {allCompleted 
              ? `Amazing! You crushed your ${workout.type} session!` 
              : `Great job on your ${workout.type} session`
            }
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-accent" weight="fill" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-3xl font-bold font-mono">{completedExercises}</p>
            <p className="text-xs text-muted-foreground">of {workout.exercises.length}</p>
          </Card>
        </div>

        {distanceSummary && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Fire size={20} className="text-accent" weight="fill" />
              <span className="text-sm text-muted-foreground">Distance</span>
            </div>
            <p className="text-3xl font-bold font-mono">{distanceSummary}</p>
          </Card>
        )}

        {workout.exercises.length > 0 && workout.exercises.some(e => e.type === 'equipment' || e.type === 'cardio') && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Exercises Completed</h2>
            <div className="space-y-2">
              {workout.exercises
                .filter(e => e.completed && (e.type === 'equipment' || e.type === 'cardio'))
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
                            {exercise.targetDistance}km
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

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
