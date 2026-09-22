export type TaskStatus = 'Todo' | 'InProgress' | 'Done'

export type TaskItem = {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
  projectId: number
}

export type CreateTaskInput = {
  title: string
  description?: string | null
  status?: TaskStatus
}

function baseUrl(projectId: number) {
  return `/api/projects/${projectId}/tasks`
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json()
}

export function getTasks(projectId: number): Promise<TaskItem[]> {
  return fetch(baseUrl(projectId)).then((r) => handleResponse<TaskItem[]>(r))
}

export function createTask(projectId: number, input: CreateTaskInput): Promise<TaskItem> {
  return fetch(baseUrl(projectId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => handleResponse<TaskItem>(r))
}

export function deleteTask(projectId: number, id: number): Promise<void> {
  return fetch(`${baseUrl(projectId)}/${id}`, { method: 'DELETE' }).then((r) => handleResponse<void>(r))
}