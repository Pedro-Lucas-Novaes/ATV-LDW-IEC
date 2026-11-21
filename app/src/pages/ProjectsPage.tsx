import { useState } from 'react'
import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react'
import { ListState } from '@/components/ListState'
import { ProjectDialog } from '@/components/ProjectDialog'
import { RecordDialog } from '@/components/RecordDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useResourceList } from '@/hooks/useResourceList'
import type { TrackerApi } from '@/services/api'
import type { Project, ProjectInput } from '@/types/tracker'

type DialogState = { type: 'create' } | { type: 'edit' | 'delete'; project: Project }

export function ProjectsPage({ api }: { api: TrackerApi }) {
  const projects = useResourceList(api.listProjects)
  const [dialog, setDialog] = useState<DialogState | null>(null)

  async function saveProject(values: ProjectInput) {
    if (dialog?.type === 'edit') {
      const saved = await api.updateProject(dialog.project.id, values)
      projects.setItems((current) => current.map((project) => project.id === saved.id ? saved : project))
    } else {
      const saved = await api.createProject(values)
      projects.setItems((current) => [saved, ...current])
    }
  }

  return (
    <div className="grid gap-7">
      <header className="board-heading">
        <div>
          <h1>Projetos</h1>
          <p>Organize suas tarefas em projetos.</p>
        </div>
        <Button type="button" size="lg" disabled={projects.loading || Boolean(projects.error)} onClick={() => setDialog({ type: 'create' })}>
          <Plus aria-hidden="true" /> Novo projeto
        </Button>
      </header>

      <ListState loading={projects.loading} error={projects.error} retry={projects.retry}
        empty={projects.items.length === 0 ? (
          <Card className="board-state flex-col">
            <span className="metric-icon metric-violet"><FolderKanban className="size-5" aria-hidden="true" /></span>
            <p className="font-medium">Nenhum projeto cadastrado</p>
            <p className="text-center text-sm text-muted-foreground">Crie um projeto para reunir suas tarefas.</p>
            <Button type="button" variant="outline" onClick={() => setDialog({ type: 'create' })}>Criar projeto</Button>
          </Card>
        ) : undefined}
      >
        <section aria-label="Projetos cadastrados" className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.items.map((project) => (
            <Card key={project.id} className="py-5">
              <CardContent className="grid gap-4 px-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="metric-icon metric-violet"><FolderKanban className="size-5" aria-hidden="true" /></span>
                  <div className="flex">
                    <Button type="button" variant="ghost" size="icon" aria-label={`Editar projeto ${project.nome}`} onClick={() => setDialog({ type: 'edit', project })}>
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" aria-label={`Excluir projeto ${project.nome}`} onClick={() => setDialog({ type: 'delete', project })}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold wrap-anywhere">{project.nome}</h2>
                  {project.descricao && <p className="mt-1 text-sm wrap-anywhere text-muted-foreground">{project.descricao}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </ListState>

      {dialog?.type === 'delete' ? (
        <RecordDialog title="Excluir projeto?"
          description={`O projeto “${dialog.project.nome}” e suas tarefas serão excluídos permanentemente.`}
          confirmLabel="Excluir projeto" successMessage="Projeto excluído." destructive
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            await api.deleteProject(dialog.project.id)
            projects.setItems((current) => current.filter((project) => project.id !== dialog.project.id))
          }} />
      ) : dialog && (
        <ProjectDialog project={dialog.type === 'edit' ? dialog.project : undefined}
          onSave={saveProject} onClose={() => setDialog(null)} />
      )}
    </div>
  )
}
