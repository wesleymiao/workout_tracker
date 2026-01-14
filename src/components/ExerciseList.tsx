import { useLocalStorage } from '@/hooks/use-local-storage'
import { useState, useEffect } from 'react'
import { Workout, Exercise, EquipmentExercise, CardioExercise, SwimExercise, RunExercise, isStrengthWorkout, isSwimWorkout, isRunWorkout } from '@/lib/types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Plus, CheckCircle, PencilSimple, Warning } from '@phosphor-icons/react'
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

  const handleAddExercise = () => {
    setEditingExercise(null)
    setShowAddDialog(true)
  }

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise)
    if (exercise.type === 'equipment' || exercise.type === 'cardio') {
      setExerciseType(exercise.type)
    }
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
    const exercise = workout.exercises.find(e => e.id === exerciseId)
    const wasCompleted = exercise?.completed
    
    onUpdateWorkout({
      ...workout,
      exercises: workout.exercises.map(e =>
        e.id === exerciseId ? { ...e, completed: !e.completed } : e
      )
    })

    // Show toast for completion
    if (!wasCompleted) {
      toast.success('Target achieved! 🎯', {
        duration: 2000,
      })
    }
  }

  // Render for Swim workouts
  if (isSwimWorkout(workout.type)) {
    const swimExercise = workout.exercises.find(e => e.type === 'swim') as SwimExercise | undefined
    
    if (!swimExercise) {
      return (
        <div className="space-y-4">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No swim target set.</p>
            <p className="text-sm text-muted-foreground mt-1">Please go back and set a distance target.</p>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <SwimExerciseCard
          exercise={swimExercise}
          onToggleComplete={() => handleToggleComplete(swimExercise.id)}
          onUpdateDistance={(distance) => {
            onUpdateWorkout({
              ...workout,
              exercises: workout.exercises.map(e =>
                e.id === swimExercise.id ? { ...e, actualDistance: distance } : e
              )
            })
          }}
        />
      </div>
    )
  }

  // Render for Run workouts
  if (isRunWorkout(workout.type)) {
    const runExercise = workout.exercises.find(e => e.type === 'run') as RunExercise | undefined
    
    if (!runExercise) {
      return (
        <div className="space-y-4">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No run target set.</p>
            <p className="text-sm text-muted-foreground mt-1">Please go back and set a distance target.</p>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <RunExerciseCard
          exercise={runExercise}
          onToggleComplete={() => handleToggleComplete(runExercise.id)}
          onUpdateDistance={(distance) => {
            onUpdateWorkout({
              ...workout,
              exercises: workout.exercises.map(e =>
                e.id === runExercise.id ? { ...e, actualDistance: distance } : e
              )
            })
          }}
        />
      </div>
    )
  }

  // Render for Strength workouts (Pull/Push/Legs)
  return (
    <div className="space-y-4">
      {workout.exercises.length === 0 ? (
        <Card className="p-6 text-center space-y-4">
          <p className="text-muted-foreground">No exercises yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {workout.exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              onToggleComplete={() => handleToggleComplete(exercise.id)}
              onEdit={() => handleEditExercise(exercise)}
              onUpdateSets={exercise.type === 'equipment' ? (completedSets) => {
                const isNowComplete = completedSets >= (exercise as EquipmentExercise).targetSets
                onUpdateWorkout({
                  ...workout,
                  exercises: workout.exercises.map(e =>
                    e.id === exercise.id
                      ? { ...e, completedSets, completed: isNowComplete }
                      : e
                  )
                })
              } : undefined}
            />
          ))}
        </div>
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
  index: number
  onToggleComplete: () => void
  onEdit: () => void
  onUpdateSets?: (completedSets: number) => void
}

function ExerciseCard({ exercise, index, onToggleComplete, onEdit, onUpdateSets }: ExerciseCardProps) {
  const [isFlickering, setIsFlickering] = useState(false)

  // Flickering animation for uncompleted items after delay
  useEffect(() => {
    if (exercise.completed) {
      setIsFlickering(false)
      return
    }

    // Start flickering after 5 seconds for better UX feedback
    const timer = setTimeout(() => {
      setIsFlickering(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [exercise.completed, exercise.id])

  return (
    <Card
      className={`p-4 transition-all ${
        exercise.completed
          ? 'bg-accent/10 border-accent animate-completion-pulse'
          : isFlickering
          ? 'animate-flicker border-amber-500/50'
          : 'hover:border-primary'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleComplete}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            exercise.completed
              ? 'bg-accent border-accent scale-110'
              : isFlickering
              ? 'border-amber-500'
              : 'border-muted-foreground hover:border-accent'
          }`}
        >
          {exercise.completed && <CheckCircle size={20} weight="fill" className="text-accent-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{exercise.name}</h3>
            {isFlickering && !exercise.completed && (
              <Warning size={16} className="text-amber-500 animate-pulse" />
            )}
          </div>

          {exercise.type === 'equipment' ? (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-mono">{exercise.weight}kg</span>
                {' × '}
                <span className="font-mono">{exercise.targetReps}</span> reps
                {' × '}
                <span className="font-mono">{exercise.targetSets}</span> sets
              </p>
              
              {/* Set tracking buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground mr-1">Sets:</span>
                {Array.from({ length: exercise.targetSets }).map((_, setIndex) => {
                  const isSetCompleted = setIndex < exercise.completedSets
                  return (
                    <button
                      key={setIndex}
                      onClick={() => {
                        if (onUpdateSets) {
                          // Toggle: if clicking completed set, go back to that point; if clicking next, advance
                          const newCompletedSets = isSetCompleted ? setIndex : setIndex + 1
                          onUpdateSets(newCompletedSets)
                        }
                      }}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all ${
                        isSetCompleted
                          ? 'bg-accent border-accent text-accent-foreground scale-105'
                          : 'border-muted-foreground/50 text-muted-foreground hover:border-accent hover:scale-105'
                      }`}
                    >
                      {isSetCompleted ? <CheckCircle size={18} weight="fill" /> : setIndex + 1}
                    </button>
                  )
                })}
              </div>
              
              {exercise.completedSets > 0 && (
                <p className="text-xs text-accent">
                  {exercise.completedSets} / {exercise.targetSets} sets done
                  {exercise.completedSets >= exercise.targetSets && ' ✓'}
                </p>
              )}
            </div>
          ) : exercise.type === 'cardio' ? (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                Target: <span className="font-mono">{exercise.targetDistance}km</span>
              </p>
            </div>
          ) : null}
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

// Swim Exercise Card
interface SwimExerciseCardProps {
  exercise: SwimExercise
  onToggleComplete: () => void
  onUpdateDistance: (distance: number) => void
}

function SwimExerciseCard({ exercise, onToggleComplete, onUpdateDistance }: SwimExerciseCardProps) {
  const [actualDistance, setActualDistance] = useState(exercise.actualDistance?.toString() ?? '')

  return (
    <Card className={`p-6 ${exercise.completed ? 'bg-accent/10 border-accent animate-completion-pulse' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Swim Session</h3>
            <p className="text-sm text-muted-foreground">
              Target: <span className="font-mono text-lg">{exercise.targetDistance}m</span>
            </p>
          </div>
          <button
            onClick={onToggleComplete}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              exercise.completed
                ? 'bg-accent border-accent scale-110'
                : 'border-muted-foreground hover:border-accent'
            }`}
          >
            {exercise.completed && <CheckCircle size={32} weight="fill" className="text-accent-foreground" />}
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="actual-swim-distance">Actual Distance (m)</Label>
          <Input
            id="actual-swim-distance"
            type="number"
            placeholder="Enter actual distance"
            value={actualDistance}
            onChange={(e) => {
              setActualDistance(e.target.value)
              const dist = parseFloat(e.target.value)
              if (!isNaN(dist)) onUpdateDistance(dist)
            }}
            className="font-mono text-lg h-12"
          />
        </div>
      </div>
    </Card>
  )
}

// Run Exercise Card
interface RunExerciseCardProps {
  exercise: RunExercise
  onToggleComplete: () => void
  onUpdateDistance: (distance: number) => void
}

function RunExerciseCard({ exercise, onToggleComplete, onUpdateDistance }: RunExerciseCardProps) {
  const [actualDistance, setActualDistance] = useState(exercise.actualDistance?.toString() ?? '')

  return (
    <Card className={`p-6 ${exercise.completed ? 'bg-accent/10 border-accent animate-completion-pulse' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Run Session</h3>
            <p className="text-sm text-muted-foreground">
              Target: <span className="font-mono text-lg">{exercise.targetDistance}km</span>
            </p>
          </div>
          <button
            onClick={onToggleComplete}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              exercise.completed
                ? 'bg-accent border-accent scale-110'
                : 'border-muted-foreground hover:border-accent'
            }`}
          >
            {exercise.completed && <CheckCircle size={32} weight="fill" className="text-accent-foreground" />}
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="actual-run-distance">Actual Distance (km)</Label>
          <Input
            id="actual-run-distance"
            type="number"
            step="0.1"
            placeholder="Enter actual distance"
            value={actualDistance}
            onChange={(e) => {
              setActualDistance(e.target.value)
              const dist = parseFloat(e.target.value)
              if (!isNaN(dist)) onUpdateDistance(dist)
            }}
            className="font-mono text-lg h-12"
          />
        </div>
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

  // Prepopulate form when dialog opens or exercise changes
  useEffect(() => {
    if (open) {
      if (exercise) {
        setType(exercise.type === 'equipment' ? 'equipment' : 'cardio')
        setName(exercise.name)
        if (exercise.type === 'equipment') {
          setWeight(exercise.weight.toString())
          setTargetReps(exercise.targetReps.toString())
          setTargetSets(exercise.targetSets.toString())
          setTargetDistance('')
        } else if (exercise.type === 'cardio') {
          setTargetDistance(exercise.targetDistance.toString())
          setWeight('')
          setTargetReps('')
          setTargetSets('')
        }
      } else {
        setType(exerciseType)
        setName('')
        setWeight('')
        setTargetReps('')
        setTargetSets('')
        setTargetDistance('')
      }
    }
  }, [open, exercise, exerciseType])

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
      if (!targetDistance) {
        toast.error('Please enter a target distance')
        return
      }

      const newExercise: CardioExercise = {
        id: exercise?.id ?? generateId(),
        type: 'cardio',
        name: name.trim(),
        targetDistance: parseFloat(targetDistance),
        completed: exercise?.completed ?? false
      }

      onSave(newExercise)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <SelectItem value="equipment">Equipment (Weight/Reps/Sets)</SelectItem>
                <SelectItem value="cardio">Cardio (Distance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-name">Exercise Name</Label>
            <Input
              id="exercise-name"
              placeholder={type === 'equipment' ? 'e.g. Bench Press' : 'e.g. Treadmill'}
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
