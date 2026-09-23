import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  isPending?: boolean
  errorMessage?: string | null
}

// Potvrzení nevratné akce. Dialog řídí rodič (open/onOpenChange) a sám se po potvrzení
// nezavírá: zavře ho rodič, až akce uspěje (při chybě zůstane otevřený a ukáže hlášku).
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Smazat',
  onConfirm,
  isPending = false,
  errorMessage = null,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="wrap-anywhere">{description}</DialogDescription>
        </DialogHeader>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isPending} />}>Zrušit</DialogClose>
          <Button variant="destructive" disabled={isPending} onClick={onConfirm}>
            <Trash2 />
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
