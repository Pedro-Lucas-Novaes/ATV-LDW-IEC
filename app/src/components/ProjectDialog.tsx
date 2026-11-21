import { useState, type ChangeEvent } from 'react'
import { RecordDialog } from '@/components/RecordDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Project, ProjectInput } from '@/types/tracker'

interface ProjectDialogProps {
  project?: Project
  onSave: (values: ProjectInput) => Promise<void>
  onClose: () => void
}

export function ProjectDialog({ project, onSave, onClose }: ProjectDialogProps) {
  const [name, setName] = useState(project?.nome ?? '')
  const [description, setDescription] = useState(project?.descricao ?? '')

  return (
    <RecordDialog
      title={project ? 'Editar projeto' : 'Novo projeto'}
      description="Defina um nome e, se quiser, descreva o objetivo do projeto."
      confirmLabel={project ? 'Salvar alterações' : 'Criar projeto'}
      successMessage={project ? 'Projeto atualizado.' : 'Projeto criado.'}
      confirmDisabled={!name.trim()}
      onClose={onClose}
      onConfirm={() => onSave({ nome: name.trim(), descricao: description.trim() || null })}
    >
      <div className="form-field">
        <Label htmlFor="project-name">Nome</Label>
        <Input id="project-name" maxLength={100} required value={name}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.currentTarget.value)} />
      </div>
      <div className="form-field">
        <Label htmlFor="project-description">Descrição <span className="text-muted-foreground">(opcional)</span></Label>
        <textarea id="project-description" className="tracker-control" rows={4} value={description}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDescription(event.currentTarget.value)} />
      </div>
    </RecordDialog>
  )
}
