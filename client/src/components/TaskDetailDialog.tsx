import { useState, type SubmitEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from 'cn'
import { updateTask, type TaskItem, type TaskStatus } from '../api/tasks'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const STATUS_OPTIONS: { value: TaskStatus; label: string; active: string }[] = [
  { value: 'Todo', label: 'Todo', active: 'border-red-400/60 bg-red-500/25 text-red-100' },
  { value: 'InProgress', label: 'In Progress', active: 'border-orange-400/60 bg-orange-500/25 text-orange-100' },
  { value: 'Done', label: 'Done', active: 'border-emerald-400/60 bg-emerald-500/25 text-emerald-100' },
]

type TaskDetailDialogProps = {
  task: TaskItem
  projectId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Stav formuláře se inicializuje z `task` jen při vytvoření komponenty,
// proto ji rodič vykresluje s `key={task.id}` (viz ProjectDetailPage).
export function TaskDetailDialog({ task, projectId, open, onOpenChange }: TaskDetailDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task.status)

  const updateMutation = useMutation({
    mutationFn: () => updateTask(projectId, task.id, { title, description: description || null, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] }),
  })

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    updateMutation.mutate(undefined, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Detail úkolu</DialogTitle>
            <DialogDescription>Vytvořeno {new Date(task.createdAt).toLocaleString('cs-CZ')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <label htmlFor="task-title" className="text-xs font-medium text-muted-foreground">
              Název
            </label>
            <Textarea
              id="task-title"
              className="max-h-40 min-h-14 overflow-y-auto font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
            <p className="text-right text-xs text-muted-foreground">{title.length}/200</p>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="task-description" className="text-xs font-medium text-muted-foreground">
              Popis
            </label>
            <Textarea
              id="task-description"
              className="max-h-80 min-h-40 overflow-y-auto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bez popisu"
              maxLength={500}
            />
            <p className="text-right text-xs text-muted-foreground">{description.length}/500</p>
          </div>

          <div className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Stav</span>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={status === option.value}
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                    status === option.value
                      ? option.active
                      : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {updateMutation.isError && <p className="text-sm text-destructive">Úkol se nepodařilo uložit.</p>}

          <DialogFooter>
            <Button type="submit" disabled={updateMutation.isPending}>
              Uložit změny
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
