import { useLocalStorage } from '@/hooks/use-local-storage'
import { Plus, ClockCounterClockwise, Trash, CaretLeft, CaretRight, Warning, Fire } from '@phosphor-icons/react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useState, useMemo } from 'react'
import { Workout, WorkoutType, isSwimWorkout, isRunWorkout } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

interface HomeScreenProps {
  onStartWorkout: (isPastWorkout?: boolean) => void
}

const getWorkoutTypeTextColor = (type: WorkoutType): string => {
  switch (type) {
    case 'Pull':
      return 'text-blue-400'
    case 'Push':
      return 'text-red-400'
    case 'Legs':
      return 'text-green-400'
    case 'Swim':
      return 'text-cyan-400'
    case 'Run (Gym)':
      return 'text-orange-400'
    case 'Run (Outdoor)':
      return 'text-purple-400'
  }
}

const formatWorkoutLabel = (workout: Workout): string => {
  if (workout.type === 'Swim') {
    const swimEx = workout.exercises.find(e => e.type === 'swim')
    if (swimEx && 'actualDistance' in swimEx && swimEx.actualDistance) {
      return `Swim: ${swimEx.actualDistance}m`
    }
    if (swimEx && 'targetDistance' in swimEx) {
      return `Swim: ${swimEx.targetDistance}m`
    }
    return 'Swim'
  }
  
  if (workout.type === 'Run (Gym)' || workout.type === 'Run (Outdoor)') {
    const runEx = workout.exercises.find(e => e.type === 'run')
    if (runEx && 'actualDistance' in runEx && runEx.actualDistance) {
      return `Run: ${runEx.actualDistance}km`
    }
    if (runEx && 'targetDistance' in runEx) {
      return `Run: ${runEx.targetDistance}km`
    }
    return 'Run'
  }
  
  return workout.type
}

export default function HomeScreen({ onStartWorkout }: HomeScreenProps) {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('workouts', [])
  const [activeWorkout, setActiveWorkout] = useLocalStorage<Workout | null>('active-workout', null)
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null)
  const [showDeleteActiveDialog, setShowDeleteActiveDialog] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const completedWorkouts = useMemo(() => {
    return workouts.filter(w => w.completed)
  }, [workouts])

  // Calculate days since last workout for reminder
  const daysSinceLastWorkout = useMemo(() => {
    if (completedWorkouts.length === 0) return null
    
    const sortedWorkouts = [...completedWorkouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    const lastWorkoutDate = new Date(sortedWorkouts[0].date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    lastWorkoutDate.setHours(0, 0, 0, 0)
    
    const diffTime = today.getTime() - lastWorkoutDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }, [completedWorkouts])

  // Get reminder message based on days since last workout
  const getWorkoutReminder = () => {
    if (daysSinceLastWorkout === null) {
      return {
        show: true,
        type: 'welcome' as const,
        message: "Welcome! Start your fitness journey today! 💪",
        subMessage: "Your first workout awaits"
      }
    }
    
    if (daysSinceLastWorkout === 0) {
      return {
        show: true,
        type: 'great' as const,
        message: "Great job! You worked out today! 🔥",
        subMessage: "Keep up the amazing work"
      }
    }
    
    if (daysSinceLastWorkout === 1) {
      return {
        show: false,
        type: 'ok' as const,
        message: "",
        subMessage: ""
      }
    }
    
    if (daysSinceLastWorkout <= 3) {
      return {
        show: true,
        type: 'gentle' as const,
        message: `${daysSinceLastWorkout} days since your last workout`,
        subMessage: "Ready to get back on track?"
      }
    }
    
    if (daysSinceLastWorkout <= 7) {
      return {
        show: true,
        type: 'warning' as const,
        message: `You haven't worked out for ${daysSinceLastWorkout} days`,
        subMessage: "Don't break your momentum!"
      }
    }
    
    return {
      show: true,
      type: 'urgent' as const,
      message: `It's been ${daysSinceLastWorkout} days since your last workout!`,
      subMessage: "Every journey starts with a single step. Let's go!"
    }
  }

  const workoutReminder = getWorkoutReminder()

  const recentWorkouts = workouts
    .filter(w => w.completed && new Date(w.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getDaysSinceLastWorkoutOfType = (workoutType: WorkoutType, currentWorkoutDate: string): number | null => {
    const currentDate = new Date(currentWorkoutDate)
    const previousWorkouts = workouts
      .filter(w => w.completed && w.type === workoutType && new Date(w.date) < currentDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    if (previousWorkouts.length === 0) return null
    
    const lastWorkoutDate = new Date(previousWorkouts[0].date)
    const diffTime = currentDate.getTime() - lastWorkoutDate.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleStartWorkout = () => {
    onStartWorkout(false)
  }

  const handleLogPastWorkout = () => {
    onStartWorkout(true)
  }

  const handleDeleteWorkout = (workout: Workout) => {
    setWorkoutToDelete(workout)
  }

  const confirmDeleteWorkout = () => {
    if (workoutToDelete) {
      setWorkouts(prev => prev.filter(w => w.id !== workoutToDelete.id))
      setWorkoutToDelete(null)
    }
  }

  const handleDeleteActiveWorkout = () => {
    setShowDeleteActiveDialog(true)
  }

  const confirmDeleteActiveWorkout = () => {
    setActiveWorkout(null)
    setShowDeleteActiveDialog(false)
  }

  const getExerciseInfo = (workout: Workout) => {
    if (isSwimWorkout(workout.type)) {
      const swimEx = workout.exercises.find(e => e.type === 'swim')
      if (swimEx && 'targetDistance' in swimEx) {
        return `${swimEx.targetDistance}m`
      }
    } else if (isRunWorkout(workout.type)) {
      const runEx = workout.exercises.find(e => e.type === 'run')
      if (runEx && 'targetDistance' in runEx) {
        return `${runEx.targetDistance}km`
      }
    }
    return `${workout.exercises.length} exercises`
  }

  // Calendar logic
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startPadding = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: Array<{ date: Date | null; workouts: Workout[] }> = []

    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, workouts: [] })
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
        workouts: dayWorkouts
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

  return (
    <div className="p-4 pt-12 space-y-6 pb-24">
      {/* Workout Reminder Banner */}
      {workoutReminder.show && (
        <Card className={`p-4 border-l-4 ${
          workoutReminder.type === 'great' 
            ? 'bg-green-500/10 border-l-green-500' 
            : workoutReminder.type === 'welcome'
            ? 'bg-accent/10 border-l-accent'
            : workoutReminder.type === 'gentle'
            ? 'bg-yellow-500/10 border-l-yellow-500'
            : workoutReminder.type === 'warning'
            ? 'bg-orange-500/10 border-l-orange-500'
            : 'bg-red-500/10 border-l-red-500'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 ${
              workoutReminder.type === 'great' 
                ? 'text-green-500' 
                : workoutReminder.type === 'welcome'
                ? 'text-accent'
                : workoutReminder.type === 'gentle'
                ? 'text-yellow-500'
                : workoutReminder.type === 'warning'
                ? 'text-orange-500'
                : 'text-red-500'
            }`}>
              {workoutReminder.type === 'great' || workoutReminder.type === 'welcome' ? (
                <Fire size={24} weight="fill" />
              ) : (
                <Warning size={24} weight="fill" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${
                workoutReminder.type === 'great' 
                  ? 'text-green-500' 
                  : workoutReminder.type === 'welcome'
                  ? 'text-accent'
                  : workoutReminder.type === 'gentle'
                  ? 'text-yellow-500'
                  : workoutReminder.type === 'warning'
                  ? 'text-orange-500'
                  : 'text-red-500'
              }`}>
                {workoutReminder.message}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {workoutReminder.subMessage}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Resume Workout Card (if in-progress) */}
      {activeWorkout && !activeWorkout.completed && (
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Resume Workout</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {activeWorkout.type} • In progress
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteActiveWorkout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash size={20} />
              </Button>
              <Button onClick={onStartWorkout}>
                Continue
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Start Workout / Log Past Workout Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleStartWorkout}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          <Plus size={24} weight="bold" />
          Start Workout
        </Button>

        <Button
          onClick={handleLogPastWorkout}
          variant="outline"
          className="w-full h-12"
          size="lg"
        >
          <ClockCounterClockwise size={20} weight="bold" />
          Log Past Workout
        </Button>
      </div>

      {/* Workout Activity Calendar */}
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
                return <div key={i} className="min-h-[60px]" />
              }

              const isToday = day.date.toDateString() === new Date().toDateString()
              const hasWorkouts = day.workouts.length > 0

              return (
                <div
                  key={i}
                  className={`min-h-[60px] rounded-md flex flex-col items-center p-1 transition-all ${
                    !hasWorkouts
                      ? 'bg-secondary/30 text-muted-foreground'
                      : 'bg-accent/10 text-accent-foreground border border-accent/30'
                  } ${
                    isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                  }`}
                >
                  <div className="text-[10px] font-medium mb-0.5">{day.date.getDate()}</div>
                  {hasWorkouts && (
                    <div className="flex flex-col items-center gap-0.5 w-full overflow-hidden">
                      {day.workouts.slice(0, 2).map((workout, idx) => (
                        <div
                          key={idx}
                          className={`text-[10px] font-medium leading-tight text-center truncate w-full px-0.5 ${getWorkoutTypeTextColor(workout.type)}`}
                          title={formatWorkoutLabel(workout)}
                        >
                          {formatWorkoutLabel(workout)}
                        </div>
                      ))}
                      {day.workouts.length > 2 && (
                        <div className="text-[8px] text-muted-foreground">+{day.workouts.length - 2}</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Recent Workouts */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Workouts</h2>
        <div className="space-y-3">
          {recentWorkouts.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No workouts yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start your first workout to see it here
              </p>
            </Card>
          ) : (
            recentWorkouts.map(workout => {
              const daysSinceType = getDaysSinceLastWorkoutOfType(workout.type, workout.date)
              return (
                <Card key={workout.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{workout.type}</h3>
                        {daysSinceType !== null && (
                          <span className="text-xs text-muted-foreground">(+{daysSinceType} days)</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {getExerciseInfo(workout)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {workout.exercises.filter(e => e.completed).length} completed
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteWorkout(workout)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Delete Completed Workout Confirmation */}
      <AlertDialog open={!!workoutToDelete} onOpenChange={(open) => !open && setWorkoutToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your {workoutToDelete?.type} workout from{' '}
              {workoutToDelete && new Date(workoutToDelete.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWorkout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete In-Progress Workout Confirmation */}
      <AlertDialog open={showDeleteActiveDialog} onOpenChange={setShowDeleteActiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard In-Progress Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard your current {activeWorkout?.type} workout. All progress will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteActiveWorkout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
