import { useEffect, useState } from 'react'

type Ping = { message: string; serverTime: string }

type PingCardProps = {
  name: string
}

export function PingCard({ name }: PingCardProps) {
  const [ping, setPing] = useState<Ping | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/ping/${encodeURIComponent(name)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setPing)
      .catch((e) => setError(e.message))
  }, [name])

  if (error) return <p>Chyba: {error}</p>
  if (!ping) return <p>Načítám…</p>

  return <p>{ping.message}</p>
}