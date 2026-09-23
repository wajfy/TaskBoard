import { useAuth } from '../auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function Navbar() {
  const { logout } = useAuth()

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link to="/" className="text-lg font-semibold">
          TaskBoard
        </Link>
        <Button variant="outline" size="sm" onClick={logout}>
          Odhlásit se
        </Button>
      </div>
    </header>
  )
}