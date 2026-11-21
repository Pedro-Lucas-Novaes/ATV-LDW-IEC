import { useState, type FormEvent, type ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

interface RecordDialogProps {
  title: string
  description: string
  confirmLabel: string
  successMessage: string
  onClose: () => void
  onConfirm: () => Promise<void>
  confirmDisabled?: boolean
  destructive?: boolean
  children?: ReactNode
}

export function RecordDialog({
  title, description, confirmLabel, successMessage, onClose, onConfirm,
  confirmDisabled, destructive, children,
}: RecordDialogProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const previousFocus = useState(() => document.activeElement)[0]

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || confirmDisabled) return
    setError('')
    setBusy(true)
    try {
      await onConfirm()
      toast.success(successMessage)
      onClose()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível concluir a operação.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
        onCloseAutoFocus={(event) => {
          if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
            event.preventDefault()
            previousFocus.focus()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          {children}
          {error && <p role="alert" className="tracker-error">{error}</p>}
          <DialogFooter className="mt-1">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant={destructive ? 'destructive' : 'default'} disabled={busy || confirmDisabled}>
              {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
