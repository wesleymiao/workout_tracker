import { useState, useEffect } from 'react'
import { Workout, WorkoutType, Exercise, EquipmentExercise, CardioExercise, SwimExercise, RunExercise, isStrengthWorkout, isRunWorkout, isSwimWorkout } from '@/lib/types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, PencilSimple, Trash, Waves, Sneaker, Barbell } from '@phosphor-icons/react'
import { generateId } from '@/lib/workout-utils'
import { toast } from 'sonner'

interface ExercisePlannerProps {
  workout: Workout
  onUpdateWorkout: (workout: Workout) => void
  onStartWorkout: () => void
}

// Helper to get initial swim distance
function getInitialSwimDistance(workout: Workout): string {
  if (isSwimWorkout(workout.type)) {
    const swimEx = workout.exercises.find(e => e.type === 'swim') as SwimExercise | undefined
    if (swimEx) return swimEx.targetDistance.toString()
  }
  return ''
}

// Helper to get initial run distance
function getInitialRunDistance(workout: Workout): string {
  if (isRunWorkout(workout.type)) {
    const runEx = workout.exercises.find(e => e.type === 'run') as RunExercise | undefined
    if (runEx) return runEx.targetDistance.toString()
  }
  return ''
}

export default function ExercisePlanner({ workout, onUpdateWorkout, onStartWorkout }: ExercisePlannerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

  // For Swim workouts - initialize from existing exercise
  const [swimDistance, setSwimDistance] = useState(() => getInitialSwimDistance(workout))

  // For Run workouts - initialize from existing exercise
  const [runDistance, setRunDistance] = useState(() => getInitialRunDistance(workout))

  // Sync state when workout changes (e.g., loading from past workout)
  useEffect(() => {
    if (isSwimWorkout(workout.type)) {
      const swimEx = workout.exercises.find(e => e.type === 'swim') as SwimExercise | undefined
      if (swimEx) setSwimDistance(swimEx.targetDistance.toString())
    } else if (isRunWorkout(workout.type)) {
      const runEx = workout.exercises.find(e => e.type === 'run') as RunExercise | undefined
      if (runEx) setRunDistance(runEx.targetDistance.toString())
    }
  }, [workout.exercises, workout.type])

  const handleSwimDistanceChange = (value: string) => {
    setSwimDistance(value)
    const distance = parseFloat(value)
    if (!isNaN(distance) && distance > 0) {
      const swimExercise: SwimExercise = {
        id: workout.exercises.find(e => e.type === 'swim')?.id ?? generateId(),
        type: 'swim',
        targetDistance: distance,
        completed: false
      }
      onUpdateWorkout({
        ...workout,
        exercises: [swimExercise]
      })
    }
  }

  const handleRunDistanceChange = (value: string) => {
    setRunDistance(value)
    const distance = parseFloat(value)
    if (!isNaN(distance) && distance > 0) {
      const runExercise: RunExercise = {
        id: workout.exercises.find(e => e.type === 'run')?.id ?? generateId(),
        type: 'run',
        targetDistance: distance,
        completed: false
      }
      onUpdateWorkout({
        ...workout,
        exercises: [runExercise]
      })
    }
  }

  const handleAddExercise = () => {
    setEditingExercise(null)
    setShowAddDialog(true)
  }

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setShowAddDialog(true)
  }

  const handleDeleteExercise = (exerciseId: string) => {
    onUpdateWorkout({
      ...workout,
      exercises: workout.exercises.filter(e => e.id !== exerciseId)
    })
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

  const canStartWorkout = () => {
    if (isSwimWorkout(workout.type)) {
      return parseFloat(swimDistance) > 0
    } else if (isRunWorkout(workout.type)) {
      return parseFloat(runDistance) > 0
    } else {
      return workout.exercises.length > 0
    }
  }

  // Render based on workout type
  if (isSwimWorkout(workout.type)) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Waves size={24} className="text-accent" weight="fill" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Swim Target</h3>
              <p className="text-sm text-muted-foreground">Set your distance goal</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="swim-distance">Target Distance (meters)</Label>
            <Input
              id="swim-distance"
              type="number"
              placeholder="e.g. 1000"
              value={swimDistance}
              onChange={(e) => handleSwimDistanceChange(e.target.value)}
              className="text-xl font-mono h-14"
            />
          </div>
        </Card>

        <Button 
          onClick={onStartWorkout}
          disabled={!canStartWorkout()}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          Start Workout
        </Button>
      </div>
    )
  }

  if (isRunWorkout(workout.type)) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sneaker size={24} className="text-accent" weight="fill" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Run Target</h3>
              <p className="text-sm text-muted-foreground">
                {workout.type === 'Run (Gym)' ? 'Treadmill running' : 'Outdoor running'}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="run-distance">Target Distance (km)</Label>
            <Input
              id="run-distance"
              type="number"
              step="0.1"
              placeholder="e.g. 5.0"
              value={runDistance}
              onChange={(e) => handleRunDistanceChange(e.target.value)}
              className="text-xl font-mono h-14"
            />
          </div>
        </Card>

        <Button 
          onClick={onStartWorkout}
          disabled={!canStartWorkout()}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          Start Workout
        </Button>
      </div>
    )
  }

  // Strength workouts (Pull/Push/Legs) - equipment + cardio exercises
  const equipmentExercises = workout.exercises.filter(e => e.type === 'equipment') as EquipmentExercise[]
  const cardioExercises = workout.exercises.filter(e => e.type === 'cardio') as CardioExercise[]

  return (
    <div className="space-y-6">
      {/* Equipment Exercises */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Barbell size={20} className="text-accent" weight="fill" />
          <h3 className="font-semibold">Equipment Exercises</h3>
        </div>
        
        {equipmentExercises.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            No equipment exercises added yet
          </Card>
        ) : (
          <div className="space-y-2">
            {equipmentExercises.map((exercise) => (
              <Card key={exercise.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-sm text-muted-foreground font-mono">
                      {exercise.weight}kg × {exercise.targetReps} reps × {exercise.targetSets} sets
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditExercise(exercise)}>
                      <PencilSimple size={18} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteExercise(exercise.id)}>
                      <Trash size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cardio Exercises */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sneaker size={20} className="text-accent" weight="fill" />
          <h3 className="font-semibold">Cardio Exercises</h3>
        </div>
        
        {cardioExercises.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            No cardio exercises added yet
          </Card>
        ) : (
          <div className="space-y-2">
            {cardioExercises.map((exercise) => (
              <Card key={exercise.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-sm text-muted-foreground font-mono">
                      {exercise.targetDistance}km
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditExercise(exercise)}>
                      <PencilSimple size={18} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteExercise(exercise.id)}>
                      <Trash size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button onClick={handleAddExercise} className="w-full h-12" variant="outline">
        <Plus size={20} weight="bold" />
        Add Exercise
      </Button>

      <Button 
        onClick={onStartWorkout}
        disabled={!canStartWorkout()}
        className="w-full h-14 text-lg font-semibold"
        size="lg"
      >
        Start Workout
      </Button>

      <StrengthExerciseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        exercise={editingExercise as EquipmentExercise | CardioExercise | null}
        onSave={handleSaveExercise}
      />
    </div>
  )
}

interface StrengthExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: EquipmentExercise | CardioExercise | null
  onSave: (exercise: Exercise) => void
}

function StrengthExerciseDialog({ open, onOpenChange, exercise, onSave }: StrengthExerciseDialogProps) {
  const [type, setType] = useState<'equipment' | 'cardio'>('equipment')
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [targetReps, setTargetReps] = useState('')
  const [targetSets, setTargetSets] = useState('')
  const [targetDistance, setTargetDistance] = useState('')

  const resetForm = () => {
    if (exercise) {
      setType(exercise.type)
      setName(exercise.name)
      if (exercise.type === 'equipment') {
        setWeight(exercise.weight.toString())
        setTargetReps(exercise.targetReps.toString())
        setTargetSets(exercise.targetSets.toString())
      } else {
        setTargetDistance(exercise.targetDistance.toString())
      }
    } else {
      setType('equipment')
      setName('')
      setWeight('')
      setTargetReps('')
      setTargetSets('')
      setTargetDistance('')
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
                <SelectItem value="equipment">Equipment (Weight/Reps/Sets)</SelectItem>
                <SelectItem value="cardio">Cardio (Distance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-name">Exercise Name</Label>
            <Input
              id="exercise-name"
              placeholder={type === 'equipment' ? 'e.g. Bench Press, Lat Pulldown' : 'e.g. Treadmill, Rowing'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {type === 'equipment' ? (
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
