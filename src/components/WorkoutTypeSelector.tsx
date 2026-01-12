import { WorkoutType } from '@/lib/types'
import { Card } from './ui/card'
import { Barbell, Waves, Sneaker } from '@phosphor-icons/react'

interface WorkoutTypeSelectorProps {
  onSelect: (type: WorkoutType) => void
}

const workoutTypes: { type: WorkoutType; icon: React.ReactNode; description: string }[] = [
  {
    type: 'Pull',
    icon: <Barbell size={32} weight="fill" />,
    description: 'Back, biceps, rear delts'
  },
  {
    type: 'Push',
    icon: <Barbell size={32} weight="fill" />,
    description: 'Chest, shoulders, triceps'
  },
  {
    type: 'Legs',
    icon: <Barbell size={32} weight="fill" />,
    description: 'Quads, hamstrings, glutes'
  },
  {
    type: 'Swim',
    icon: <Waves size={32} weight="fill" />,
    description: 'Pool or open water'
  },
  {
    type: 'Run (Gym)',
    icon: <Sneaker size={32} weight="fill" />,
    description: 'Treadmill running'
  },
  {
    type: 'Run (Outdoor)',
    icon: <Sneaker size={32} weight="fill" />,
    description: 'Outdoor running'
  }
]

export default function WorkoutTypeSelector({ onSelect }: WorkoutTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {workoutTypes.map(({ type, icon, description }) => (
        <Card
          key={type}
          className="p-4 cursor-pointer transition-all hover:scale-[1.02] hover:border-accent active:scale-[0.98]"
          onClick={() => onSelect(type)}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-accent">
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{type}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
