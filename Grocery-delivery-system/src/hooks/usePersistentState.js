import { useEffect, useState } from 'react'

function usePersistentState(key, fallback, normalize = (value) => value) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') {
      return normalize(typeof fallback === 'function' ? fallback() : fallback)
    }

    try {
      const savedValue = window.localStorage.getItem(key)
      if (savedValue !== null) {
        return normalize(JSON.parse(savedValue))
      }
    } catch (error) {
      console.error(`Unable to load ${key} from localStorage:`, error)
    }

    return normalize(typeof fallback === 'function' ? fallback() : fallback)
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Unable to save ${key} to localStorage:`, error)
    }
  }, [key, value])

  return [value, setValue]
}

export default usePersistentState
