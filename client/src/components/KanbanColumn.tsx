import { useDroppable } from '@dnd-kit/core'
import { cn } from 'cn'
import { TaskCard } from './TaskCard'
import type { TaskItem, TaskStatus } from '../api/tasks'

const STATUS_STYLES: Record<
  TaskStatus,
  { label: string; column: string; over: string; title: string; dot: string }
> = {
  Todo: {
    label: 'Todo',
    column: 'border-red-400/25 bg-red-500/10',
    over: 'border-red-400/60 bg-red-500/20',
    title: 'text-red-200',
    dot: 'bg-red-400',
  },
  InProgress: {
    label: 'In Progress',
    column: 'border-orange-400/25 bg-orange-500/10',
    over: 'border-orange-400/60 bg-orange-500/20',
    title: 'text-orange-200',
    dot: 'bg-orange-400',
  },
  Done: {
    label: 'Done',
    column: 'border-emerald-400/25 bg-emerald-500/10',
    over: 'border-emerald-400/60 bg-emerald-500/20',
    title: 'text-emerald-200',
    dot: 'bg-emerald-400',
  },
}

type KanbanColumnProps = {
  status: TaskStatus
  tasks: TaskItem[]
  onDeleteTask: (id: number) => void
  onOpenTask: (task: TaskItem) => void
}

export function KanbanColumn({ status, tasks, onDeleteTask, onOpenTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const s = STATUS_STYLES[status]

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'glass relative flex min-h-[320px] flex-col gap-2 rounded-2xl border p-3 transition-colors',
        // sloupec s taženou kartou musí být nad ostatními (backdrop-filter dělá vlastní vrstvu)
        'has-[[data-dragging=true]]:z-30',
        isOver ? s.over : s.column
      )}
    >
      <div className="mb-1 flex items-center gap-2 px-1">
        <span className={cn('size-2 rounded-full', s.dot)} />
        <h3 className={cn('text-sm font-semibold', s.title)}>{s.label}</h3>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onOpenDetail={onOpenTask} />
      ))}

      {tasks.length === 0 && (
        <p className="grid flex-1 place-items-center rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-muted-foreground">
          Přetáhni sem úkol
        </p>
      )}
    </div>
  )
}
