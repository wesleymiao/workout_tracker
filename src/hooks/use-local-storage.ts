import { useState, useEffect, useCallback, useRef } from 'react'

const API_BASE = '/api/storage'

// Custom event for cross-component sync
const STORAGE_UPDATE_EVENT = 'local-storage-update'

function dispatchStorageUpdate(key: string) {
  window.dispatchEvent(new CustomEvent(STORAGE_UPDATE_EVENT, { detail: { key } }))
}

// Read from browser localStorage (instant, synchronous)
function readFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

// Write to browser localStorage
function writeToLocalStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn(`Error writing to localStorage for key "${key}":`, e)
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize from localStorage immediately (no delay!)
  const [storedValue, setStoredValue] = useState<T>(() => readFromLocalStorage(key, defaultValue))
  const isMounted = useRef(true)
  const defaultValueRef = useRef(defaultValue)

  // Sync with server API in the background (for persistence across devices)
  useEffect(() => {
    isMounted.current = true
    
    fetch(`${API_BASE}/${encodeURIComponent(key)}`)
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not found')
      })
      .then(data => {
        if (isMounted.current) {
          // Update state and localStorage if server has different data
          setStoredValue(data.value as T)
          writeToLocalStorage(key, data.value)
        }
      })
      .catch(() => {
        // Server doesn't have data - push our local data to server
        const localData = readFromLocalStorage(key, defaultValueRef.current)
        if (localData !== defaultValueRef.current) {
          fetch(`${API_BASE}/${encodeURIComponent(key)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: localData })
          }).catch(() => {})
        }
      })
    
    return () => { isMounted.current = false }
  }, [key])

  // Listen for updates from other components
  useEffect(() => {
    const handleStorageUpdate = (event: CustomEvent<{ key: string }>) => {
      if (event.detail.key === key) {
        // Read from localStorage (instant) - already updated by the setter
        const value = readFromLocalStorage(key, defaultValueRef.current)
        setStoredValue(value)
      }
    }

    window.addEventListener(STORAGE_UPDATE_EVENT, handleStorageUpdate as EventListener)
    return () => {
      window.removeEventListener(STORAGE_UPDATE_EVENT, handleStorageUpdate as EventListener)
    }
  }, [key])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value
      
      // Write to localStorage immediately (instant for other tabs)
      writeToLocalStorage(key, valueToStore)
      
      // Sync to server in background
      fetch(`${API_BASE}/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: valueToStore })
      })
        .then(() => {
          // Notify other hook instances
          dispatchStorageUpdate(key)
        })
        .catch(error => {
          console.warn(`Error saving to server for key "${key}":`, error)
        })
      
      return valueToStore
    })
  }, [key])

  const removeValue = useCallback(() => {
    setStoredValue(defaultValueRef.current)
    
    // Remove from localStorage immediately
    try {
      window.localStorage.removeItem(key)
    } catch {}
    
    // Remove from server
    fetch(`${API_BASE}/${encodeURIComponent(key)}`, {
      method: 'DELETE'
    })
      .then(() => {
        dispatchStorageUpdate(key)
      })
      .catch(error => {
        console.warn(`Error removing from server for key "${key}":`, error)
      })
  }, [key])

  return [storedValue, setValue, removeValue]
}