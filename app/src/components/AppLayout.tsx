import { FolderKanban, ListChecks, LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AppLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="tracker-sidebar flex flex-wrap items-center justify-between gap-3 p-4 lg:sticky lg:top-0 lg:h-svh lg:flex-col lg:items-stretch lg:justify-start lg:gap-12 lg:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-violet-500 text-white">
            <ListChecks className="size-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight text-white">Task Tracker</span>
        </div>
        <nav aria-label="Menu principal" className="order-last flex w-full gap-2 lg:order-none lg:flex-col">
          <NavLink to="/" end className="tracker-nav"><ListChecks aria-hidden="true" /> Tarefas</NavLink>
          <NavLink to="/projetos" className="tracker-nav"><FolderKanban aria-hidden="true" /> Projetos</NavLink>
        </nav>
        <Button type="button" variant="ghost" className="tracker-logout lg:mt-auto lg:justify-start" onClick={onLogout}>
          <LogOut aria-hidden="true" /> Sair
        </Button>
      </aside>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-10 lg:py-11">
        <Outlet />
      </main>
    </div>
  )
}
