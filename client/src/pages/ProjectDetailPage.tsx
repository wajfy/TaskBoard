import { useEffect, useState, type SubmitEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProject, type Project } from '../api/projects'
import { getTasks, createTask, type TaskItem, type CreateTaskInput, deleteTask } from '../api/tasks'

export function ProjectDetailPage() {
  const { id } = useParams()
  const projectId = Number(id)

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  function loadTasks() {
    setLoading(true);
    setError(null);
    getTasks(projectId)
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  function handleCreateTask(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const input: CreateTaskInput = {
      title,
      description: description || null,
    }

    createTask(projectId, input).then(() => {
      setTitle('');
      setDescription('');
      loadTasks();
    }).catch((e) => setError(e.message))
  }

  function handleDelete(projectId: number, id: number) {
    if (!confirm('Opravdu smazat tento ukol?')) return
    setError(null);
    deleteTask(projectId, id).then(() => {
      loadTasks();
    }).catch((e) => setError(e.message))
  }

  useEffect(() => {
    Promise.all([getProject(projectId), getTasks(projectId)])
      .then(([projectData, tasksData]) => {
        setProject(projectData)
        setTasks(tasksData)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) return <p>Načítám…</p>
  if (error) return <p>Chyba: {error}</p>
  if (!project) return <p>Projekt nenalezen.</p>

  return (
    <div>
      <Link to="/">← Zpět na seznam</Link>
      <h2>{project.name}</h2>
      {project.description && <p>{project.description}</p>}

      <h3>Úkoly</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} — {task.status}
            <button onClick={() => handleDelete(projectId, task.id)}>Smazat</button>
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
        <button type="submit">Vytvořit</button>
      </form>
    </div>
  )
}