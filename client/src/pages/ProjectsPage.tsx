import { useState, type SubmitEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { createProject, getProjects, deleteProject, type CreateProjectInput } from '../api/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

export function ProjectsPage() {
    const queryClient = useQueryClient()

    const { data: projects, isLoading, error } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
    })

    const createMutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    })

    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
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

    if (isLoading) return <p className="p-6 text-muted-foreground">Načítám…</p>
    if (error) return <p className="p-6 text-destructive">Chyba: {error.message}</p>

    return (
        <div className="mx-auto max-w-4xl space-y-8 p-6">
            <div>
                <h2 className="mb-4 text-2xl font-semibold">Projekty</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(projects ?? []).map((project) => (
                        <Card key={project.id}>
                            <CardHeader>
                                <CardTitle>{project.name}</CardTitle>
                                {project.description && <CardDescription>{project.description}</CardDescription>}
                            </CardHeader>
                            <CardFooter className="gap-2">
                                <Button variant="outline" size="sm" render={<Link to={`/projects/${project.id}`} />}>
                                    Detail
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)}>
                                    Smazat
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-sm space-y-3 rounded-lg border p-4">
                <h3 className="font-medium">Nový projekt</h3>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Název projektu" required />
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Popis (nepovinné)" />
                <Button type="submit" disabled={createMutation.isPending}>Vytvořit</Button>
            </form>
        </div>
    )
}