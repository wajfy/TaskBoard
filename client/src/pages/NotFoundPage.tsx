import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="glass w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/[0.06] p-7 text-center">
        <p className="text-5xl font-semibold tracking-tight text-primary">404</p>
        <h1 className="text-lg font-medium">Stránka nenalezena</h1>
        <p className="text-sm text-muted-foreground">Tahle adresa neexistuje.</p>
        <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
          <ArrowLeft /> Zpět na projekty
        </Button>
      </div>
    </div>
  )
}
