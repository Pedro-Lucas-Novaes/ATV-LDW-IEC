import type { Project, ProjectInput, Task, TaskInput } from '@/types/tracker'

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '') + '/api'

interface Credentials {
  email: string
  password: string
}

interface LoginResponse {
  token: string
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  payload?: Credentials | (Credentials & { nome: string }) | ProjectInput | TaskInput
  token?: string
  signal?: AbortSignal
  onUnauthorized?: () => void
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', payload, token, signal, onUnauthorized } = options
  const headers = new Headers({ Accept: 'application/json' })
  if (payload !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      headers,
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('Não foi possível conectar à API. Verifique se o servidor está em execução.')
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      onUnauthorized?.()
      throw new Error('Sua sessão expirou. Entre novamente para continuar.')
    }
    const body: unknown = await response.json().catch(() => null)
    if (body && typeof body === 'object' && 'erro' in body && typeof body.erro === 'string') {
      throw new Error(body.erro)
    }
    throw new Error(`A API respondeu com erro (HTTP ${response.status}).`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function signIn(credentials: Credentials) {
  return request<LoginResponse>('/auth/login', { method: 'POST', payload: credentials })
}

export async function signUp(data: Credentials & { nome: string }) {
  await request('/users', { method: 'POST', payload: data })
}

export function createTrackerApi(token: string, onUnauthorized: () => void) {
  const auth = { token, onUnauthorized }
  return {
    listProjects: (signal?: AbortSignal) => request<Project[]>('/projects', { ...auth, signal }),
    createProject: (payload: ProjectInput) =>
      request<Project>('/projects', { ...auth, method: 'POST', payload }),
    updateProject: (id: number, payload: ProjectInput) =>
      request<Project>(`/projects/${id}`, { ...auth, method: 'PUT', payload }),
    deleteProject: (id: number) => request<void>(`/projects/${id}`, { ...auth, method: 'DELETE' }),
    listTasks: (signal?: AbortSignal) => request<Task[]>('/tasks', { ...auth, signal }),
    createTask: (payload: TaskInput) =>
      request<Task>('/tasks', { ...auth, method: 'POST', payload }),
    updateTask: (id: number, payload: TaskInput) =>
      request<Task>(`/tasks/${id}`, { ...auth, method: 'PUT', payload }),
    deleteTask: (id: number) => request<void>(`/tasks/${id}`, { ...auth, method: 'DELETE' }),
  }
}

export type TrackerApi = ReturnType<typeof createTrackerApi>
