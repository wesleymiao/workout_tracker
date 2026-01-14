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

        <div className="space-y-3 py-4">
          {displayItems.map((item) => (
            <div key={item} className="flex items-center gap-3 group">
              <Checkbox
                id={item}
                checked={checkedItems.has(item)}
                onCheckedChange={() => handleToggle(item)}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <label
                htmlFor={item}
                className="flex-1 text-base cursor-pointer select-none"
              >
                {item}
              </label>
              {!SWIM_SPECIFIC_ITEMS.includes(item) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash size={18} />
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
          />
          <Button onClick={handleAddItem} size="icon">
            <Plus size={20} weight="bold" />
          </Button>
        </div>

        <DialogFooter>
          <Button
            onClick={handleContinue}
            className="w-full h-12"
            size="lg"
          >
            Continue to Workout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
