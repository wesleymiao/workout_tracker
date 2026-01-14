import { useState } from 'react'
import { House, Barbell } from '@phosphor-icons/react'
import HomeScreen from './components/screens/HomeScreen'
import ActiveWorkoutScreen from './components/screens/ActiveWorkoutScreen'
import { Toaster } from './components/ui/sonner'

type Tab = 'home' | 'workout'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [isPastWorkoutMode, setIsPastWorkoutMode] = useState(false)

  const handleStartWorkout = (isPastWorkout: boolean = false) => {
    setIsPastWorkoutMode(isPastWorkout)
    setActiveTab('workout')
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 overflow-auto pb-16">
        {activeTab === 'home' && <HomeScreen onStartWorkout={handleStartWorkout} />}
        {activeTab === 'workout' && <ActiveWorkoutScreen isPastWorkoutMode={isPastWorkoutMode} onExitPastWorkoutMode={() => setIsPastWorkoutMode(false)} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-4 safe-area-inset">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-all ${
            activeTab === 'home'
              ? 'text-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <House size={24} weight={activeTab === 'home' ? 'fill' : 'regular'} />
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('workout')}
          className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-all ${
            activeTab === 'workout'
              ? 'text-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Barbell size={24} weight={activeTab === 'workout' ? 'fill' : 'regular'} />
          <span className="text-xs font-medium">Workout</span>
        </button>
      </nav>

      <Toaster position="top-center" />
    </div>
  )
}

export default App
