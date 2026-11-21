import { useState } from 'react'
import { CircleCheck, Clock3, FolderKanban, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ListState } from '@/components/ListState'
import { RecordDialog } from '@/components/RecordDialog'
import { TaskDialog } from '@/components/TaskDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useResourceList } from '@/hooks/useResourceList'
import type { TrackerApi } from '@/services/api'
import { taskPriorities, taskStatuses, type Task, type TaskInput } from '@/types/tracker'

type DialogState = { type: 'create' } | { type: 'edit' | 'delete'; task: Task }

export function TasksPage({ api }: { api: TrackerApi }) {
  const tasks = useResourceList(api.listTasks)
  const projects = useResourceList(api.listProjects)
  const [dialog, setDialog] = useState<DialogState | null>(null)

  const loading = tasks.loading || projects.loading
  const error = tasks.error || projects.error
  const ready = !loading && !error
  const hasProjects = projects.items.length > 0
  const projectNames = new Map(projects.items.map((project) => [project.id, project.nome]))
  const metrics = [
    { label: 'Total de tarefas', count: tasks.items.length, icon: ListChecks, tone: 'metric-violet' },
    { label: 'Pendentes', count: tasks.items.filter((task) => task.status === 'pendente').length, icon: Clock3, tone: 'metric-amber' },
    { label: 'Em andamento', count: tasks.items.filter((task) => task.status === 'em_andamento').length, icon: Clock3, tone: 'metric-blue' },
    { label: 'Concluídas', count: tasks.items.filter((task) => task.status === 'concluida').length, icon: CircleCheck, tone: 'metric-green' },
  ]

  function retry() {
    if (tasks.error) tasks.retry()
    if (projects.error) projects.retry()
  }

  async function saveTask(values: TaskInput) {
    if (dialog?.type === 'edit') {
      const saved = await api.updateTask(dialog.task.id, values)
      tasks.setItems((current) => current.map((task) => task.id === saved.id ? saved : task))
    } else {
      const saved = await api.createTask(values)
      tasks.setItems((current) => [saved, ...current])
    }
  }

  return (
    <div className="grid gap-7">
      <header className="board-heading">
        <div>
          <h1>Tarefas</h1>
          <p>Acompanhe as prioridades e o andamento do trabalho.</p>
        </div>
        <Button type="button" size="lg" disabled={!ready || !hasProjects} onClick={() => setDialog({ type: 'create' })}>
          <Plus aria-hidden="true" /> Nova tarefa
        </Button>
      </header>

      <section aria-label="Resumo de tarefas" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {metrics.map(({ label, count, icon: Icon, tone }) => (
          <Card key={label} className="py-4">
            <CardContent className="flex flex-wrap items-center gap-3 px-4 sm:px-5">
              <span className={`metric-icon ${tone}`}><Icon className="size-5" aria-hidden="true" /></span>
              <div>
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
                <p className="text-2xl leading-tight font-semibold tracking-tight">{ready ? count : '—'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="min-w-0 gap-0 py-0">
        <header className="px-5 py-5 sm:px-6">
          <h2 className="text-lg font-semibold tracking-tight">Lista de tarefas</h2>
        </header>
        <ListState loading={loading} error={error} retry={retry}
          empty={tasks.items.length === 0 ? (
            <div className="board-state flex-col border-t">
              <span className="metric-icon metric-violet"><FolderKanban className="size-5" aria-hidden="true" /></span>
              <p className="font-medium">Nenhuma tarefa cadastrada</p>
              <p className="max-w-sm text-center text-sm text-muted-foreground">
                {hasProjects ? 'Crie uma tarefa para começar a acompanhar o trabalho.' : 'Crie seu primeiro projeto para começar a cadastrar tarefas.'}
              </p>
              {hasProjects ? (
                <Button type="button" variant="outline" onClick={() => setDialog({ type: 'create' })}>Criar tarefa</Button>
              ) : (
                <Button variant="outline" asChild><Link to="/projetos">Ir para projetos</Link></Button>
              )}
            </div>
          ) : undefined}
        >
          <Table className="border-t" aria-label="Tarefas cadastradas">
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead scope="col" className="pl-5 sm:pl-6">Tarefa</TableHead>
                <TableHead scope="col">Projeto</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Prioridade</TableHead>
                <TableHead scope="col" className="pr-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.items.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="min-w-44 max-w-sm py-3 pl-5 whitespace-normal sm:pl-6">
                    <p className="font-medium wrap-anywhere">{task.titulo}</p>
                    {task.descricao && <p className="mt-1 text-xs wrap-anywhere text-muted-foreground">{task.descricao}</p>}
                  </TableCell>
                  <TableCell className="max-w-48 whitespace-normal text-muted-foreground wrap-anywhere">
                    {projectNames.get(task.project_id) ?? task.project?.nome ?? '—'}
                  </TableCell>
                  <TableCell><Badge variant="outline" className={`tracker-badge status-${task.status}`}>{taskStatuses[task.status]}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={`tracker-badge priority-${task.prioridade}`}>{taskPriorities[task.prioridade]}</Badge></TableCell>
                  <TableCell className="pr-3 text-right">
                    <Button type="button" variant="ghost" size="icon" aria-label={`Editar tarefa ${task.titulo}`} onClick={() => setDialog({ type: 'edit', task })}>
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" aria-label={`Excluir tarefa ${task.titulo}`} onClick={() => setDialog({ type: 'delete', task })}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ListState>
      </Card>

      {dialog?.type === 'delete' ? (
        <RecordDialog title="Excluir tarefa?"
          description={`A tarefa “${dialog.task.titulo}” será excluída permanentemente.`}
          confirmLabel="Excluir tarefa" successMessage="Tarefa excluída." destructive
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            await api.deleteTask(dialog.task.id)
            tasks.setItems((current) => current.filter((task) => task.id !== dialog.task.id))
          }} />
      ) : dialog && (
        <TaskDialog task={dialog.type === 'edit' ? dialog.task : undefined}
          projects={projects.items} onSave={saveTask} onClose={() => setDialog(null)} />
      )}
    </div>
  )
}
