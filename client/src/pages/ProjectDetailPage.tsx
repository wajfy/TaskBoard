import { useState, type SubmitEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProject } from '../api/projects'
import { getTasks, createTask, type CreateTaskInput, deleteTask } from '../api/tasks'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

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

  function handleCreateTask(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
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
    <div>
      <Link to="/">← Zpět na seznam</Link>
      <h2>{project.name}</h2>
      {project.description && <p>{project.description}</p>}

      <h3>Úkoly</h3>
      <ul>
        {(tasks ?? []).map((task) => (
          <li key={task.id}>
            {task.title} — {task.status}
            <button onClick={() => handleDeleteTask(task.id)}>Smazat</button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleCreateTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Název ukolu"
          required
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Popis (nepovinné)"
        />
        <button type="submit" disabled={createTaskMutation.isPending}>Vytvořit</button>
      </form>
    </div>
  )
}