import { useState, useEffect, useCallback } from 'react'

const API_BASE = '/api/storage'

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load initial value from server
  useEffect(() => {
    fetch(`${API_BASE}/${encodeURIComponent(key)}`)
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not found')
      })
      .then(data => {
        setStoredValue(data.value as T)
        setIsLoaded(true)
      })
      .catch(() => {
        setStoredValue(defaultValue)
        setIsLoaded(true)
      })
  }, [key, defaultValue])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value
      
      // Save to server
      fetch(`${API_BASE}/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: valueToStore })
      }).catch(error => {
        console.warn(`Error saving to server for key "${key}":`, error)
      })
      
      return valueToStore
    })
  }, [key])

  const removeValue = useCallback(() => {
    setStoredValue(defaultValue)
    fetch(`${API_BASE}/${encodeURIComponent(key)}`, {
      method: 'DELETE'
    }).catch(error => {
      console.warn(`Error removing from server for key "${key}":`, error)
    })
  }, [key, defaultValue])

  return [storedValue, setValue, removeValue]
}