import type { ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ListStateProps {
  loading: boolean
  error: string
  retry: () => void
  empty?: ReactNode
  children: ReactNode
}

export function ListState({ loading, error, retry, empty, children }: ListStateProps) {
  if (loading) {
    return <div className="board-state" role="status">
      <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden="true" /> Carregando…
    </div>
  }

  if (error) {
    return <div className="board-state flex-col">
      <p className="tracker-error" role="alert">{error}</p>
      <Button type="button" variant="outline" onClick={retry}>Tentar novamente</Button>
    </div>
  }

  return empty ?? children
}
