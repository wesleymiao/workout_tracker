import { Workout, WorkoutType } from './types'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function getLastWorkoutOfType(workouts: Workout[], type: WorkoutType): Workout | undefined {
  return workouts
    .filter(w => w.type === type && w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
}

export function formatDuration(startTime: string, endTime?: string): string {
  if (!endTime) return '0m'
  
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffMs = end.getTime() - start.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) return `${diffMins}m`
  
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}m`
}

export function getDaysSinceLastWorkout(workouts: Workout[]): number {
  const completedWorkouts = workouts.filter(w => w.completed)
  if (completedWorkouts.length === 0) return 999
  
  const lastWorkout = completedWorkouts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]
  
  const now = new Date()
  const lastDate = new Date(lastWorkout.date)
  const diffMs = now.getTime() - lastDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function getWorkoutStreak(workouts: Workout[]): number {
  const completedWorkouts = workouts
    .filter(w => w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  if (completedWorkouts.length === 0) return 0
  
  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lastWorkoutDate = new Date(completedWorkouts[0].date)
  lastWorkoutDate.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > 1) return 0
  
  for (let i = 1; i < completedWorkouts.length; i++) {
    const current = new Date(completedWorkouts[i - 1].date)
    const previous = new Date(completedWorkouts[i].date)
    current.setHours(0, 0, 0, 0)
    previous.setHours(0, 0, 0, 0)
    
    const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diff <= 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

export function getTotalVolume(workout: Workout): number {
  return workout.exercises.reduce((total, exercise) => {
    if (exercise.type === 'equipment') {
      const weight = exercise.actualWeight ?? exercise.weight
      const totalReps = exercise.actualReps?.reduce((sum, reps) => sum + reps, 0) ?? 
                        (exercise.targetReps * exercise.completedSets)
      return total + (weight * totalReps)
    }
    return total
  }, 0)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  
  const diffMs = today.getTime() - compareDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
