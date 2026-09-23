import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { logout } = useAuth()

  return (
    <header className="glass sticky top-0 z-40 border-b border-white/10 bg-background/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/20 text-sm text-primary ring-1 ring-primary/30">
            ✓
          </span>
          TaskBoard
        </Link>
        <Button variant="outline" size="sm" onClick={logout}>
          Odhlásit se
        </Button>
      </div>
    </header>
  )
}
