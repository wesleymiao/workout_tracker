import { useLocalStorage } from '@/hooks/use-local-storage'
import { Plus, Fire, CheckCircle } from '@phosphor-icons/react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { useState } from 'react'
import { Workout, ChecklistItem } from '@/lib/types'
import { getDaysSinceLastWorkout, getWorkoutStreak, generateId } from '@/lib/workout-utils'
import ChecklistDialog from '../ChecklistDialog'

interface HomeScreenProps {
  onStartWorkout: () => void
}

export default function HomeScreen({ onStartWorkout }: HomeScreenProps) {
  const [workouts] = useLocalStorage<Workout[]>('workouts', [])
  const [checklistItems, setChecklistItems] = useLocalStorage<string[]>('checklist-items', [
    'Water bottle',
    'Towel',
    'Headphones'
  ])
  const [activeWorkout] = useLocalStorage<Workout | null>('active-workout', null)
  const [showChecklist, setShowChecklist] = useState(false)

  const daysSince = getDaysSinceLastWorkout(workouts)
  const streak = getWorkoutStreak(workouts)
  const reminderThreshold = 3
  const showReminder = daysSince >= reminderThreshold

  const recentWorkouts = workouts
    .filter(w => w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const handleStartWorkout = () => {
    if (checklistItems.length > 0) {
      setShowChecklist(true)
    } else {
      onStartWorkout()
    }
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
            <Button onClick={onStartWorkout}>
              Continue
            </Button>
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
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {workout.exercises.length} exercises
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {workout.exercises.filter(e => e.completed).length} completed
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Button
        onClick={handleStartWorkout}
        className="w-full h-14 text-lg font-semibold"
        size="lg"
      >
        <Plus size={24} weight="bold" />
        Start Workout
      </Button>

      <ChecklistDialog
        open={showChecklist}
        onOpenChange={setShowChecklist}
        checklistItems={checklistItems}
        onContinue={onStartWorkout}
      />
    </div>
  )
}
