import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { Archive, ArchiveRestore, ArrowLeft, Trash2 } from 'lucide-react'
import { getProject, deleteProject, archiveProject, unarchiveProject } from '../api/projects'
import { getTasks, deleteTask, updateTask, type TaskItem, type TaskStatus, type UpdateTaskInput } from '../api/tasks'
import { KanbanColumn } from '../components/KanbanColumn'
import { CreateTaskDialog } from '../components/CreateTaskDialog'
import { EditProjectDialog } from '../components/EditProjectDialog'
import { TaskDetailDialog } from '../components/TaskDetailDialog'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Button } from '@/components/ui/button'

const STATUSES: TaskStatus[] = ['Todo', 'InProgress', 'Done']

export function ProjectDetailPage() {
  const { id } = useParams()
  const projectId = Number(id)

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const tasksKey = ['projects', projectId, 'tasks']

  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId),
  })
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: tasksKey,
    queryFn: () => getTasks(projectId),
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(projectId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKey }),
  })

  const archiveMutation = useMutation({
    mutationFn: (archived: boolean) => (archived ? archiveProject(projectId) : unarchiveProject(projectId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  const deleteProjectMutation = useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['projects', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] })
      navigate('/')
    },
  })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const [pendingMove, setPendingMove] = useState<{ id: number; status: TaskStatus } | null>(null)

  const [detail, setDetail] = useState<{ task: TaskItem; open: boolean; key: number } | null>(null)

  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<{ task: TaskItem; open: boolean } | null>(null)

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
  }

  function handleDeleteTask(id: number) {
    const task = (tasks ?? []).find((t) => t.id === id)
    if (task) {
      deleteTaskMutation.reset()
      setTaskToDelete({ task, open: true })
    }
  }

  function confirmDeleteTask() {
    if (!taskToDelete) return
    deleteTaskMutation.mutate(taskToDelete.task.id, {
      onSuccess: () => setTaskToDelete((d) => (d ? { ...d, open: false } : d)),
    })
  }

  if (projectLoading || tasksLoading) return <p className="p-6 text-muted-foreground">Načítám…</p>
  if (projectError) return <p className="p-6 text-destructive">Chyba: {projectError.message}</p>
  if (tasksError) return <p className="p-6 text-destructive">Chyba: {tasksError.message}</p>
  if (!project) return <p className="p-6 text-muted-foreground">Projekt nenalezen.</p>

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2"
          aria-label="Zpět na projekty"
          title="Zpět na projekty"
          nativeButton={false}
          render={<Link to="/" />}
        >
          <ArrowLeft />
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-2xl font-semibold tracking-tight wrap-anywhere">{project.name}</h2>
              {project.isArchived && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">
                  <Archive className="size-3" />
                  Archivováno
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <EditProjectDialog project={project} />
            <Button
              variant="outline"
              size="icon"
              aria-label={project.isArchived ? 'Obnovit z archivu' : 'Archivovat projekt'}
              title={project.isArchived ? 'Obnovit z archivu' : 'Archivovat projekt'}
              disabled={archiveMutation.isPending}
              onClick={() => archiveMutation.mutate(!project.isArchived)}
            >
              {project.isArchived ? <ArchiveRestore /> : <Archive />}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              aria-label="Smazat projekt"
              title="Smazat projekt"
              onClick={() => {
                deleteProjectMutation.reset()
                setDeleteProjectOpen(true)
              }}
            >
              <Trash2 />
            </Button>
            <CreateTaskDialog projectId={projectId} />
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-3">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={visibleTasks.filter((t) => t.status === status)}
              onDeleteTask={handleDeleteTask}
              onOpenTask={(task) => setDetail({ task, open: true, key: Date.now() })}
            />
          ))}
        </div>
      </DndContext>

      {updateStatusMutation.isError && (
        <p className="text-sm text-destructive">Změnu stavu se nepodařilo uložit.</p>
      )}
      {updateStatusMutation.isPaused && (
        <p className="text-sm text-muted-foreground">Bez připojení, čekám na obnovení spojení…</p>
      )}
      <ConfirmDialog
        open={deleteProjectOpen}
        onOpenChange={setDeleteProjectOpen}
        title="Smazat projekt?"
        description={`Projekt „${project.name}“ a všechny jeho úkoly budou nenávratně smazány.`}
        confirmLabel="Smazat projekt"
        isPending={deleteProjectMutation.isPending}
        errorMessage={deleteProjectMutation.isError ? 'Projekt se nepodařilo smazat.' : null}
        onConfirm={() => deleteProjectMutation.mutate()}
      />

      {taskToDelete && (
        <ConfirmDialog
          open={taskToDelete.open}
          onOpenChange={(open) => setTaskToDelete((d) => (d ? { ...d, open } : d))}
          title="Smazat úkol?"
          description={`Úkol „${taskToDelete.task.title}“ bude nenávratně smazán.`}
          confirmLabel="Smazat úkol"
          isPending={deleteTaskMutation.isPending}
          errorMessage={deleteTaskMutation.isError ? 'Úkol se nepodařilo smazat.' : null}
          onConfirm={confirmDeleteTask}
        />
      )}

      {detail && (
        <TaskDetailDialog
          key={detail.key}
          task={detail.task}
          projectId={projectId}
          open={detail.open}
          onOpenChange={(open) => setDetail((d) => (d ? { ...d, open } : d))}
        />
      )}
    </div>
  )
}
