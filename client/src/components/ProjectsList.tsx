import { useEffect, useState, type SubmitEvent } from 'react'
import { createProject, getProjects, type Project, type CreateProjectInput, deleteProject } from '../api/projects'

export function ProjectsList() {
    const [projects, setProjects] = useState<Project[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    function loadProjects() {
        setLoading(true)
        getProjects()
            .then(setProjects)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadProjects()
    }, [])

    function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        const input: CreateProjectInput = {
            name,
            description: description || null,
        }
        
        createProject(input).then(() => {
            setName('');
            setDescription('');
            loadProjects();
        }).catch((e) => setError(e.message))
    }

    function handleDelete(id: number) {
        if (!confirm('Opravdu smazat tento projekt?')) return
        deleteProject(id).then(() => {
            loadProjects();
        }).catch((e) => setError(e.message))
    }

    if (loading) return <p>Načítám…</p>
    if (error) return <p>Chyba: {error}</p>

    return (
        <div>
            <h2>Projekty</h2>
            <ul>
                {projects.map((project) => (
                    <li key={project.id}>
                        <strong>{project.name}</strong>
                        {project.description && ` – ${project.description}`}
                        <button onClick={() => handleDelete(project.id)}>Smazat</button>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Název projektu"
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