import { useState, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Plus, Trash } from '@phosphor-icons/react'
import { generateId } from '@/lib/workout-utils'
import { WorkoutType } from '@/lib/types'

interface ChecklistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  checklistItems: string[]
  workoutType: WorkoutType
  onContinue: () => void
}

// Default checklist items based on workout type (aligned with PRD)
const DEFAULT_COMMON_ITEMS = ['水壶', '毛巾', '耳机', '拖鞋']
const SWIM_SPECIFIC_ITEMS = ['游泳包']

export default function ChecklistDialog({
  open,
  onOpenChange,
  checklistItems,
  workoutType,
  onContinue
}: ChecklistDialogProps) {
  const [items, setItems] = useLocalStorage<string[]>('checklist-items', checklistItems)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [newItem, setNewItem] = useState('')

  // Get checklist items based on workout type
  const getChecklistItems = () => {
    const allItems = [...items]
    if (workoutType === 'Swim') {
      // Add swim-specific items if not already present
      SWIM_SPECIFIC_ITEMS.forEach(item => {
        if (!allItems.includes(item)) {
          allItems.push(item)
        }
      })
    }
    return allItems
  }

  const displayItems = getChecklistItems()

  const handleToggle = (item: string) => {
    const updated = new Set(checkedItems)
    if (updated.has(item)) {
      updated.delete(item)
    } else {
      updated.add(item)
    }
    setCheckedItems(updated)
  }

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems((currentItems) => [...currentItems, newItem.trim()])
      setNewItem('')
    }
  }

  const handleRemoveItem = (itemToRemove: string) => {
    setItems((currentItems) => currentItems.filter(item => item !== itemToRemove))
  }

  const handleContinue = () => {
    setCheckedItems(new Set())
    onContinue()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Pre-Workout Checklist</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {displayItems.map((item) => (
            <div 
              key={item} 
              className="flex items-center gap-4 group p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 active:bg-secondary/70 transition-colors touch-manipulation"
              onClick={() => handleToggle(item)}
            >
              <Checkbox
                id={item}
                checked={checkedItems.has(item)}
                onCheckedChange={() => handleToggle(item)}
                className="h-7 w-7 rounded-md data-[state=checked]:bg-accent data-[state=checked]:border-accent [&>span>svg]:h-5 [&>span>svg]:w-5"
              />
              <label
                htmlFor={item}
                className="flex-1 text-lg font-medium cursor-pointer select-none"
              >
                {item}
              </label>
              {!SWIM_SPECIFIC_ITEMS.includes(item) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveItem(item)
                  }}
                  className="h-10 w-10 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <Trash size={22} />
                </Button>
              )}
            </div>
          ))}

          {displayItems.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No checklist items. Add your first item below.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddItem()
              }
            }}
            className="h-12 text-base"
          />
          <Button onClick={handleAddItem} size="icon" className="h-12 w-12">
            <Plus size={24} weight="bold" />
          </Button>
        </div>

        <DialogFooter>
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            Continue to Workout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
