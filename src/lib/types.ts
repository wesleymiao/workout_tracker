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
  targetDistance: number // in km for cardio exercises under Pull/Push/Legs
  actualDistance?: number
  completed: boolean
}

// For Swim workouts - distance only in meters
export interface SwimExercise {
  id: string
  type: 'swim'
  targetDistance: number // in meters
  actualDistance?: number
  completed: boolean
}

// For Run workouts - distance only in kilometers
export interface RunExercise {
  id: string
  type: 'run'
  targetDistance: number // in km
  actualDistance?: number
  completed: boolean
}

export type Exercise = EquipmentExercise | CardioExercise | SwimExercise | RunExercise

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

// Helper function to check if workout type is strength-based (Pull/Push/Legs)
export function isStrengthWorkout(type: WorkoutType): boolean {
  return type === 'Pull' || type === 'Push' || type === 'Legs'
}

// Helper function to check if workout type is run
export function isRunWorkout(type: WorkoutType): boolean {
  return type === 'Run (Gym)' || type === 'Run (Outdoor)'
}

// Helper function to check if workout type is swim
export function isSwimWorkout(type: WorkoutType): boolean {
  return type === 'Swim'
}
