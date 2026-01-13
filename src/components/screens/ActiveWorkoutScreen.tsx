import { useLocalStorage } from '@/hooks/use-local-storage'
import { useState, useEffect, useRef } from 'react'
import { Workout, WorkoutType, Exercise, isStrengthWorkout, isSwimWorkout, isRunWorkout } from '@/lib/types'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import WorkoutTypeSelector from '../WorkoutTypeSelector'
import ExerciseList from '../ExerciseList'
import WorkoutSummary from '../WorkoutSummary'
import ChecklistDialog from '../ChecklistDialog'
import PastWorkoutSelector from '../PastWorkoutSelector'
import ExercisePlanner from '../ExercisePlanner'
import { CheckCircle, Timer, Fire, Confetti } from '@phosphor-icons/react'
import { formatDuration, getLast5WorkoutsOfType, generateId } from '@/lib/workout-utils'
import { Progress } from '../ui/progress'

type WorkoutPhase = 'type-selection' | 'checklist' | 'past-workout-selection' | 'planning' | 'active'

export default function ActiveWorkoutScreen() {
  const [activeWorkout, setActiveWorkout] = useLocalStorage<Workout | null>('active-workout', null)
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('workouts', [])
  const [checklistItems] = useLocalStorage<string[]>('checklist-items', ['Water bottle', 'Towel', 'Headphones'])
  const [showSummary, setShowSummary] = useState(false)
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null)
  const [phase, setPhase] = useState<WorkoutPhase>(() => {
    // Determine initial phase based on stored active workout
    // This runs only once on mount
    const stored = localStorage.getItem('active-workout')
    if (stored) {
      try {
        const workout = JSON.parse(stored)
        if (workout && !workout.completed) {
          return 'active'
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return 'type-selection'
  })

  const handleSelectWorkoutType = (type: WorkoutType) => {
    setSelectedType(type)
    // Show checklist if there are items
    if (checklistItems.length > 0) {
      setPhase('checklist')
    } else {
      // Skip to past workout selection
      setPhase('past-workout-selection')
    }
  }

  const handleChecklistContinue = () => {
    setPhase('past-workout-selection')
  }

  const handleSelectPastWorkout = (pastWorkout: Workout) => {
    if (!selectedType) return

    // Clone exercises from past workout with new IDs
    const exercisesWithNewIds = pastWorkout.exercises.map(e => ({
      ...e,
      id: generateId(),
      completed: false,
      completedSets: e.type === 'equipment' ? 0 : undefined,
      actualWeight: undefined,
      actualReps: undefined,
      actualDistance: undefined
    })) as Exercise[]

    const newWorkout: Workout = {
      id: Date.now().toString(),
      type: selectedType,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      exercises: exercisesWithNewIds,
      completed: false
    }
    setActiveWorkout(newWorkout)
    setPhase('planning')
  }

  const handleSkipPastWorkout = () => {
    if (!selectedType) return

    const newWorkout: Workout = {
      id: Date.now().toString(),
      type: selectedType,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      exercises: [],
      completed: false
    }
    setActiveWorkout(newWorkout)
    setPhase('planning')
  }

  const handleStartWorkout = () => {
    setPhase('active')
  }

  const handleFinishWorkout = () => {
    if (!activeWorkout) return

    const completedWorkout: Workout = {
      ...activeWorkout,
      endTime: new Date().toISOString(),
      completed: true
    }

    setWorkouts((currentWorkouts) => [...currentWorkouts, completedWorkout])
    setShowSummary(true)
  }

  const handleCloseSummary = () => {
    setShowSummary(false)
    setActiveWorkout(null)
    setSelectedType(null)
    setPhase('type-selection')
  }

  const handleCancelWorkout = () => {
    setActiveWorkout(null)
    setSelectedType(null)
    setPhase('type-selection')
  }

  if (showSummary && activeWorkout) {
    return (
      <WorkoutSummary
        workout={activeWorkout}
        onClose={handleCloseSummary}
      />
    )
  }

  // Phase: Type Selection
  if (phase === 'type-selection') {
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

  // Phase: Checklist
  if (phase === 'checklist' && selectedType) {
    return (
      <>
        <div className="p-4">
          <header className="mb-6">
            <h1 className="text-[32px] font-bold tracking-tight leading-[1.1]">
              {selectedType}
            </h1>
            <p className="text-muted-foreground mt-2">Pre-workout checklist</p>
          </header>
        </div>
        <ChecklistDialog
          open={true}
          onOpenChange={() => {}}
          checklistItems={checklistItems}
          workoutType={selectedType}
          onContinue={handleChecklistContinue}
        />
      </>
    )
  }

  // Phase: Past Workout Selection
  if (phase === 'past-workout-selection' && selectedType) {
    const pastWorkouts = getLast5WorkoutsOfType(workouts, selectedType)

    return (
      <div className="p-4">
        <header className="mb-6">
          <h1 className="text-[32px] font-bold tracking-tight leading-[1.1]">
            {selectedType}
          </h1>
          <p className="text-muted-foreground mt-2">Choose a previous workout or start fresh</p>
        </header>

        <PastWorkoutSelector
          workouts={pastWorkouts}
          workoutType={selectedType}
          onSelect={handleSelectPastWorkout}
          onSkip={handleSkipPastWorkout}
        />
      </div>
    )
  }

  // Phase: Planning
  if (phase === 'planning' && activeWorkout) {
    return (
      <div className="p-4">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{activeWorkout.type}</h1>
              <p className="text-muted-foreground mt-1">Plan your exercises</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancelWorkout}>
              Cancel
            </Button>
          </div>
        </header>

        <ExercisePlanner
          workout={activeWorkout}
          onUpdateWorkout={setActiveWorkout}
          onStartWorkout={handleStartWorkout}
        />
      </div>
    )
  }

  // Phase: Active Workout
  if (phase === 'active' && activeWorkout) {
    return (
      <ActiveWorkoutView
        workout={activeWorkout}
        onUpdateWorkout={setActiveWorkout}
        onFinish={handleFinishWorkout}
        onCancel={handleCancelWorkout}
      />
    )
  }

  return null
}

interface ActiveWorkoutViewProps {
  workout: Workout
  onUpdateWorkout: (workout: Workout) => void
  onFinish: () => void
  onCancel: () => void
}

function ActiveWorkoutView({ workout, onUpdateWorkout, onFinish, onCancel }: ActiveWorkoutViewProps) {
  const [elapsedTime, setElapsedTime] = useState('0:00')
  const [showConfetti, setShowConfetti] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const prevCompletedRef = useRef(0)

  // Timer effect
  useEffect(() => {
    const updateTimer = () => {
      const start = new Date(workout.startTime)
      const now = new Date()
      const diffMs = now.getTime() - start.getTime()
      const mins = Math.floor(diffMs / 60000)
      const secs = Math.floor((diffMs % 60000) / 1000)
      setElapsedTime(`${mins}:${secs.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [workout.startTime])

  // Track completions for animations
  const completedCount = workout.exercises.filter(e => e.completed).length
  const totalCount = workout.exercises.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Check for completion animations
  useEffect(() => {
    if (completedCount > prevCompletedRef.current) {
      // Increment streak
      setStreakCount(prev => prev + 1)
      
      // Show confetti if all exercises completed
      if (completedCount === totalCount && totalCount > 0) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    }
    prevCompletedRef.current = completedCount
  }, [completedCount, totalCount])

  return (
    <div className="flex flex-col h-full">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-confetti-burst">
            <Confetti size={64} className="text-accent" weight="fill" />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{workout.type}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Timer size={18} />
              <span className="font-mono">{elapsedTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={18} />
              <span>{completedCount} / {totalCount}</span>
            </div>
            {streakCount >= 2 && (
              <div className="flex items-center gap-1.5 animate-pulse">
                <Fire size={18} className="text-orange-500" weight="fill" />
                <span className="text-orange-500 font-semibold">{streakCount} streak!</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar with glow effect when near completion */}
        <div className="space-y-1">
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${progressPercentage >= 80 ? 'animate-glow' : ''}`}
          />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(progressPercentage)}% complete
          </p>
        </div>

        {totalCount > 0 && completedCount === totalCount && (
          <Button
            onClick={onFinish}
            className="w-full h-12 animate-pulse-glow"
            size="lg"
          >
            <CheckCircle size={24} weight="bold" />
            Finish Workout
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto p-4">
        <ExerciseList
          workout={workout}
          onUpdateWorkout={onUpdateWorkout}
        />

        {totalCount > 0 && completedCount < totalCount && (
          <div className="mt-6">
            <Button
              onClick={onFinish}
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
