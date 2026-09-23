import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { TaskItem } from '../api/tasks'

type TaskCardProps = {
  task: TaskItem
  onDelete: (id: number) => void
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm">{task.title}</CardTitle>
          <Button variant="ghost" size="icon-xs" aria-label="Smazat úkol" onClick={() => onDelete(task.id)}>
            <X />
          </Button>
        </div>
        {task.description && <CardDescription>{task.description}</CardDescription>}
      </CardHeader>
    </Card>
  )
}