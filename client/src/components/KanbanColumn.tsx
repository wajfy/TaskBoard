import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import type { TaskItem, TaskStatus } from '../api/tasks'

const STATUS_LABELS: Record<TaskStatus, string> = {
  Todo: 'Todo',
  InProgress: 'In Progress',
  Done: 'Done',
}

type KanbanColumnProps = {
  status: TaskStatus
  tasks: TaskItem[]
  onDeleteTask: (id: number) => void
}

export function KanbanColumn({ status, tasks, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[300px] flex-1 flex-col gap-2 rounded-lg border p-3 ${
        isOver ? 'bg-muted' : 'bg-background'
      }`}
    >
      <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
        {STATUS_LABELS[status]} ({tasks.length})
      </h3>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
      ))}
    </div>
  )
}