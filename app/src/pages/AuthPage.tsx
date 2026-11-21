import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ListChecks, LoaderCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signUp } from '@/services/api'

interface AuthPageProps {
  onLogin: (token: string) => void
  register?: boolean
}

export function AuthPage({ onLogin, register = false }: AuthPageProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function change(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.currentTarget
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')
    if (register && !form.nome.trim()) {
      setError('Informe seu nome.')
      return
    }

    setBusy(true)
    const credentials = { email: form.email.trim(), password: form.password }
    try {
      if (register) {
        await signUp({ ...credentials, nome: form.nome.trim() })
        toast.success('Conta criada. Entre com seu e-mail e sua senha.')
        navigate('/entrar', { replace: true })
      } else {
        const { token } = await signIn(credentials)
        onLogin(token)
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível continuar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="tracker-auth grid min-h-svh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3 font-semibold">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ListChecks className="size-5" aria-hidden="true" />
          </span>
          Task Tracker
        </div>
        <Card className="gap-6 rounded-2xl">
          <CardHeader>
            <h1 className="text-3xl font-semibold tracking-tight">{register ? 'Criar conta' : 'Entrar'}</h1>
            <p className="text-sm text-muted-foreground">
              {register ? 'Crie uma conta para organizar seus projetos.' : 'Acesse suas tarefas e projetos.'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4">
              {register && <div className="form-field">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" autoComplete="name" maxLength={100} value={form.nome} onChange={change} required />
              </div>}
              <div className="form-field">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" autoComplete="email" maxLength={150} value={form.email} onChange={change} required />
              </div>
              <div className="form-field">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 6 : undefined} value={form.password} onChange={change} required />
              </div>
              {error && <p className="tracker-error" role="alert">{error}</p>}
              <Button className="mt-1" size="lg" type="submit" disabled={busy}>
                {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}
                {register ? 'Criar conta' : 'Entrar'}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {register ? 'Já tem conta? ' : 'Ainda não tem conta? '}
              <Link className="font-medium text-primary underline underline-offset-4" to={register ? '/entrar' : '/cadastro'}>
                {register ? 'Entrar' : 'Criar conta'}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
