import { useState, type SubmitEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    register(email, password)
      .then(() => navigate('/'))
      .catch((err) => setError(err.message))
      .finally(() => setIsSubmitting(false))
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="glass w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-white/[0.06] p-7">
        <div className="space-y-2 text-center">
          <div className="mx-auto grid size-10 place-items-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
            ✓
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Registrace</h1>
          <p className="text-sm text-muted-foreground">Vytvoř si účet a začni s prvním projektem.</p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input className="h-9" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
          <Input className="h-9" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Heslo (min. 8 znaků)" required />
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            Zaregistrovat se
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Už máš účet?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Přihlas se
          </Link>
        </p>
      </div>
    </div>
  )
}
