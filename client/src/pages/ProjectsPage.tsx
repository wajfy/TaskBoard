import { useState, type SubmitEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createProject, getProjects, deleteProject, type CreateProjectInput } from '../api/projects'
import { Link } from 'react-router-dom'

export function ProjectsPage() {
  const queryClient = useQueryClient()

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const input: CreateProjectInput = { name, description: description || null }
    createMutation.mutate(input, {
      onSuccess: () => {
        setName('')
        setDescription('')
      },
    })
  }

  function handleDelete(id: number) {
    if (!confirm('Opravdu smazat tento projekt?')) return
    deleteMutation.mutate(id)
  }

  if (isLoading) return <p>Načítám…</p>
  if (error) return <p>Chyba: {error.message}</p>

  return (
    <div>
      <h2>Projekty</h2>
      <ul>
        {(projects ?? []).map((project) => (
          <li key={project.id}>
            <strong>{project.name}</strong>
            {project.description && ` – ${project.description}`}
            <Link to={`/projects/${project.id}`}>Detail</Link>
            <button onClick={() => handleDelete(project.id)}>Smazat</button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Název projektu" required />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Popis (nepovinné)" />
        <button type="submit" disabled={createMutation.isPending}>Vytvořit</button>
      </form>
    </div>
  )
}