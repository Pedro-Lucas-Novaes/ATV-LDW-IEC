import { useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import { AppLayout } from '@/components/AppLayout'
import { Toaster } from '@/components/ui/sonner'
import { AuthPage } from '@/pages/AuthPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { TasksPage } from '@/pages/TasksPage'
import { createTrackerApi } from '@/services/api'

const storageKey = 'task-tracker-token'

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem(storageKey))

  function startSession(value: string) {
    sessionStorage.setItem(storageKey, value)
    setToken(value)
  }

  function endSession() {
    sessionStorage.removeItem(storageKey)
    setToken(null)
  }

  const api = useMemo(() => {
    if (!token) return null
    return createTrackerApi(token, () => {
      if (sessionStorage.getItem(storageKey) !== token) return
      sessionStorage.removeItem(storageKey)
      setToken((current) => (current === token ? null : current))
      toast.error('Sua sessão expirou. Entre novamente para continuar.')
    })
  }, [token])

  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/entrar" element={api ? <Navigate to="/" replace /> : <AuthPage key="login" onLogin={startSession} />} />
        <Route path="/cadastro" element={api ? <Navigate to="/" replace /> : <AuthPage key="register" onLogin={startSession} register />} />
        <Route element={api ? <AppLayout onLogout={endSession} /> : <Navigate to="/entrar" replace />}>
          <Route index element={api && <TasksPage api={api} />} />
          <Route path="/projetos" element={api && <ProjectsPage api={api} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
