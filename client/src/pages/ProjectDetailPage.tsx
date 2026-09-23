import { useState, type SubmitEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProject } from '../api/projects'
import { getTasks, createTask, type CreateTaskInput, deleteTask, updateTask, type TaskStatus, type UpdateTaskInput } from '../api/tasks'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { KanbanColumn } from '../components/KanbanColumn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STATUSES: TaskStatus[] = ['Todo', 'InProgress', 'Done']
export function ProjectDetailPage() {
  const { id } = useParams()
  const projectId = Number(id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const queryClient = useQueryClient()

  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({ queryKey: ['projects', projectId], queryFn: () => getProject(projectId) })
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useQuery({ queryKey: ['projects', projectId, 'tasks'], queryFn: () => getTasks(projectId) })

  const createTaskMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] })
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const tasksKey = ['projects', projectId, 'tasks']

  const [pendingMove, setPendingMove] = useState<{ id: number; status: TaskStatus } | null>(null)

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) => {
      const task = tasks!.find((t) => t.id === id)!
      const input: UpdateTaskInput = { title: task.title, description: task.description, status }
      return updateTask(projectId, id, input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKey }),
    onSettled: () => setPendingMove(null),
  })

  const visibleTasks = (tasks ?? []).map((t) =>
    pendingMove && t.id === pendingMove.id ? { ...t, status: pendingMove.status } : t
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const newStatus = over.id as TaskStatus
    const taskId = active.id as number
    const task = (tasks ?? []).find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    setPendingMove({ id: taskId, status: newStatus })
    updateStatusMutation.mutate({ id: taskId, status: newStatus })

    updateStatusMutation.mutate({ id: taskId, status: newStatus })
  }

  function handleCreateTask(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setTitle('');
    setDescription('');
    const input: CreateTaskInput = {
      title,
      description: description || null,
    }

    createTaskMutation.mutate(input);
  }

  function handleDeleteTask(id: number) {
    if (!confirm('Opravdu smazat tento ukol?')) return
    deleteTaskMutation.mutate(id);
  }

  if (projectLoading || tasksLoading) return <p>Načítám…</p>
  if (projectError) return <p>Chyba: {projectError.message}</p>
  if (tasksError) return <p>Chyba: {tasksError.message}</p>
  if (!project) return <p>Projekt nenalezen.</p>

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/" />}>
          ← Zpět na projekty
        </Button>
        <h2 className="mt-2 text-2xl font-semibold">{project.name}</h2>
        {project.description && <p className="text-muted-foreground">{project.description}</p>}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-3">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={visibleTasks.filter((t) => t.status === status)}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DndContext>

      {updateStatusMutation.isError && (
        <p className="text-sm text-destructive">Změnu stavu se nepodařilo uložit.</p>
      )}
      <form onSubmit={handleCreateTask} className="max-w-sm space-y-3 rounded-lg border p-4">
        <h3 className="font-medium">Nový úkol</h3>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Název úkolu" required />
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Popis (nepovinné)" />
        <Button type="submit" disabled={createTaskMutation.isPending}>Vytvořit</Button>
      </form>
    </div>
  )
}