import { useLocalStorage } from '@/hooks/use-local-storage'
import { useState } from 'react'
import { Workout, Exercise, EquipmentExercise, CardioExercise } from '@/lib/types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Plus, CheckCircle, PencilSimple } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { generateId, getLastWorkoutOfType } from '@/lib/workout-utils'
import { toast } from 'sonner'

interface ExerciseListProps {
  workout: Workout
  onUpdateWorkout: (workout: Workout) => void
}

export default function ExerciseList({ workout, onUpdateWorkout }: ExerciseListProps) {
  const [workouts] = useLocalStorage<Workout[]>('workouts', [])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [exerciseType, setExerciseType] = useState<'equipment' | 'cardio'>('equipment')
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

  const lastWorkout = getLastWorkoutOfType(workouts, workout.type)

  const handleAddExercise = () => {
    setEditingExercise(null)
    setShowAddDialog(true)
  }

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setExerciseType(exercise.type)
    setShowAddDialog(true)
  }

  const handleSaveExercise = (exercise: Exercise) => {
    if (editingExercise) {
      onUpdateWorkout({
        ...workout,
        exercises: workout.exercises.map(e => e.id === exercise.id ? exercise : e)
      })
    } else {
      onUpdateWorkout({
        ...workout,
        exercises: [...workout.exercises, exercise]
      })
    }
    setShowAddDialog(false)
    setEditingExercise(null)
  }

  const handleToggleComplete = (exerciseId: string) => {
    onUpdateWorkout({
      ...workout,
      exercises: workout.exercises.map(e =>
        e.id === exerciseId ? { ...e, completed: !e.completed } : e
      )
    })
  }

  const handleLoadPreviousWorkout = () => {
    if (!lastWorkout) {
      toast.error('No previous workout found')
      return
    }

    const exercisesWithNewIds = lastWorkout.exercises.map(e => ({
      ...e,
      id: generateId(),
      completed: false,
      actualWeight: undefined,
      actualReps: undefined,
      actualDistance: undefined,
      actualDuration: undefined
    }))

    onUpdateWorkout({
      ...workout,
      exercises: exercisesWithNewIds
    })

    toast.success(`Loaded ${exercisesWithNewIds.length} exercises from previous workout`)
  }

  return (
    <div className="space-y-4">
      {workout.exercises.length === 0 ? (
        <Card className="p-6 text-center space-y-4">
          <p className="text-muted-foreground">No exercises yet</p>
          {lastWorkout && (
            <Button onClick={handleLoadPreviousWorkout} variant="outline">
              Load from Last {workout.type} Workout
            </Button>
          )}
        </Card>
      ) : (
        <>
          {lastWorkout && workout.exercises.length === 0 && (
            <Button onClick={handleLoadPreviousWorkout} variant="outline" className="w-full">
              Load from Last {workout.type} Workout
            </Button>
          )}
          <div className="space-y-3">
            {workout.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onToggleComplete={() => handleToggleComplete(exercise.id)}
                onEdit={() => handleEditExercise(exercise)}
              />
            ))}
          </div>
        </>
      )}

      <Button onClick={handleAddExercise} className="w-full h-12" variant="outline">
        <Plus size={20} weight="bold" />
        Add Exercise
      </Button>

      <ExerciseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        exercise={editingExercise}
        exerciseType={exerciseType}
        onSave={handleSaveExercise}
      />
    </div>
  )
}

interface ExerciseCardProps {
  exercise: Exercise
  onToggleComplete: () => void
  onEdit: () => void
}

function ExerciseCard({ exercise, onToggleComplete, onEdit }: ExerciseCardProps) {
  return (
    <Card
      className={`p-4 transition-all ${
        exercise.completed
          ? 'bg-accent/10 border-accent animate-pulse-scale'
          : 'hover:border-primary'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleComplete}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            exercise.completed
              ? 'bg-accent border-accent'
              : 'border-muted-foreground hover:border-accent'
          }`}
        >
          {exercise.completed && <CheckCircle size={20} weight="fill" className="text-accent-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">{exercise.name}</h3>

          {exercise.type === 'equipment' ? (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-mono">{exercise.weight}kg</span>
                {' × '}
                <span className="font-mono">{exercise.targetReps}</span> reps
                {' × '}
                <span className="font-mono">{exercise.targetSets}</span> sets
              </p>
              {exercise.completed && exercise.completedSets > 0 && (
                <p className="text-sm text-accent">
                  Completed: {exercise.completedSets} / {exercise.targetSets} sets
                </p>
              )}
            </div>
          ) : (
            <div className="mt-2 space-y-1">
              {exercise.targetDistance && (
                <p className="text-sm text-muted-foreground">
                  Target: <span className="font-mono">{exercise.targetDistance}km</span>
                </p>
              )}
              {exercise.targetDuration && (
                <p className="text-sm text-muted-foreground">
                  Target: <span className="font-mono">{exercise.targetDuration}min</span>
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
        >
          <PencilSimple size={18} />
        </Button>
      </div>
    </Card>
  )
}

interface ExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: Exercise | null
  exerciseType: 'equipment' | 'cardio'
  onSave: (exercise: Exercise) => void
}

function ExerciseDialog({ open, onOpenChange, exercise, exerciseType, onSave }: ExerciseDialogProps) {
  const [type, setType] = useState<'equipment' | 'cardio'>(exerciseType)
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [targetReps, setTargetReps] = useState('')
  const [targetSets, setTargetSets] = useState('')
  const [targetDistance, setTargetDistance] = useState('')
  const [targetDuration, setTargetDuration] = useState('')

  const resetForm = () => {
    if (exercise) {
      setType(exercise.type)
      setName(exercise.name)
      if (exercise.type === 'equipment') {
        setWeight(exercise.weight.toString())
        setTargetReps(exercise.targetReps.toString())
        setTargetSets(exercise.targetSets.toString())
      } else {
        setTargetDistance(exercise.targetDistance?.toString() ?? '')
        setTargetDuration(exercise.targetDuration?.toString() ?? '')
      }
    } else {
      setType(exerciseType)
      setName('')
      setWeight('')
      setTargetReps('')
      setTargetSets('')
      setTargetDistance('')
      setTargetDuration('')
    }
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter an exercise name')
      return
    }

    if (type === 'equipment') {
      if (!weight || !targetReps || !targetSets) {
        toast.error('Please fill in all fields')
        return
      }

      const newExercise: EquipmentExercise = {
        id: exercise?.id ?? generateId(),
        type: 'equipment',
        name: name.trim(),
        weight: parseFloat(weight),
        targetReps: parseInt(targetReps),
        targetSets: parseInt(targetSets),
        completedSets: exercise?.type === 'equipment' ? exercise.completedSets : 0,
        completed: exercise?.completed ?? false
      }

      onSave(newExercise)
    } else {
      if (!targetDistance && !targetDuration) {
        toast.error('Please enter either distance or duration')
        return
      }

      const newExercise: CardioExercise = {
        id: exercise?.id ?? generateId(),
        type: 'cardio',
        name: name.trim(),
        targetDistance: targetDistance ? parseFloat(targetDistance) : undefined,
        targetDuration: targetDuration ? parseFloat(targetDuration) : undefined,
        completed: exercise?.completed ?? false
      }

      onSave(newExercise)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (open) resetForm()
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {exercise ? 'Edit Exercise' : 'Add Exercise'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'equipment' | 'cardio')}>
              <SelectTrigger id="exercise-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-name">Exercise Name</Label>
            <Input
              id="exercise-name"
              placeholder="e.g. Bench Press, Running"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {type === 'equipment' ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="100"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    placeholder="12"
                    value={targetReps}
                    onChange={(e) => setTargetReps(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    id="sets"
                    type="number"
                    placeholder="3"
                    value={targetSets}
                    onChange={(e) => setTargetSets(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    placeholder="5.0"
                    value={targetDistance}
                    onChange={(e) => setTargetDistance(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter distance, duration, or both
              </p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} className="w-full h-12" size="lg">
            {exercise ? 'Update' : 'Add'} Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
