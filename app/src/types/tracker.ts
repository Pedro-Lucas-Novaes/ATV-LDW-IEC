export interface ProjectInput {
  nome: string
  descricao: string | null
}

export interface Project extends ProjectInput {
  id: number
  user_id: number
  createdAt: string
  updatedAt: string
}

export const taskStatuses = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
} as const

export const taskPriorities = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
} as const

export type TaskStatus = keyof typeof taskStatuses
export type TaskPriority = keyof typeof taskPriorities

export interface TaskInput {
  titulo: string
  descricao: string | null
  status: TaskStatus
  prioridade: TaskPriority
  project_id: number
}

export interface Task extends TaskInput {
  id: number
  createdAt: string
  updatedAt: string
  project?: Project
}
