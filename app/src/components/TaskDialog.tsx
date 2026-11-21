import { useState, type ChangeEvent } from 'react'
import { RecordDialog } from '@/components/RecordDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { taskPriorities, taskStatuses, type Project, type Task, type TaskInput } from '@/types/tracker'

interface TaskDialogProps {
  task?: Task
  projects: Project[]
  onSave: (values: TaskInput) => Promise<void>
  onClose: () => void
}

export function TaskDialog({ task, projects, onSave, onClose }: TaskDialogProps) {
  const [title, setTitle] = useState(task?.titulo ?? '')
  const [description, setDescription] = useState(task?.descricao ?? '')
  const [status, setStatus] = useState<TaskInput['status']>(task?.status ?? 'pendente')
  const [priority, setPriority] = useState<TaskInput['prioridade']>(task?.prioridade ?? 'media')
  const [projectId, setProjectId] = useState(task?.project_id ?? (projects.length === 1 ? projects[0].id : 0))

  return (
    <RecordDialog
      title={task ? 'Editar tarefa' : 'Nova tarefa'}
      description="Organize a tarefa por projeto, status e prioridade."
      confirmLabel={task ? 'Salvar alterações' : 'Criar tarefa'}
      successMessage={task ? 'Tarefa atualizada.' : 'Tarefa criada.'}
      confirmDisabled={!title.trim() || !projectId}
      onClose={onClose}
      onConfirm={() => onSave({
        titulo: title.trim(),
        descricao: description.trim() || null,
        status,
        prioridade: priority,
        project_id: projectId,
      })}
    >
      <div className="form-field">
        <Label htmlFor="task-title">Título</Label>
        <Input id="task-title" maxLength={150} required value={title}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.currentTarget.value)} />
      </div>
      <div className="form-field">
        <Label htmlFor="task-description">Descrição <span className="text-muted-foreground">(opcional)</span></Label>
        <textarea id="task-description" className="tracker-control" rows={3} value={description}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDescription(event.currentTarget.value)} />
      </div>
      <div className="form-field">
        <Label htmlFor="task-project">Projeto</Label>
        <select id="task-project" className="tracker-control" required value={projectId || ''}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => setProjectId(Number(event.currentTarget.value))}>
          <option value="" disabled>Selecione um projeto</option>
          {projects.map(({ id, nome }) => <option key={id} value={id}>{nome}</option>)}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="form-field">
          <Label htmlFor="task-status">Status</Label>
          <select id="task-status" className="tracker-control" value={status}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setStatus(event.currentTarget.value as TaskInput['status'])}>
            {Object.entries(taskStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="form-field">
          <Label htmlFor="task-priority">Prioridade</Label>
          <select id="task-priority" className="tracker-control" value={priority}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setPriority(event.currentTarget.value as TaskInput['prioridade'])}>
            {Object.entries(taskPriorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>
    </RecordDialog>
  )
}
