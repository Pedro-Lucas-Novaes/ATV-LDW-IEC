import { useEffect, useState } from 'react'

export function useResourceList<T>(load: (signal: AbortSignal) => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchItems() {
      try {
        const result = await load(controller.signal)
        if (!controller.signal.aborted) setItems(result)
      } catch (failure) {
        if (!controller.signal.aborted) {
          setError(failure instanceof Error ? failure.message : 'Não foi possível carregar os dados.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void fetchItems()
    return () => controller.abort()
  }, [load, attempt])

  function retry() {
    setError('')
    setLoading(true)
    setAttempt((current) => current + 1)
  }

  return { items, setItems, loading, error, retry }
}
