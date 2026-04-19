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

// Health data types
export interface HealthMetric {
  type: string
  value: number
  unit: string
  date: string
}

export type HealthMetricType = 'steps' | 'heartRate' | 'restingHeartRate' | 'activeEnergy' | 'sleepHours' | 'walkingDistance'

export const HEALTH_METRIC_LABELS: Record<string, { label: string; icon: string; color: string; unit: string }> = {
  steps: { label: '步数', icon: '🚶', color: 'text-blue-400', unit: '步' },
  heartRate: { label: '心率', icon: '❤️', color: 'text-red-400', unit: 'bpm' },
  restingHeartRate: { label: '静息心率', icon: '💗', color: 'text-pink-400', unit: 'bpm' },
  activeEnergy: { label: '活动能量', icon: '🔥', color: 'text-orange-400', unit: 'kcal' },
  sleepHours: { label: '睡眠', icon: '😴', color: 'text-indigo-400', unit: '小时' },
  walkingDistance: { label: '步行距离', icon: '📍', color: 'text-green-400', unit: 'km' },
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
