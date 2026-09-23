import { apiFetch } from './client'

export type Project = {
    id: number
    name: string
    description: string | null
    createdAt: string
    isArchived: boolean
}

export type CreateProjectInput = {
    name: string
    description?: string | null
}

export type UpdateProjectInput = {
    name: string
    description?: string | null
}

const BASE_URL = '/api/projects'

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }
    if (response.status === 204) {
        return undefined as T
    }
    return response.json()
}

export function getProjects(archived = false): Promise<Project[]> {
    return apiFetch(`${BASE_URL}?archived=${archived}`).then((r) => handleResponse<Project[]>(r))
}

export function archiveProject(id: number): Promise<void> {
    return apiFetch(`${BASE_URL}/${id}/archive`, { method: 'POST' }).then((r) => handleResponse<void>(r))
}

export function unarchiveProject(id: number): Promise<void> {
    return apiFetch(`${BASE_URL}/${id}/unarchive`, { method: 'POST' }).then((r) => handleResponse<void>(r))
}

export function getProject(id: number): Promise<Project> {
    return apiFetch(`${BASE_URL}/${id}`).then((r) => handleResponse<Project>(r))
}

export function createProject(input: CreateProjectInput): Promise<Project> {
    return apiFetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    }).then((r) => handleResponse<Project>(r))
}

export function deleteProject(id: number): Promise<void> {
    return apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' }).then((r) => handleResponse<void>(r))
}

export function updateProject(id: number, input: UpdateProjectInput): Promise<void> {
    return apiFetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    }).then((r) => handleResponse<void>(r))
}