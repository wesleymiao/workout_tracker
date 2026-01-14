import { useLocalStorage } from '@/hooks/use-local-storage'
import { Plus, Fire, CheckCircle, Trash, ClockCounterClockwise } from '@phosphor-icons/react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useState } from 'react'
import { Workout, WorkoutType, isSwimWorkout, isRunWorkout } from '@/lib/types'
import { getDaysSinceLastWorkout, getWorkoutStreak } from '@/lib/workout-utils'
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

export default function HomeScreen({ onStartWorkout }: HomeScreenProps) {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('workouts', [])
  const [activeWorkout, setActiveWorkout] = useLocalStorage<Workout | null>('active-workout', null)
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null)
  const [showDeleteActiveDialog, setShowDeleteActiveDialog] = useState(false)

  const daysSince = getDaysSinceLastWorkout(workouts)
  const streak = getWorkoutStreak(workouts)
  const reminderThreshold = 3
  const showReminder = daysSince >= reminderThreshold

  const recentWorkouts = workouts
    .filter(w => w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

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

  return (
    <div className="p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-[32px] font-bold tracking-tight leading-[1.1]">
          Workout Tracker
        </h1>
        <p className="text-muted-foreground">Track your progress, achieve your goals</p>
      </header>

      {showReminder && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="flex items-start gap-3">
            <Fire size={24} className="text-destructive flex-shrink-0 mt-0.5" weight="fill" />
            <div>
              <h3 className="font-semibold text-foreground">Keep your streak alive!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                It's been {daysSince} days since your last workout. Time to get back at it!
              </p>
            </div>
          </div>
        </Card>
      )}

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
          <p className="text-3xl font-bold font-mono">
            {workouts.filter(w => w.completed).length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">workouts</p>
        </Card>
      </div>

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
            recentWorkouts.map(workout => (
              <Card key={workout.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{workout.type}</h3>
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
            ))
          )}
        </div>
      </div>

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
