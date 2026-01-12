export type WorkoutType = 'Pull' | 'Push' | 'Legs' | 'Swim' | 'Run (Gym)' | 'Run (Outdoor)'

export type ExerciseType = 'equipment' | 'cardio'

export interface EquipmentExercise {
  id: string
  type: 'equipment'
  name: string
  weight: number
  targetReps: number
  targetSets: number
  completedSets: number
  actualWeight?: number
  actualReps?: number[]
  completed: boolean
}

export interface CardioExercise {
  id: string
  type: 'cardio'
  name: string
  targetDistance?: number
  targetDuration?: number
  actualDistance?: number
  actualDuration?: number
  completed: boolean
}

export type Exercise = EquipmentExercise | CardioExercise

export interface Workout {
  id: string
  type: WorkoutType
  date: string
  startTime: string
  endTime?: string
  exercises: Exercise[]
  completed: boolean
}

export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

export interface UserSettings {
  reminderThreshold: number
  checklistItems: string[]
}
