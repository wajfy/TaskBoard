import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Maximize2, Trash2 } from 'lucide-react'
import { cn } from 'cn'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { TaskItem } from '../api/tasks'

type TaskCardProps = {
  task: TaskItem
  onDelete: (id: number) => void
  onOpenDetail: (task: TaskItem) => void
}

export function TaskCard({ task, onDelete, onOpenDetail }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <Card
      ref={setNodeRef}
      size="sm"
      data-dragging={isDragging}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab touch-none active:cursor-grabbing',
        isDragging && 'opacity-90 shadow-2xl ring-1 ring-white/30'
      )}
    >
      <CardHeader>
        <div className="flex min-w-0 items-start justify-between gap-2">
          <CardTitle className="min-w-0 text-sm wrap-anywhere">{task.title}</CardTitle>
          <div className="-mt-1 -mr-1 flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Detail a úprava úkolu"
              title="Detail a úprava"
              onClick={() => onOpenDetail(task)}
            >
              <Maximize2 />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Smazat úkol"
              title="Smazat"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
        {task.description && (
          <CardDescription className="line-clamp-3 wrap-anywhere">{task.description}</CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}
